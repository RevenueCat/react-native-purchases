package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import com.revenuecat.purchases.ui.revenuecatui.PaywallListener
import com.revenuecat.purchases.ui.revenuecatui.fonts.FontProvider
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallView

class WrappedPaywallComposeView(context: Context) : ComposeViewWrapper<PaywallView>(context) {

    override fun createWrappedView(context: Context, attrs: AttributeSet?): PaywallView {
        return PaywallView(context, attrs)
    }

    fun setPaywallListener(listener: PaywallListener?) {
        wrappedView?.setPaywallListener(listener)
    }

    fun setDismissHandler(dismissHandler: (() -> Unit)?) {
        wrappedView?.setDismissHandler(dismissHandler)
    }

    fun setOfferingId(offeringId: String?) {
        wrappedView?.setOfferingId(offeringId)
    }

    fun setFontProvider(fontProvider: FontProvider?) {
        wrappedView?.setFontProvider(fontProvider)
    }

    fun setDisplayDismissButton(shouldDisplayDismissButton: Boolean) {
        wrappedView?.setDisplayDismissButton(shouldDisplayDismissButton)
    }
}
