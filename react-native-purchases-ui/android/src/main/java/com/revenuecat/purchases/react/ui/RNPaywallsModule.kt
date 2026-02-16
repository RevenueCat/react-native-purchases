package com.revenuecat.purchases.react.ui

import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
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
        promise: Promise
    ) {
        presentPaywall(
            null,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
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
        promise: Promise
    ) {
        presentPaywall(
            requiredEntitlementIdentifier,
            offeringIdentifier,
            presentedOfferingContext,
            displayCloseButton,
            fontFamily,
            customVariables,
            promise
        )
    }

    @ReactMethod
    fun resumePurchasePackageInitiated(requestId: String, shouldProceed: Boolean) {
        PaywallListenerWrapper.resumePurchasePackageInitiated(requestId, shouldProceed)
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
                    customVariables = customVariablesMap
                )
            )
        }
    }
}
