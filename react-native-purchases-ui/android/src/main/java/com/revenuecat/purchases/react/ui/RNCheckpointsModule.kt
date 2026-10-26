package com.revenuecat.purchases.react.ui

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.InternalRevenueCatAPI
import com.revenuecat.purchases.hybridcommon.mappers.map
import com.revenuecat.purchases.ui.revenuecatui.CustomVariableValue
import com.revenuecat.purchases.ui.revenuecatui.InviteOnlyCheckpointsAPI
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.CheckpointParams
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.FlowPresentationMode
import com.revenuecat.purchases.ui.revenuecatui.checkpoints.checkpoint

@OptIn(InviteOnlyCheckpointsAPI::class, InternalRevenueCatAPI::class)
internal class RNCheckpointsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    @Volatile private var invalidated = false

    override fun getName(): String = "RNCheckpoints"

    @ReactMethod
    fun checkpoint(identifier: String, customVariables: ReadableMap?, presentationMode: String, callId: String) {
        UiThreadUtil.runOnUiThread {
            if (invalidated) return@runOnUiThread
            if (!Purchases.isConfigured) {
                Log.e(name, "Configure Purchases before calling a checkpoint.")
                return@runOnUiThread
            }
            val rawVariables = customVariables?.toHashMap() ?: emptyMap()
            val variables = rawVariables.mapNotNull { (key, value) ->
                val variable = when (value) {
                    is String -> CustomVariableValue.String(value)
                    is Boolean -> CustomVariableValue.Boolean(value)
                    is Number -> CustomVariableValue.Number(value.toDouble())
                    else -> null
                }
                variable?.let { key to it }
            }.toMap()
            val mode = when (presentationMode) {
                "MODAL_FULL_SCREEN" -> FlowPresentationMode.MODAL_FULL_SCREEN
                "MODAL_SHEET" -> FlowPresentationMode.MODAL_SHEET
                else -> FlowPresentationMode.DEFAULT
            }
            val params = CheckpointParams.Builder()
                .setCustomVariables(variables)
                .setPresentationMode(mode)
                .build()
            Purchases.sharedInstance.checkpoint(identifier, params) { result ->
                emit("Checkpoints-onPassed", mapOf(
                    "callId" to callId,
                    "result" to mapOf(
                        "customer" to result.customer.map(),
                        "flow" to result.flow?.let { flow -> mapOf(
                            "obtainedEntitlements" to flow.obtainedEntitlements.sortedBy { it.entitlementInfo.identifier }
                                .map { mapOf("entitlementInfo" to it.entitlementInfo.map()) },
                            "obtainedProducts" to flow.obtainedProducts.sortedBy { it.product.id }
                                .map { mapOf("product" to it.product.map()) },
                        ) },
                    ),
                ))
            }
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
