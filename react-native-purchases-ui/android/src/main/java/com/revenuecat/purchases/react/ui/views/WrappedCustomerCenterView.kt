package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.View
import com.revenuecat.purchases.ui.revenuecatui.views.CustomerCenterView

class WrappedCustomerCenterView(context: Context) : ComposeViewWrapper<CustomerCenterView>(context) {

    override fun createWrappedView(context: Context, attrs: AttributeSet?): CustomerCenterView {
        return CustomerCenterView(context, attrs)
    }

    fun setDismissHandler(dismissHandler: (() -> Unit)?) {
        wrappedView?.setDismissHandler(dismissHandler)
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
