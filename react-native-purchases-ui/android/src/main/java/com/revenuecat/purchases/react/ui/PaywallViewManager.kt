package com.revenuecat.purchases.react.ui

import com.facebook.react.uimanager.ThemedReactContext
import com.revenuecat.purchases.react.ui.views.WrappedPaywallComposeView
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider


internal class PaywallViewManager : BasePaywallViewManager<WrappedPaywallComposeView>() {

    companion object {
        const val REACT_CLASS = "Paywall"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): WrappedPaywallComposeView {
        return object : WrappedPaywallComposeView(themedReactContext) {

            // Ensure the view re-measures properly after loading state changes
            // Similar logic used in PaywallFooterViewManager
            override fun requestLayout() {
                super.requestLayout()
                post(measureAndLayout)
            }

            private val measureAndLayout = Runnable {
                if (isAttachedToWindow) {
                    measure(
                        MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                        MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
                    )
                    layout(left, top, right, bottom)
                }
            }
        }.also { view ->
            view.setPaywallListener(createPaywallListenerWrapper(themedReactContext, view))
            view.setDismissHandler(getDismissHandler(themedReactContext, view))
        }
    }

    override fun createShadowNodeInstance(): PaywallViewShadowNode {
        return PaywallViewShadowNode()
    }

    override fun setOfferingId(view: WrappedPaywallComposeView, identifier: String) {
        view.setOfferingId(identifier)
    }

    override fun setFontFamily(view: WrappedPaywallComposeView, customFontProvider: CustomFontProvider) {
        view.setFontProvider(customFontProvider)
    }

    override fun setDisplayDismissButton(view: WrappedPaywallComposeView, display: Boolean) {
        view.setDisplayDismissButton(display)
    }

}
