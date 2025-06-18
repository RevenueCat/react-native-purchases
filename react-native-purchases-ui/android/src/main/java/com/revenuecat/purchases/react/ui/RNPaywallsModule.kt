package com.revenuecat.purchases.react.ui

import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
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
            return when (val currentActivity = currentActivity) {
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
        displayCloseButton: Boolean?,
        fontFamily: String?,
        promise: Promise
    ) {
        presentPaywall(
            null,
            offeringIdentifier,
            displayCloseButton,
            fontFamily,
            promise
        )
    }

    @ReactMethod
    fun presentPaywallIfNeeded(
        requiredEntitlementIdentifier: String,
        offeringIdentifier: String?,
        displayCloseButton: Boolean,
        fontFamily: String?,
        promise: Promise
    ) {
        presentPaywall(
            requiredEntitlementIdentifier,
            offeringIdentifier,
            displayCloseButton,
            fontFamily,
            promise
        )
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
        displayCloseButton: Boolean?,
        fontFamilyName: String?,
        promise: Promise
    ) {
        val activity = currentFragmentActivity ?: return
        val fontFamily = fontFamilyName?.let {
            FontAssetManager.getPaywallFontFamily(fontFamilyName = it, activity.resources.assets)
        }
        presentPaywallFromFragment(
            activity = activity,
            PresentPaywallOptions(
                requiredEntitlementIdentifier = requiredEntitlementIdentifier,
                shouldDisplayDismissButton = displayCloseButton,
                paywallSource = offeringIdentifier?.let {
                    PaywallSource.OfferingIdentifier(it)
                } ?: PaywallSource.DefaultOffering,
                paywallResultListener = object : PaywallResultListener {
                    override fun onPaywallResult(paywallResult: String) {
                        promise.resolve(paywallResult)
                    }
                },
                fontFamily = fontFamily
            )
        )
    }
}
