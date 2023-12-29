package com.revenuecat.purchases.react.ui

import android.annotation.SuppressLint
import androidx.core.view.children
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerModule
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallFooterView

@OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
internal class PaywallFooterViewManager : SimpleViewManager<PaywallFooterView>() {
    override fun getName(): String {
        return "RCPaywallFooterView"
    }

    @SuppressLint("UnsafeOptInUsageError")
    override fun createViewInstance(themedReactContext: ThemedReactContext): PaywallFooterView {
        val paywallFooterView: PaywallFooterView = object : PaywallFooterView(themedReactContext) {
            public override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
                super.onMeasure(widthMeasureSpec, heightMeasureSpec)
                var maxWidth = 0
                var maxHeight = 0
                children.forEach {
                    it.measure(widthMeasureSpec, MeasureSpec.UNSPECIFIED)
                    maxWidth = maxWidth.coerceAtLeast(it.measuredWidth)
                    maxHeight = maxHeight.coerceAtLeast(it.measuredHeight)
                }
                val finalWidth = maxWidth.coerceAtLeast(suggestedMinimumWidth)
                val finalHeight = maxHeight.coerceAtLeast(suggestedMinimumHeight)
                setMeasuredDimension(finalWidth, finalHeight)
                (context as? ThemedReactContext)?.let { themedReactContext ->
                    themedReactContext.runOnNativeModulesQueueThread {
                        themedReactContext.getNativeModule(UIManagerModule::class.java)
                            ?.updateNodeSize(id, finalWidth, finalHeight)
                    }
                }
            }
        }
        return paywallFooterView
    }

    override fun createShadowNodeInstance(): PaywallViewShadowNode {
        return PaywallViewShadowNode()
    }

}
