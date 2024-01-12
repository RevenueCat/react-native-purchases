package com.revenuecat.purchases.react.ui

import android.view.View
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.yoga.YogaMeasureFunction
import com.facebook.yoga.YogaMeasureMode
import com.facebook.yoga.YogaMeasureOutput
import com.facebook.yoga.YogaNode

internal class PaywallViewShadowNode: LayoutShadowNode(), YogaMeasureFunction {
    init {
        setMeasureFunction(this)
    }

    override fun measure(
        yogaNode: YogaNode,
        width: Float,
        yogaMeasureMode: YogaMeasureMode,
        height: Float,
        yogaMeasureMode1: YogaMeasureMode
    ): Long {
        // This is needed so the footer doesn't require a fixed height
        // https://nicholasmarais1158.github.io/2017/07/React-Native-Custom-Measuring
        val measuredWidth = View.MeasureSpec.getSize(width.toInt()).toFloat()
        val measuredHeight = View.MeasureSpec.getSize(height.toInt()).toFloat()

        return YogaMeasureOutput.make(measuredWidth, measuredHeight)
    }
}
