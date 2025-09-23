package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import android.view.View
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.customercenter.CustomerCenterListener
import com.revenuecat.purchases.ui.revenuecatui.views.CustomerCenterView

class WrappedCustomerCenterView(context: Context) : ComposeViewWrapper<CustomerCenterView>(context) {

    private var previousCustomerCenterListener: CustomerCenterListener? = null
    private var customerCenterListener: CustomerCenterListener? = null

    override fun createWrappedView(context: Context, attrs: AttributeSet?): CustomerCenterView {
        return CustomerCenterView(context, attrs)
    }

    fun setDismissHandler(dismissHandler: (() -> Unit)?) {
        wrappedView?.setDismissHandler(dismissHandler)
    }

    fun registerCustomerCenterListener(listener: CustomerCenterListener) {
        val purchases = Purchases.sharedInstance
        if (customerCenterListener == null) {
            previousCustomerCenterListener = purchases.customerCenterListener
        }
        customerCenterListener = listener
        purchases.customerCenterListener = listener
    }

    fun unregisterCustomerCenterListener() {
        val purchases = Purchases.sharedInstance
        if (customerCenterListener != null && purchases.customerCenterListener === customerCenterListener) {
            purchases.customerCenterListener = previousCustomerCenterListener
        }
        customerCenterListener = null
        previousCustomerCenterListener = null
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        unregisterCustomerCenterListener()
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
