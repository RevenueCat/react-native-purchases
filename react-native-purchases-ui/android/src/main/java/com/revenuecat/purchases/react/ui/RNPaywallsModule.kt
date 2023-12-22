package com.revenuecat.purchases.react.ui

import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.revenuecat.purchases.hybridcommon.ui.presentPaywallFromFragment

internal class RNPaywallsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val NAME = "RNPaywalls"
    }

    private val currentActivityFragment: FragmentActivity?
        get() {
            return when (val currentActivity = currentActivity) {
                is FragmentActivity -> currentActivity
                else -> null
            }
        }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun presentPaywall() {
        presentPaywall(null)
    }

    @ReactMethod
    fun presentPaywallIfNeeded(requiredEntitlementIdentifier: String?) {
        presentPaywall(requiredEntitlementIdentifier)
    }

    private fun presentPaywall(requiredEntitlementIdentifier: String?) {
        val fragment = currentActivityFragment
            ?: // TODO: log
            return

        presentPaywallFromFragment(fragment, requiredEntitlementIdentifier)
    }
}
