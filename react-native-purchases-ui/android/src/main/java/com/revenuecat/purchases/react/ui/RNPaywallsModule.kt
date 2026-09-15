package com.revenuecat.purchases.react.ui

import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
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

        // RCTDeviceEventEmitter is global and keyed by event name alone, so these names must not
        // collide with the ones RNCustomerCenter emits.
        private const val PRESENTED_PAYWALL_EVENT_PREFIX = "Paywalls-"

        private const val MISSING_FRAGMENT_ACTIVITY_ERROR =
            "RevenueCat paywalls require applications to use a FragmentActivity"
    }

    private val currentFragmentActivity: FragmentActivity?
        get() {
            return when (val currentActivity = reactApplicationContext.currentActivity) {
                is FragmentActivity -> currentActivity
                else -> {
                    Log.e(NAME, MISSING_FRAGMENT_ACTIVITY_ERROR)
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
        hasCallbacks: Boolean,
        promise: Promise
    ) {
        presentPaywall(
            null,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
            hasCallbacks,
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
        hasCallbacks: Boolean,
        promise: Promise
    ) {
        presentPaywall(
            requiredEntitlementIdentifier,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
            hasCallbacks,
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
        hasCallbacks: Boolean,
        promise: Promise
    ) {
        val activity = currentFragmentActivity ?: run {
            promise.reject("PAYWALLS_MISSING_WRONG_ACTIVITY", MISSING_FRAGMENT_ACTIVITY_ERROR, null)
            return
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
                    paywallListener = if (hasCallbacks) createPaywallListener() else null,
                )
            )
        }
    }

    private fun createPaywallListener() = object : PaywallListenerWrapper() {
        override fun onPurchaseStarted(rcPackage: Map<String, Any?>) {
            sendEvent(
                PaywallEventName.ON_PURCHASE_STARTED,
                WritableNativeMap().apply { putMap(PaywallEventKey.PACKAGE, rcPackage) },
            )
        }

        override fun onPurchaseCompleted(customerInfo: Map<String, Any?>, storeTransaction: Map<String, Any?>) {
            sendEvent(
                PaywallEventName.ON_PURCHASE_COMPLETED,
                WritableNativeMap().apply {
                    putMap(PaywallEventKey.CUSTOMER_INFO, customerInfo)
                    putMap(PaywallEventKey.STORE_TRANSACTION, storeTransaction)
                },
            )
        }

        override fun onPurchaseError(error: Map<String, Any?>) {
            sendEvent(
                PaywallEventName.ON_PURCHASE_ERROR,
                WritableNativeMap().apply { putMap(PaywallEventKey.ERROR, error) },
            )
        }

        override fun onPurchaseCancelled() = sendEvent(PaywallEventName.ON_PURCHASE_CANCELLED, null)

        override fun onRestoreStarted() = sendEvent(PaywallEventName.ON_RESTORE_STARTED, null)

        override fun onRestoreCompleted(customerInfo: Map<String, Any?>) {
            sendEvent(
                PaywallEventName.ON_RESTORE_COMPLETED,
                WritableNativeMap().apply { putMap(PaywallEventKey.CUSTOMER_INFO, customerInfo) },
            )
        }

        override fun onRestoreError(error: Map<String, Any?>) {
            sendEvent(
                PaywallEventName.ON_RESTORE_ERROR,
                WritableNativeMap().apply { putMap(PaywallEventKey.ERROR, error) },
            )
        }

        override fun onPurchasePackageInitiated(rcPackage: Map<String, Any?>, requestId: String) {
            sendEvent(
                PaywallEventName.ON_PURCHASE_PACKAGE_INITIATED,
                WritableNativeMap().apply {
                    putMap(PaywallEventKey.PACKAGE, rcPackage)
                    putString(PaywallEventKey.REQUEST_ID.key, requestId)
                },
            )
        }

        override fun onWebCheckoutOpened() = sendEvent(PaywallEventName.ON_WEB_CHECKOUT_OPENED, null)

        override fun onUrlOpened(url: String) {
            sendEvent(
                PaywallEventName.ON_URL_OPENED,
                WritableNativeMap().apply { putString(PaywallEventKey.URL.key, url) },
            )
        }

        override fun onInteraction(event: Map<String, Any>) {
            sendEvent(PaywallEventName.ON_INTERACTION, RNPurchasesConverters.convertMapToWriteableMap(event))
        }
    }

    private fun WritableNativeMap.putMap(key: PaywallEventKey, dictionary: Map<String, Any?>) {
        putMap(key.key, RNPurchasesConverters.convertMapToWriteableMap(dictionary))
    }

    private fun sendEvent(event: PaywallEventName, params: WritableMap?) {
        sendEvent(PRESENTED_PAYWALL_EVENT_PREFIX + event.eventName, params)
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext.runOnUiQueueThread {
            try {
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            } catch (e: Exception) {
                Log.e(NAME, "Error sending event $eventName", e)
            }
        }
    }
}
