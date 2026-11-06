package com.revenuecat.purchases.react.ui

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.hybridcommon.ui.CheckpointListener
import com.revenuecat.purchases.hybridcommon.ui.cancelErrorDialogs
import com.revenuecat.purchases.hybridcommon.ui.completePaywallPresentation as completeNativePaywallPresentation
import com.revenuecat.purchases.hybridcommon.ui.detachCheckpoint
import com.revenuecat.purchases.hybridcommon.ui.invalidateCheckpointPresentations
import com.revenuecat.purchases.hybridcommon.ui.presentCheckpoint
import com.revenuecat.purchases.hybridcommon.ui.resolveErrorDialog as resolveNativeErrorDialog

internal class RNCheckpointsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    @Volatile private var invalidated = false

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
            val listener = object : CheckpointListener {
                override fun onCheckpointPassed(result: Map<String, Any?>) {
                    emit("Checkpoints-onPassed", mapOf("callId" to callId, "result" to result))
                }

                override fun onCheckpointError(code: String, message: String) {
                    emit("Checkpoints-onError", mapOf("callId" to callId))
                }

                override fun onPaywallPresentationRequested(requestId: String, params: Map<String, Any?>) {
                    if (invalidated) {
                        completeNativePaywallPresentation(requestId, "NAVIGATED_BACK")
                        return
                    }
                    emit(
                        "Checkpoints-onPaywallPresentation",
                        mapOf("callId" to callId, "requestId" to requestId, "params" to params),
                    )
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
                useCustomPaywallPresenter = useCustomPresenter,
                hasErrorDialogFactory = hasErrorDialogFactory,
                listener = listener,
            )
        }
    }

    @ReactMethod
    fun completePaywallPresentation(requestId: String, result: String) {
        UiThreadUtil.runOnUiThread {
            completeNativePaywallPresentation(requestId, result)
        }
    }

    @ReactMethod
    fun detachPaywallPresenter(callId: String, activeRequestId: String?) {
        UiThreadUtil.runOnUiThread {
            detachCheckpoint(callId, activeRequestId)
        }
    }

    @ReactMethod
    fun resolveErrorDialog(requestId: String, outcome: ReadableMap?) {
        UiThreadUtil.runOnUiThread {
            resolveNativeErrorDialog(requestId, outcome?.toHashMap())
        }
    }

    @ReactMethod
    fun detachErrorDialogFactory(callId: String) {
        UiThreadUtil.runOnUiThread {
            cancelErrorDialogs(callId)
        }
    }

    @ReactMethod fun addListener(eventName: String) { /* Required by NativeEventEmitter. */ }
    @ReactMethod fun removeListeners(count: Int) { /* Required by NativeEventEmitter. */ }

    override fun invalidate() {
        invalidated = true
        UiThreadUtil.runOnUiThread {
            invalidateCheckpointPresentations()
        }
        super.invalidate()
    }

    private fun emit(name: String, body: Map<String, Any?>) {
        if (invalidated) return
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, RNPurchasesConverters.convertMapToWriteableMap(body))
    }
}
