package com.revenuecat.purchases.react.ui

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.widget.FrameLayout

internal class ViewWrapperFrameLayout<T : View> @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
    private val viewFactory: ((Context) -> T)? = null
) : FrameLayout(context, attrs, defStyleAttr) {

    private var initialized = false

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()

        if (!initialized) {
            viewFactory?.invoke(context)?.let { customView ->
                addView(
                    customView, LayoutParams(
                        LayoutParams.MATCH_PARENT,
                        LayoutParams.MATCH_PARENT
                    )
                )
                initialized = true
            }
        }
    }
}
