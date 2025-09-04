package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import com.revenuecat.purchases.InternalRevenueCatAPI
import com.revenuecat.purchases.PresentedOfferingContext
import com.revenuecat.purchases.ui.revenuecatui.PaywallListener
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider
import com.revenuecat.purchases.ui.revenuecatui.views.OriginalTemplatePaywallFooterView

open class WrappedPaywallFooterComposeView(context: Context) : ComposeViewWrapper<OriginalTemplatePaywallFooterView>(context) {

    override fun createWrappedView(context: Context, attrs: AttributeSet?): OriginalTemplatePaywallFooterView {
        return OriginalTemplatePaywallFooterView(context, attrs)
    }

    @OptIn(InternalRevenueCatAPI::class)
    fun setOfferingId(offeringId: String?, presentedOfferingContext: PresentedOfferingContext? = null) {
        if (offeringId == null) {
            // We'll get rid of this deprecated API usage once https://github.com/RevenueCat/purchases-android/pull/2658 is merged
            wrappedView?.setOfferingId(null)
        }
        else {
            val presentedOfferingContext = presentedOfferingContext ?: PresentedOfferingContext(offeringId)
            wrappedView?.setOfferingIdAndPresentedOfferingContext(offeringId, presentedOfferingContext)
        }
    }

    fun setFontProvider(customFontProvider: CustomFontProvider) {
        wrappedView?.setFontProvider(customFontProvider)
    }

    fun setPaywallListener(listener: PaywallListener) {
        wrappedView?.setPaywallListener(listener)
    }

    fun setDismissHandler(handler: (() -> Unit)) {
        wrappedView?.setDismissHandler(handler)
    }

}
