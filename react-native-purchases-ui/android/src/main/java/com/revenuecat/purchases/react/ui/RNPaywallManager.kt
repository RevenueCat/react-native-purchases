package com.revenuecat.purchases.react.ui

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

internal class RNPaywallManager : SimpleViewManager<Paywall>() {
    companion object {
        const val REACT_CLASS = "RNPaywall"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): Paywall {
        return Paywall(themedReactContext)
    }
}
