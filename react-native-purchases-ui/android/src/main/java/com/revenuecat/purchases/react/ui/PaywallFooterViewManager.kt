package com.revenuecat.purchases.react.ui

import android.annotation.SuppressLint
import android.graphics.Canvas
import android.util.Log
import android.view.View
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

            override fun onDraw(canvas: Canvas) {
                super.onDraw(canvas)
                Log.d("RCPaywallFooterView", "onDraw")
            }

            override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
                super.onLayout(changed, left, top, right, bottom)
                Log.d("RCPaywallFooterView", "onLayout")
            }

            override fun requestLayout() {
                super.requestLayout()
                Log.d("RCPaywallFooterView", "requestLayout")
            }

            public override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
                super.onMeasure(widthMeasureSpec, heightMeasureSpec)
                Log.d("RCPaywallFooterView", "onMeasure")
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
        paywallFooterView.addOnLayoutChangeListener(object : View.OnLayoutChangeListener {
            override fun onLayoutChange(
                v: View?,
                left: Int,
                top: Int,
                right: Int,
                bottom: Int,
                oldLeft: Int,
                oldTop: Int,
                oldRight: Int,
                oldBottom: Int,
            ) {
                Log.d("RCPaywallFooterView", "onLayoutChange")
            }
        })
        return paywallFooterView
    }

}
