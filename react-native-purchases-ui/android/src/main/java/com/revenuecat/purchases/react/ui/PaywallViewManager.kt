package com.revenuecat.purchases.react.ui

import com.facebook.react.uimanager.ThemedReactContext
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallView


internal class PaywallViewManager : BasePaywallViewManager<PaywallView>() {

    companion object {
        const val REACT_CLASS = "Paywall"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): PaywallView {
    return PaywallView(themedReactContext).apply {
        // Ensure the view is properly initialized before setting listeners
        post {
            setPaywallListener(createPaywallListenerWrapper(themedReactContext, this))
            setDismissHandler(getDismissHandler(themedReactContext, this))
            }
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
