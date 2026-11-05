@file:OptIn(
    com.revenuecat.purchases.InternalRevenueCatAPI::class,
    com.revenuecat.purchases.ui.revenuecatui.InviteOnlyCheckpointsAPI::class,
)

package com.revenuecat.purchases.react.ui

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.hybridcommon.mappers.map
import com.revenuecat.purchases.hybridcommon.ui.CheckpointListener
import com.revenuecat.purchases.hybridcommon.ui.cancelErrorDialogs
import com.revenuecat.purchases.hybridcommon.ui.presentCheckpoint
import com.revenuecat.purchases.hybridcommon.ui.resolveErrorDialog as resolveNativeErrorDialog
import com.revenuecat.purchases.ui.revenuecatui.CustomVariableValue
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.CheckpointErrorDialog
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.CheckpointFailureKind
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.ErrorDialogFactory
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.CheckpointParams
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.FlowPresentationMode
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.PaywallPresenter
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.checkpoint
import java.util.UUID

internal class RNCheckpointsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    @Volatile private var invalidated = false
    private class CallState {
        var presenterDetached = false
        var errorFactoryDetached = false
    }
    private data class PendingPaywall(val callId: String, val completion: PaywallPresenter.Completion)
    private data class PendingErrorDialog(val callId: String, val completion: ErrorDialogFactory.Completion)

    // All state below is accessed on the UI thread, including teardown.
    private val calls = mutableMapOf<String, CallState>()
    private val pendingPaywallCompletions = mutableMapOf<String, PendingPaywall>()
    private val pendingErrorDialogs = mutableMapOf<String, PendingErrorDialog>()

    override fun getName(): String = "RNCheckpoints"

    @ReactMethod
    fun checkpoint(
        identifier: String,
        customVariables: ReadableMap?,
        presentationMode: String,
        callId: String,
        hasErrorDialogFactory: Boolean,
        useCustomPresenter: Boolean,
    ) {
        UiThreadUtil.runOnUiThread {
            if (invalidated) return@runOnUiThread
            if (useCustomPresenter) {
                if (!Purchases.isConfigured) {
                    Log.e(TAG, "Configure Purchases before calling a checkpoint.")
                    emit("Checkpoints-onError", mapOf("callId" to callId))
                    return@runOnUiThread
                }
                val state = CallState()
                calls[callId] = state
                val builder = CheckpointParams.Builder()
                    .setCustomVariables(customVariables.toCustomVariableValues())
                    .setPresentationMode(presentationMode.toFlowPresentationMode())
                    .setPaywallPresenter(createPaywallPresenter(callId, state))
                if (hasErrorDialogFactory) builder.setErrorDialogFactory(createErrorDialogFactory(callId, state))
                Purchases.sharedInstance.checkpoint(identifier, builder.build()) { result ->
                    calls.remove(callId)
                    emit("Checkpoints-onPassed", mapOf("callId" to callId, "result" to result.toMap()))
                }
                return@runOnUiThread
            }
            val listener = object : CheckpointListener {
                override fun onCheckpointPassed(result: Map<String, Any?>) {
                    emit("Checkpoints-onPassed", mapOf("callId" to callId, "result" to result))
                }

                override fun onErrorDialogRequested(requestId: String, error: Map<String, Any?>) {
                    if (invalidated) {
                        resolveNativeErrorDialog(requestId, mapOf("type" to "useDefault"))
                        return
                    }
                    emit(
                        "Checkpoints-onErrorDialogRequested",
                        mapOf("callId" to callId, "requestId" to requestId, "error" to error),
                    )
                }
            }
            presentCheckpoint(
                identifier = identifier,
                callId = callId,
                customVariables = customVariables?.toHashMap(),
                presentationMode = presentationMode,
                useCustomPaywallPresenter = false,
                hasErrorDialogFactory = hasErrorDialogFactory,
                listener = listener,
            )
        }
    }

    @ReactMethod
    fun completePaywallPresentation(requestId: String, result: String) {
        UiThreadUtil.runOnUiThread {
            val pending = pendingPaywallCompletions.remove(requestId) ?: return@runOnUiThread
            if (result != "CONTINUED" && result != "CLOSED") calls.remove(pending.callId)
            pending.completion.complete(result.toPaywallPresentationResult())
        }
    }

    @ReactMethod
    fun detachPaywallPresenter(callId: String, activeRequestId: String?) {
        UiThreadUtil.runOnUiThread {
            calls.remove(callId)?.let {
                it.presenterDetached = true
                it.errorFactoryDetached = true
            }
            detachCustomErrorDialogFactory(callId)
            // Native may have emitted an event JS has not received yet. Only preserve delivered UI.
            val requestIds = pendingPaywallCompletions.filter { (id, pending) ->
                pending.callId == callId && id != activeRequestId
            }.keys.toList()
            requestIds.forEach { completePaywallPresentation(it, "NAVIGATED_BACK") }
        }
    }

    @ReactMethod
    fun resolveErrorDialog(requestId: String, outcome: ReadableMap?) {
        UiThreadUtil.runOnUiThread {
            val pending = pendingErrorDialogs.remove(requestId)
            if (pending == null) {
                resolveNativeErrorDialog(requestId, outcome?.toHashMap())
            } else {
                pending.completion.complete(outcome?.toHashMap().toErrorDialogOutcome())
            }
        }
    }

    @ReactMethod
    fun detachErrorDialogFactory(callId: String) {
        UiThreadUtil.runOnUiThread {
            detachCustomErrorDialogFactory(callId)
            cancelErrorDialogs(callId)
        }
    }

    @ReactMethod fun addListener(eventName: String) { /* Required by NativeEventEmitter. */ }
    @ReactMethod fun removeListeners(count: Int) { /* Required by NativeEventEmitter. */ }

    override fun invalidate() {
        invalidated = true
        UiThreadUtil.runOnUiThread {
            calls.values.forEach {
                it.presenterDetached = true
                it.errorFactoryDetached = true
            }
            calls.clear()
            // Remove entries before invoking completions, which can resume native checkpoint work.
            val paywalls = pendingPaywallCompletions.values.toList()
            pendingPaywallCompletions.clear()
            val errors = pendingErrorDialogs.values.toList()
            pendingErrorDialogs.clear()
            cancelErrorDialogs(null)
            errors.forEach { it.completion.complete(ErrorDialogFactory.Outcome.UseDefault) }
            paywalls.forEach { it.completion.complete(PaywallPresenter.Completion.Result.NavigatedBack) }
        }
        super.invalidate()
    }

    private fun createPaywallPresenter(callId: String, state: CallState) = PaywallPresenter { params, completion ->
        if (invalidated || state.presenterDetached) {
            completion.complete(PaywallPresenter.Completion.Result.NavigatedBack)
            return@PaywallPresenter
        }
        val requestId = UUID.randomUUID().toString()
        pendingPaywallCompletions[requestId] = PendingPaywall(callId, completion)
        emit(
            "Checkpoints-onPaywallPresentation",
            mapOf(
                "callId" to callId,
                "requestId" to requestId,
                "params" to mapOf(
                    "checkpointIdentifier" to params.checkpointIdentifier,
                    "customVariables" to params.customVariables.mapValues { (_, value) -> value.toPrimitive() },
                    "presentationMode" to params.presentationMode.toPresentationModeName(),
                    "offering" to params.offering.toMap(),
                ),
            ),
        )
    }

    private fun createErrorDialogFactory(callId: String, state: CallState) = ErrorDialogFactory { params, completion ->
        if (invalidated || state.errorFactoryDetached) {
            completion.complete(ErrorDialogFactory.Outcome.UseDefault)
            return@ErrorDialogFactory
        }
        val requestId = UUID.randomUUID().toString()
        pendingErrorDialogs[requestId] = PendingErrorDialog(callId, completion)
        val kind = when (params.kind) {
            CheckpointFailureKind.FLOW_COULD_NOT_BE_SHOWN -> "flowCouldNotBeShown"
            CheckpointFailureKind.FLOW_ACTION_FAILED -> "flowActionFailed"
            else -> "flowResultSyncFailed"
        }
        emit("Checkpoints-onErrorDialogRequested", mapOf(
            "callId" to callId,
            "requestId" to requestId,
            "error" to mapOf("kind" to kind, "code" to params.error.code.code, "message" to params.error.message),
        ))
    }

    private fun detachCustomErrorDialogFactory(callId: String) {
        calls[callId]?.errorFactoryDetached = true
        val requestIds = pendingErrorDialogs.filterValues { it.callId == callId }.keys.toList()
        requestIds.forEach {
            pendingErrorDialogs.remove(it)?.completion?.complete(ErrorDialogFactory.Outcome.UseDefault)
        }
    }

    private fun Map<String, Any?>?.toErrorDialogOutcome(): ErrorDialogFactory.Outcome = when (this?.get("type")) {
        "suppress" -> ErrorDialogFactory.Outcome.Suppress
        "show" -> {
            val dialog = this["dialog"] as? Map<*, *>
            val message = dialog?.get("message") as? String
            val buttonTitle = dialog?.get("buttonTitle") as? String
            if (!message.isNullOrEmpty() && !buttonTitle.isNullOrEmpty()) {
                ErrorDialogFactory.Outcome.Show(CheckpointErrorDialog(message, buttonTitle))
            } else {
                ErrorDialogFactory.Outcome.UseDefault
            }
        }
        else -> ErrorDialogFactory.Outcome.UseDefault
    }

    private fun emit(name: String, body: Map<String, Any?>) {
        if (invalidated) return
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, RNPurchasesConverters.convertMapToWriteableMap(body))
    }

    private fun ReadableMap?.toCustomVariableValues(): Map<String, CustomVariableValue> =
        this?.toHashMap()?.mapNotNull { (key, value) ->
            value.toCustomVariableValue()?.let { key to it }
        }?.toMap() ?: emptyMap()

    private fun Any?.toCustomVariableValue(): CustomVariableValue? = when (this) {
        is String -> CustomVariableValue.String(this)
        is Int -> CustomVariableValue.Number(this)
        is Double -> CustomVariableValue.Number(this)
        is Boolean -> CustomVariableValue.Boolean(this)
        else -> null
    }

    private fun CustomVariableValue.toPrimitive(): Any = when (this) {
        is CustomVariableValue.String -> value
        is CustomVariableValue.Number -> value
        is CustomVariableValue.Boolean -> value
        else -> null
    } ?: ""

    private fun String.toFlowPresentationMode(): FlowPresentationMode = when (this) {
        "MODAL_FULL_SCREEN" -> FlowPresentationMode.MODAL_FULL_SCREEN
        "MODAL_SHEET" -> FlowPresentationMode.MODAL_SHEET
        else -> FlowPresentationMode.DEFAULT
    }

    private fun FlowPresentationMode.toPresentationModeName(): String = when (this) {
        FlowPresentationMode.MODAL_FULL_SCREEN -> "MODAL_FULL_SCREEN"
        FlowPresentationMode.MODAL_SHEET -> "MODAL_SHEET"
        FlowPresentationMode.DEFAULT -> "DEFAULT"
        else -> "DEFAULT"
    }

    private fun String.toPaywallPresentationResult(): PaywallPresenter.Completion.Result = when (this) {
        "CONTINUED" -> PaywallPresenter.Completion.Result.Continued
        "CLOSED" -> PaywallPresenter.Completion.Result.Closed
        "NAVIGATED_BACK" -> PaywallPresenter.Completion.Result.NavigatedBack
        else -> PaywallPresenter.Completion.Result.NavigatedBack
    }

    private fun com.revenuecat.purchases.ui.revenuecatui.checkpoints.CheckpointResult.toMap(): Map<String, Any?> {
        val flowMap = flow?.let { flowResult ->
            mapOf(
                "obtainedEntitlements" to flowResult.obtainedEntitlements
                    .sortedBy { it.entitlementInfo.identifier }
                    .map { mapOf("entitlementInfo" to it.entitlementInfo.map()) },
                "obtainedProducts" to flowResult.obtainedProducts
                    .sortedBy { it.product.id }
                    .map { mapOf("product" to it.product.map()) },
            )
        }
        return mapOf("customer" to customer.map(), "flow" to flowMap)
    }

    private fun com.revenuecat.purchases.Offering.toMap(): Map<String, Any?> = mapOf(
        "identifier" to identifier,
        "serverDescription" to serverDescription,
        "metadata" to metadata,
        "availablePackages" to availablePackages.map { it.map() },
        "lifetime" to lifetime?.map(),
        "annual" to annual?.map(),
        "sixMonth" to sixMonth?.map(),
        "threeMonth" to threeMonth?.map(),
        "twoMonth" to twoMonth?.map(),
        "monthly" to monthly?.map(),
        "weekly" to weekly?.map(),
        "webCheckoutUrl" to webCheckoutURL?.toString(),
    )

    private companion object {
        const val TAG = "Purchases"
    }
}
