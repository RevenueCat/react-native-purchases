package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import com.revenuecat.purchases.PresentedOfferingContext
import com.revenuecat.purchases.ui.revenuecatui.CustomVariableValue
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

    fun setOfferingId(offeringId: String?, presentedOfferingContext: PresentedOfferingContext? = null) {
        wrappedView?.setOfferingId(offeringId, presentedOfferingContext)
    }

    fun setFontProvider(fontProvider: FontProvider?) {
        wrappedView?.setFontProvider(fontProvider)
    }

    fun setDisplayDismissButton(shouldDisplayDismissButton: Boolean) {
        wrappedView?.setDisplayDismissButton(shouldDisplayDismissButton)
    }

    fun setCustomVariables(customVariables: Map<String, CustomVariableValue>) {
        wrappedView?.setCustomVariables(customVariables)
    }

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
}
