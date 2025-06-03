package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import com.revenuecat.purchases.Offering
import com.revenuecat.purchases.ui.revenuecatui.PaywallListener
import com.revenuecat.purchases.ui.revenuecatui.fonts.FontProvider
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallView

class FrameLayoutPaywallView : ViewWrapperFrameLayout<PaywallView> {
    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs)

    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    @JvmOverloads
    constructor(
        context: Context,
        offering: Offering? = null,
        listener: PaywallListener? = null,
        fontProvider: FontProvider? = null,
        shouldDisplayDismissButton: Boolean? = null,
        dismissHandler: (() -> Unit)? = null,
    ) : super(context) {
        wrappedView?.let { view ->
            listener?.let { view.setPaywallListener(it) }
            dismissHandler?.let { view.setDismissHandler(it) }
            offering?.let { view.setOfferingId(it.identifier) }
            fontProvider?.let { view.setFontProvider(it) }
            shouldDisplayDismissButton?.let { view.setDisplayDismissButton(it) }
        }
    }

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
