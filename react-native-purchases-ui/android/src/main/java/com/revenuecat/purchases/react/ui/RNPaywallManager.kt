package com.revenuecat.purchases.react.ui

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallView

@OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
internal class RNPaywallManager : SimpleViewManager<PaywallView>() {
    companion object {
        const val REACT_CLASS = "RNPaywall"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): PaywallView {
        return PaywallView(themedReactContext)
    }
}
