package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import com.revenuecat.purchases.ui.revenuecatui.views.CustomerCenterView

class FrameLayoutCustomerCenterView: ViewWrapperFrameLayout<CustomerCenterView> {
    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs)

    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    @JvmOverloads
    constructor(
        context: Context,
        dismissHandler: (() -> Unit)? = null,
    ) : super(context) {
        wrappedView?.let { view ->
            dismissHandler?.let { view.setDismissHandler(it) }
        }
    }

    override fun createWrappedView(context: Context, attrs: AttributeSet?): CustomerCenterView {
        return CustomerCenterView(context, attrs)
    }

    fun setDismissHandler(dismissHandler: (() -> Unit)?) {
        wrappedView?.setDismissHandler(dismissHandler)
    }
}
