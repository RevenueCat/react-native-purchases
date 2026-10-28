package com.revenuecat.purchases.react.ui

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.hybridcommon.ui.CheckpointListener
import com.revenuecat.purchases.hybridcommon.ui.presentCheckpoint

internal class RNCheckpointsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    @Volatile private var invalidated = false

    override fun getName(): String = "RNCheckpoints"

    @ReactMethod
    fun checkpoint(identifier: String, customVariables: ReadableMap?, presentationMode: String, callId: String) {
        UiThreadUtil.runOnUiThread {
            if (invalidated) return@runOnUiThread
            presentCheckpoint(
                identifier,
                customVariables?.toHashMap(),
                presentationMode,
                object : CheckpointListener {
                    override fun onCheckpointPassed(result: Map<String, Any?>) {
                        emit("Checkpoints-onPassed", mapOf("callId" to callId, "result" to result))
                    }
                },
            )
        }
    }

    @ReactMethod fun addListener(eventName: String) { /* Required by NativeEventEmitter. */ }
    @ReactMethod fun removeListeners(count: Int) { /* Required by NativeEventEmitter. */ }

    override fun invalidate() {
        invalidated = true
        super.invalidate()
    }

    private fun emit(name: String, body: Map<String, Any?>) {
        if (invalidated) return
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, RNPurchasesConverters.convertMapToWriteableMap(body))
    }
}
