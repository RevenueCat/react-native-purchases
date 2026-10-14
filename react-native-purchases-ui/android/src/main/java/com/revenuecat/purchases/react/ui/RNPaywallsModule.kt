package com.revenuecat.purchases.react.ui

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.UiThreadUtil
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.ui.revenuecatui.InviteOnlyCheckpointsAPI
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.CheckpointParams
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.ErrorPresenter
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.FlowPresentationMode
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.checkpoint
import java.lang.ref.WeakReference
import java.util.UUID
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.hybridcommon.ui.HybridPurchaseLogicBridge
import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper
import com.revenuecat.purchases.hybridcommon.ui.PaywallResultListener
import com.revenuecat.purchases.hybridcommon.ui.PaywallSource
import com.revenuecat.purchases.hybridcommon.ui.PresentPaywallOptions
import com.revenuecat.purchases.hybridcommon.ui.presentPaywallFromFragment


@OptIn(InviteOnlyCheckpointsAPI::class)
internal class RNPaywallsModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNPaywalls"

        // RCTDeviceEventEmitter is global and keyed by event name alone, so these names must not
        // collide with the ones RNCustomerCenter emits.
        private const val PRESENTED_PAYWALL_EVENT_PREFIX = "Paywalls-"
        private const val PRESENTATION_ID_KEY = "presentationId"

        private const val MISSING_ACTIVITY_ERROR =
            "RevenueCat paywalls can only be presented while there is a current activity"
        private const val MISSING_FRAGMENT_ACTIVITY_ERROR =
            "RevenueCat paywalls require applications to use a FragmentActivity"
    }

    // A presented paywall outlives a JS reload. On the New Architecture the old context reports the new
    // runtime as active and routes events into it, so liveness has to come from this module's own teardown.
    @Volatile
    private var isInvalidated = false

    override fun getName(): String {
        return NAME
    }

    override fun invalidate() {
        isInvalidated = true
        UiThreadUtil.runOnUiThread {
            val outstanding = checkpointRequests.toMap()
            checkpointRequests.clear()
            // Explicit reload policy, not SDK behavior: navigate back after releasing retained requests.
            // A multi-step flow may remain on the previous step; there is no public cancel-flow hook.
            outstanding.forEach { (requestId, request) ->
                checkpointCompletionCount++
                Log.i(NAME, "[CheckpointTest native] invalidate requestId=$requestId action=NAVIGATE_BACK pending=0 completionCount=$checkpointCompletionCount")
                request.completion.complete(ErrorPresenter.Completion.Result.NavigateBack)
            }
        }
        super.invalidate()
    }

    @ReactMethod
    fun logCheckpointForTest(message: String) {
        Log.i(NAME, "[CheckpointTest JS] $message")
    }

    // Throwaway runtime adapter. None of these entry points is a public TypeScript API.
    private data class CheckpointRequest(val flowId: String, val completion: ErrorPresenter.Completion)
    private val checkpointRequests = mutableMapOf<String, CheckpointRequest>()
    private var checkpointCompletionCount = 0

    @ReactMethod
    fun checkpointForTest(identifier: String, mode: String) = checkpointTest(identifier, mode, false)

    @ReactMethod
    fun checkpointDefaultForTest(identifier: String, mode: String) = checkpointTest(identifier, mode, true)

    private fun checkpointTest(identifier: String, mode: String, useDefaultPresenter: Boolean) {
        UiThreadUtil.runOnUiThread {
            if (isInvalidated || (mode != "sheet" && mode != "fullscreen")) return@runOnUiThread
            val flowId = UUID.randomUUID().toString()
            val weakModule = WeakReference(this)
            val builder = CheckpointParams.Builder().setPresentationMode(
                if (mode == "fullscreen") FlowPresentationMode.MODAL_FULL_SCREEN else FlowPresentationMode.MODAL_SHEET
            )
            if (!useDefaultPresenter) {
                builder.setErrorPresenter(ErrorPresenter { params, completion ->
                    UiThreadUtil.runOnUiThread {
                        val module = weakModule.get()
                        if (module == null || module.isInvalidated) {
                            completion.complete(ErrorPresenter.Completion.Result.NavigateBack)
                        } else {
                            val requestId = UUID.randomUUID().toString()
                            module.checkpointRequests[requestId] = CheckpointRequest(flowId, completion)
                            Log.i(NAME, "[CheckpointTest native] presenter requestId=$requestId flowCanContinue=${params.flowCanContinue} pending=${module.checkpointRequests.size} completionCount=${module.checkpointCompletionCount}")
                            val error = Arguments.createMap().apply {
                                putString("message", params.error.message)
                                putInt("code", params.error.code.code)
                            }
                            val event = Arguments.createMap().apply {
                                putString("requestId", requestId)
                                putString("checkpointIdentifier", params.checkpointIdentifier)
                                putMap("error", error)
                                putBoolean("flowCanContinue", params.flowCanContinue)
                            }
                            module.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                                .emit("checkpointErrorForTest", event)
                        }
                    }
                })
            }
            Log.i(NAME, "[CheckpointTest native] start mode=$mode defaultPresenter=$useDefaultPresenter")
            Purchases.sharedInstance.checkpoint(identifier, builder.build()) { result ->
                UiThreadUtil.runOnUiThread {
                    val module = weakModule.get()
                    if (module != null && !module.isInvalidated) {
                        // Back suppresses onPassed: this is not a complete terminal lifecycle observer.
                        module.checkpointRequests.entries.removeAll { it.value.flowId == flowId }
                        Log.i(NAME, "[CheckpointTest native] onPassed resultIsNull=${result == null} pending=${module.checkpointRequests.size} completionCount=${module.checkpointCompletionCount}")
                        val event = Arguments.createMap().apply {
                            putString("checkpointIdentifier", identifier)
                            if (result == null) putNull("obtainedEntitlementIdentifiers")
                            else putArray("obtainedEntitlementIdentifiers", Arguments.fromList(
                                result.obtainedEntitlements.map { it.entitlementInfo.identifier }.sorted()
                            ))
                        }
                        module.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            .emit("checkpointPassedForTest", event)
                    }
                }
            }
        }
    }

    @ReactMethod
    fun completeCheckpointErrorForTest(requestId: String, action: String) {
        UiThreadUtil.runOnUiThread {
            val result = when (action) {
                "RETRY" -> ErrorPresenter.Completion.Result.Retry
                "CONTINUE" -> ErrorPresenter.Completion.Result.Continue
                "NAVIGATE_BACK" -> ErrorPresenter.Completion.Result.NavigateBack
                else -> {
                    Log.w(NAME, "[CheckpointTest native] rejected unknown action requestId=$requestId pending=${checkpointRequests.size}")
                    return@runOnUiThread
                }
            }
            val request = checkpointRequests.remove(requestId)
            if (request == null) {
                Log.i(NAME, "[CheckpointTest native] ignored unknown requestId=$requestId pending=${checkpointRequests.size} completionCount=$checkpointCompletionCount")
                return@runOnUiThread
            }
            checkpointCompletionCount++
            Log.i(NAME, "[CheckpointTest native] completion requestId=$requestId action=$action pending=${checkpointRequests.size} completionCount=$checkpointCompletionCount")
            request.completion.complete(result)
        }
    }

    @ReactMethod
    fun presentPaywall(
        offeringIdentifier: String?,
        presentedOfferingContext: ReadableMap?,
        displayCloseButton: Boolean?,
        fontFamily: String?,
        customVariables: ReadableMap?,
        presentationId: String?,
        jsResumesPurchase: Boolean,
        promise: Promise
    ) {
        presentPaywall(
            null,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
            presentationId,
            jsResumesPurchase,
            promise
        )
    }

    @ReactMethod
    fun presentPaywallIfNeeded(
        requiredEntitlementIdentifier: String,
        offeringIdentifier: String?,
        presentedOfferingContext: ReadableMap?,
        displayCloseButton: Boolean,
        fontFamily: String?,
        customVariables: ReadableMap?,
        presentationId: String?,
        jsResumesPurchase: Boolean,
        promise: Promise
    ) {
        presentPaywall(
            requiredEntitlementIdentifier,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
            presentationId,
            jsResumesPurchase,
            promise
        )
    }

    @ReactMethod
    fun resumePurchasePackageInitiated(requestId: String, shouldProceed: Boolean) {
        PaywallListenerWrapper.resumePurchasePackageInitiated(requestId, shouldProceed)
    }

    @ReactMethod
    fun resolvePurchaseLogicResult(requestId: String, result: String, errorMessage: String?) {
        HybridPurchaseLogicBridge.resolveResult(requestId, result, errorMessage)
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private fun presentPaywall(
        requiredEntitlementIdentifier: String?,
        offeringIdentifier: String?,
        presentedOfferingContext: ReadableMap?,
        displayCloseButton: Boolean?,
        fontFamilyName: String?,
        customVariables: ReadableMap?,
        presentationId: String?,
        jsResumesPurchase: Boolean,
        promise: Promise
    ) {
        val activity = when (val currentActivity = reactApplicationContext.currentActivity) {
            is FragmentActivity -> currentActivity
            else -> {
                val message = if (currentActivity == null) MISSING_ACTIVITY_ERROR else MISSING_FRAGMENT_ACTIVITY_ERROR
                Log.e(NAME, message)
                promise.reject("PAYWALLS_MISSING_WRONG_ACTIVITY", message, null)
                return
            }
        }
        val fontFamily = fontFamilyName?.let {
            FontAssetManager.getPaywallFontFamily(fontFamilyName = it, activity.resources.assets)
        }

        val paywallSource: PaywallSource = offeringIdentifier?.let { offeringIdentifier ->
            val presentedOfferingContextMap = RNPurchasesConverters.presentedOfferingContext(offeringIdentifier, presentedOfferingContext?.toHashMap())
            PaywallSource.OfferingIdentifierWithPresentedOfferingContext(offeringIdentifier, presentedOfferingContext=presentedOfferingContextMap)
        } ?: PaywallSource.DefaultOffering

        val customVariablesMap = customVariables?.let { cv ->
            val result = mutableMapOf<String, Any>()
            val iterator = cv.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                when (cv.getType(key)) {
                    // getString returns String? (nullable), while getDouble/getBoolean return primitives
                    ReadableType.String -> cv.getString(key)?.let { result[key] = it }
                    ReadableType.Number -> result[key] = cv.getDouble(key)
                    ReadableType.Boolean -> result[key] = cv.getBoolean(key)
                    else -> { /* unsupported type, skip */ }
                }
            }
            result.takeIf { it.isNotEmpty() }
        }

        // @ReactMethod is not guaranteed to run on the main thread
        activity.runOnUiThread {
            presentPaywallFromFragment(
                activity = activity,
                PresentPaywallOptions(
                    requiredEntitlementIdentifier = requiredEntitlementIdentifier,
                    shouldDisplayDismissButton = displayCloseButton,
                    paywallSource = paywallSource,
                    paywallResultListener = object : PaywallResultListener {
                        override fun onPaywallResult(paywallResult: String) {
                            promise.resolve(paywallResult)
                        }
                    },
                    fontFamily = fontFamily,
                    customVariables = customVariablesMap,
                    paywallListener = presentationId?.let { routedPresentationId ->
                        paywallEventListener(
                            jsResumesPurchase = { jsResumesPurchase && !isInvalidated },
                        ) { eventName, payload -> sendEvent(routedPresentationId, eventName, payload) }
                    },
                )
            )
        }
    }

    private fun sendEvent(presentationId: String, event: PaywallEventName, params: Map<String, Any?>) {
        if (isInvalidated) return
        val eventName = PRESENTED_PAYWALL_EVENT_PREFIX + event.eventName
        val payload = RNPurchasesConverters.convertMapToWriteableMap(params + (PRESENTATION_ID_KEY to presentationId))
        reactApplicationContext.runOnUiQueueThread {
            try {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, payload)
            } catch (e: Exception) {
                Log.e(NAME, "Error sending event $eventName", e)
            }
        }
    }
}
