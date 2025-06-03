package com.revenuecat.purchases.react.ui

import com.facebook.react.uimanager.ThemedReactContext
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider
import com.revenuecat.purchases.react.ui.views.FrameLayoutPaywallView


internal class PaywallViewManager : BasePaywallViewManager<FrameLayoutPaywallView>() {

    companion object {
        const val REACT_CLASS = "Paywall"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): FrameLayoutPaywallView {
        return FrameLayoutPaywallView(themedReactContext).also { view ->
            view.setPaywallListener(createPaywallListenerWrapper(themedReactContext, view))
            view.setDismissHandler(getDismissHandler(themedReactContext, view))
        }
    }

    override fun createShadowNodeInstance(): PaywallViewShadowNode {
        return PaywallViewShadowNode()
    }

    override fun setOfferingId(view: FrameLayoutPaywallView, identifier: String) {
        view.setOfferingId(identifier)
    }

    override fun setFontFamily(view: FrameLayoutPaywallView, customFontProvider: CustomFontProvider) {
        view.setFontProvider(customFontProvider)
    }

    override fun setDisplayDismissButton(view: FrameLayoutPaywallView, display: Boolean) {
        view.setDisplayDismissButton(display)
    }

}
