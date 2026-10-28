package com.revenuecat.purchases.react.ui

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.hybridcommon.ui.CheckpointListener
import com.revenuecat.purchases.hybridcommon.ui.cancelErrorDialogs
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
    ) {
        UiThreadUtil.runOnUiThread {
            if (invalidated) return@runOnUiThread
            val listener = object : CheckpointListener {
                override fun onCheckpointPassed(result: Map<String, Any?>) {
                    emit("Checkpoints-onPassed", mapOf("callId" to callId, "result" to result))
                }

                override fun onErrorDialogRequested(requestId: String, error: Map<String, Any?>) {
                    if (invalidated) {
                        resolveNativeErrorDialog(requestId, null)
                        return
                    }
                    emit(
                        "Checkpoints-onErrorDialogRequested",
                        mapOf("callId" to callId, "requestId" to requestId, "error" to error),
                    )
                }
            }
            if (hasErrorDialogFactory) {
                presentCheckpoint(identifier, callId, customVariables?.toHashMap(), presentationMode, listener)
            } else {
                presentCheckpoint(identifier, customVariables?.toHashMap(), presentationMode, listener)
            }
        }
    }

    @ReactMethod
    fun resolveErrorDialog(requestId: String, dialog: ReadableMap?) {
        resolveNativeErrorDialog(requestId, dialog?.toHashMap())
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
        super.invalidate()
    }

    private fun emit(name: String, body: Map<String, Any?>) {
        if (invalidated) return
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, RNPurchasesConverters.convertMapToWriteableMap(body))
    }
}
