package com.revenuecat.purchases.react.ui

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallView

@OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
internal class PaywallViewManager : SimpleViewManager<PaywallView>() {
    companion object {
        const val REACT_CLASS = "Paywall"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): PaywallView {
        return PaywallView(themedReactContext)
    }

    override fun createShadowNodeInstance(): PaywallViewShadowNode {
        return PaywallViewShadowNode()
    }

    @ReactProp(name = "options")
    fun setOptions(view: PaywallView, options: ReadableMap?) {
        options?.let { props ->
            if (props.hasKey("offering")) {
                props.getDynamic("offering").asMap()?.let { offeringMap ->
                    if (offeringMap.hasKey("identifier")) {
                        view.setOfferingId(offeringMap.getString("identifier"))
                    }
                }

            }
        }
    }
}
