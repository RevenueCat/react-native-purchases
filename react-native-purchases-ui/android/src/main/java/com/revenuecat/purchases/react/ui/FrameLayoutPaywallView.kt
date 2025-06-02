package com.revenuecat.purchases.ui.revenuecatui.views

import android.content.Context
import android.util.AttributeSet
import android.view.ViewGroup
import android.widget.FrameLayout
import com.revenuecat.purchases.Offering
import com.revenuecat.purchases.ui.revenuecatui.PaywallListener
import com.revenuecat.purchases.ui.revenuecatui.fonts.FontProvider

class FrameLayoutPaywallView : FrameLayout {
    private var paywallView: PaywallView? = null
    private var isAttached = false

    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
        init(context, attrs)
    }

    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
        init(context, attrs)
    }

    @JvmOverloads
    constructor(
        context: Context,
        offering: Offering? = null,
        listener: PaywallListener? = null,
        fontProvider: FontProvider? = null,
        shouldDisplayDismissButton: Boolean? = null,
        dismissHandler: (() -> Unit)? = null,
    ) : super(context) {
        init(context, null)
        paywallView?.let { view ->
            listener?.let { view.setPaywallListener(it) }
            dismissHandler?.let { view.setDismissHandler(it) }
            offering?.let { view.setOfferingId(it.identifier) }
            fontProvider?.let { view.setFontProvider(it) }
            shouldDisplayDismissButton?.let { view.setDisplayDismissButton(it) }
        }
    }

    private fun init(context: Context, attrs: AttributeSet?) {
        paywallView = PaywallView(context, attrs).apply {
            layoutParams = LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        addView(paywallView)
    }

    fun setPaywallListener(listener: PaywallListener?) {
        paywallView?.setPaywallListener(listener)
    }

    fun setDismissHandler(dismissHandler: (() -> Unit)?) {
        paywallView?.setDismissHandler(dismissHandler)
    }

    fun setOfferingId(offeringId: String?) {
        paywallView?.setOfferingId(offeringId)
    }

    fun setFontProvider(fontProvider: FontProvider?) {
        paywallView?.setFontProvider(fontProvider)
    }

    fun setDisplayDismissButton(shouldDisplayDismissButton: Boolean) {
        paywallView?.setDisplayDismissButton(shouldDisplayDismissButton)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        isAttached = true
        requestLayout()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        isAttached = false
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        if (isAttached) {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        } else {
            setMeasuredDimension(
                MeasureSpec.getSize(widthMeasureSpec),
                MeasureSpec.getSize(heightMeasureSpec)
            )
        }
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        if (isAttached) {
            paywallView?.requestLayout()
        }
    }
}
