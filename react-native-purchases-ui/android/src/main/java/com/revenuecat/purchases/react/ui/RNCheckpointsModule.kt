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
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.CheckpointParams
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.FlowPresentationMode
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.PaywallPresenter
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.checkpoint
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

internal class RNCheckpointsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    @Volatile private var invalidated = false
    private val pendingPaywallCompletions = ConcurrentHashMap<String, PaywallPresenter.Completion>()

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
                val builder = CheckpointParams.Builder()
                    .setCustomVariables(customVariables.toCustomVariableValues())
                    .setPresentationMode(presentationMode.toFlowPresentationMode())
                    .setPaywallPresenter(createPaywallPresenter(callId))
                Purchases.sharedInstance.checkpoint(identifier, builder.build()) { result ->
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
            val completion = pendingPaywallCompletions.remove(requestId) ?: return@runOnUiThread
            completion.complete(result.toPaywallPresentationResult())
        }
    }

    @ReactMethod
    fun resolveErrorDialog(requestId: String, outcome: ReadableMap?) {
        resolveNativeErrorDialog(requestId, outcome?.toHashMap())
    }

    @ReactMethod
    fun detachErrorDialogFactory(callId: String) {
        cancelErrorDialogs(callId)
    }

    @ReactMethod fun addListener(eventName: String) { /* Required by NativeEventEmitter. */ }
    @ReactMethod fun removeListeners(count: Int) { /* Required by NativeEventEmitter. */ }

    override fun invalidate() {
        invalidated = true
        // Nothing will answer pending dialog requests after a reload, so show the default dialogs.
        cancelErrorDialogs(null)
        pendingPaywallCompletions.clear()
        super.invalidate()
    }

    private fun createPaywallPresenter(callId: String) = PaywallPresenter { params, completion ->
        if (invalidated) return@PaywallPresenter
        val requestId = UUID.randomUUID().toString()
        pendingPaywallCompletions[requestId] = completion
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
