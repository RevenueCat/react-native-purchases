package com.revenuecat.purchases.react.ui

import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.hybridcommon.ui.HybridPurchaseLogicBridge
import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper
import com.revenuecat.purchases.hybridcommon.ui.PaywallResultListener
import com.revenuecat.purchases.hybridcommon.ui.PaywallSource
import com.revenuecat.purchases.hybridcommon.ui.PresentPaywallOptions
import com.revenuecat.purchases.hybridcommon.ui.presentPaywallFromFragment
import org.json.JSONObject


internal class RNPaywallsModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNPaywalls"
    }

    private val currentFragmentActivity: FragmentActivity?
        get() {
            return when (val currentActivity = reactApplicationContext.currentActivity) {
                is FragmentActivity -> currentActivity
                else -> {
                    Log.e(NAME, "RevenueCat paywalls require applications to use a FragmentActivity")
                    null
                }
            }
        }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun presentPaywall(
        offeringIdentifier: String?,
        presentedOfferingContext: ReadableMap?,
        displayCloseButton: Boolean?,
        fontFamily: String?,
        customVariables: ReadableMap?,
        hasPaywallListener: Boolean,
        hasPurchaseLogic: Boolean,
        promise: Promise
    ) {
        presentPaywallInternal(
            null,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
            hasPaywallListener,
            hasPurchaseLogic,
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
        hasPaywallListener: Boolean,
        hasPurchaseLogic: Boolean,
        promise: Promise
    ) {
        presentPaywallInternal(
            requiredEntitlementIdentifier,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
            hasPaywallListener,
            hasPurchaseLogic,
            promise
        )
    }

    // MARK: - Resume methods

    @ReactMethod
    fun resumePurchasePackageInitiated(requestId: String, shouldProceed: Boolean) {
        PaywallListenerWrapper.resumePurchasePackageInitiated(requestId, shouldProceed)
    }

    @ReactMethod
    fun resumePurchaseLogicPurchase(requestId: String, result: String, error: ReadableMap?) {
        val errorMessage = error?.getString("message")
        HybridPurchaseLogicBridge.resolveResult(requestId, result, errorMessage)
    }

    @ReactMethod
    fun resumePurchaseLogicRestore(requestId: String, result: String, error: ReadableMap?) {
        val errorMessage = error?.getString("message")
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

    // MARK: - Internal

    private fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun createPaywallListenerWrapper(): PaywallListenerWrapper {
        return object : PaywallListenerWrapper() {
            override fun onPurchaseStarted(rcPackage: Map<String, Any?>) {
                sendEvent("onPurchaseStarted", Arguments.makeNativeMap(
                    mapOf("packageBeingPurchased" to Arguments.makeNativeMap(rcPackage.mapValues { it.value }))
                ))
            }

            override fun onPurchaseCompleted(
                customerInfo: Map<String, Any?>,
                storeTransaction: Map<String, Any?>,
            ) {
                sendEvent("onPurchaseCompleted", Arguments.makeNativeMap(mapOf(
                    "customerInfo" to Arguments.makeNativeMap(customerInfo.mapValues { it.value }),
                    "storeTransaction" to Arguments.makeNativeMap(storeTransaction.mapValues { it.value }),
                )))
            }

            override fun onPurchaseError(error: Map<String, Any?>) {
                sendEvent("onPurchaseError", Arguments.makeNativeMap(
                    mapOf("error" to Arguments.makeNativeMap(error.mapValues { it.value }))
                ))
            }

            override fun onPurchaseCancelled() {
                sendEvent("onPurchaseCancelled", null)
            }

            override fun onRestoreStarted() {
                sendEvent("onRestoreStarted", null)
            }

            override fun onRestoreCompleted(customerInfo: Map<String, Any?>) {
                sendEvent("onRestoreCompleted", Arguments.makeNativeMap(
                    mapOf("customerInfo" to Arguments.makeNativeMap(customerInfo.mapValues { it.value }))
                ))
            }

            override fun onRestoreError(error: Map<String, Any?>) {
                sendEvent("onRestoreError", Arguments.makeNativeMap(
                    mapOf("error" to Arguments.makeNativeMap(error.mapValues { it.value }))
                ))
            }

            override fun onPurchasePackageInitiated(rcPackage: Map<String, Any?>, requestId: String) {
                sendEvent("onPurchaseInitiated", Arguments.makeNativeMap(mapOf(
                    "package" to Arguments.makeNativeMap(rcPackage.mapValues { it.value }),
                    "requestId" to requestId,
                )))
            }
        }
    }

    private fun createPurchaseLogicBridge(): HybridPurchaseLogicBridge {
        return HybridPurchaseLogicBridge(
            onPerformPurchase = { eventData ->
                sendEvent("onPerformPurchaseRequest", Arguments.makeNativeMap(
                    eventData.mapValues { it.value }
                ))
            },
            onPerformRestore = { eventData ->
                sendEvent("onPerformRestoreRequest", Arguments.makeNativeMap(
                    eventData.mapValues { it.value }
                ))
            },
        )
    }

    private fun presentPaywallInternal(
        requiredEntitlementIdentifier: String?,
        offeringIdentifier: String?,
        presentedOfferingContext: ReadableMap?,
        displayCloseButton: Boolean?,
        fontFamilyName: String?,
        customVariables: ReadableMap?,
        hasPaywallListener: Boolean,
        hasPurchaseLogic: Boolean,
        promise: Promise
    ) {
        val activity = currentFragmentActivity ?: return
        val fontFamily = fontFamilyName?.let {
            FontAssetManager.getPaywallFontFamily(fontFamilyName = it, activity.resources.assets)
        }

        val paywallSource: PaywallSource = offeringIdentifier?.let { offeringIdentifier ->
            val presentedOfferingContextMap = RNPurchasesConverters.presentedOfferingContext(offeringIdentifier, presentedOfferingContext?.toHashMap())
            PaywallSource.OfferingIdentifierWithPresentedOfferingContext(offeringIdentifier, presentedOfferingContext=presentedOfferingContextMap)
        } ?: PaywallSource.DefaultOffering

        val customVariablesMap = customVariables?.let { cv ->
            val result = mutableMapOf<String, String>()
            val iterator = cv.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                cv.getString(key)?.let { result[key] = it }
            }
            result.takeIf { it.isNotEmpty() }
        }

        val listener = if (hasPaywallListener) createPaywallListenerWrapper() else null
        val purchaseLogic = if (hasPurchaseLogic) createPurchaseLogicBridge() else null

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
                    paywallListener = listener,
                    purchaseLogic = purchaseLogic,
                )
            )
        }
    }
}
