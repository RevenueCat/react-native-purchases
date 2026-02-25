package com.revenuecat.purchases.react.ui

import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.revenuecat.purchases.hybridcommon.ui.HybridPurchaseLogicBridge
import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper
import com.revenuecat.purchases.hybridcommon.ui.PaywallResultListener
import com.revenuecat.purchases.hybridcommon.ui.PaywallSource
import com.revenuecat.purchases.hybridcommon.ui.PresentPaywallOptions
import com.revenuecat.purchases.hybridcommon.ui.presentPaywallFromFragment


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
            hasPurchaseLogic,
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

    // MARK: - Internal

    private fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun createPurchaseLogicBridge(): HybridPurchaseLogicBridge {
        return HybridPurchaseLogicBridge(
            onPerformPurchase = { eventData ->
                Handler(Looper.getMainLooper()).post {
                    sendEvent("onPerformPurchaseRequest", Arguments.makeNativeMap(
                        eventData.mapValues { it.value }
                    ))
                }
            },
            onPerformRestore = { eventData ->
                Handler(Looper.getMainLooper()).post {
                    sendEvent("onPerformRestoreRequest", Arguments.makeNativeMap(
                        eventData.mapValues { it.value }
                    ))
                }
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
                    purchaseLogic = purchaseLogic,
                )
            )
        }
    }
}
