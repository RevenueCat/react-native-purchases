package com.revenuecat.purchases.react.ui

import com.facebook.react.uimanager.ThemedReactContext
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallView


@OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
internal class PaywallViewManager : BasePaywallViewManager<PaywallView>() {

    companion object {
        const val REACT_CLASS = "Paywall"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): PaywallView {
        return PaywallView(themedReactContext).also { view ->
            view.setPaywallListener(createPaywallListenerWrapper(themedReactContext, view))
            view.setDismissHandler(getDismissHandler(themedReactContext, view))
        }
    }

    override fun createShadowNodeInstance(): PaywallViewShadowNode {
        return PaywallViewShadowNode()
    }

    override fun setOfferingId(view: PaywallView, identifier: String) {
        view.setOfferingId(identifier)
    }

    override fun setFontFamily(view: PaywallView, customFontProvider: CustomFontProvider) {
        view.setFontProvider(customFontProvider)
    }

    override fun setDisplayDismissButton(view: PaywallView, display: Boolean) {
        view.setDisplayDismissButton(display)
    }

}
