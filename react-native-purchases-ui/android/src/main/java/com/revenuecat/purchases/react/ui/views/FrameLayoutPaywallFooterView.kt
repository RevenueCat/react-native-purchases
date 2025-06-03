package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.ViewGroup
import androidx.core.view.children
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.revenuecat.purchases.react.ui.events.OnMeasureEvent
import com.revenuecat.purchases.react.ui.surfaceId
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.PaywallListener
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider
import com.revenuecat.purchases.ui.revenuecatui.views.OriginalTemplatePaywallFooterView
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallFooterView

open class FrameLayoutPaywallFooterView(context: Context) : ViewWrapperFrameLayout<OriginalTemplatePaywallFooterView>(context) {

    override fun createWrappedView(context: Context, attrs: AttributeSet?): OriginalTemplatePaywallFooterView {
        return OriginalTemplatePaywallFooterView(context, attrs)
    }

    fun setOfferingId(identifier: String) {
        wrappedView?.setOfferingId(identifier)
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
