package com.revenuecat.purchases.react.ui

import androidx.core.view.children
import com.facebook.react.uimanager.ThemedReactContext
import com.revenuecat.purchases.react.ui.events.OnMeasureEvent
import com.revenuecat.purchases.react.ui.views.WrappedPaywallFooterComposeView
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider

internal class PaywallFooterViewManager : BasePaywallViewManager<WrappedPaywallFooterComposeView>() {

    override fun getName(): String {
        return "RCPaywallFooterView"
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): WrappedPaywallFooterComposeView {
        return object : WrappedPaywallFooterComposeView(themedReactContext) {

            // This is required so the change from Loading to Loaded resizes the view
            // https://github.com/facebook/react-native/issues/17968#issuecomment-1672111483
            override fun requestLayout() {
                super.requestLayout()
                post(measureAndLayout)
            }

            private val measureAndLayout = Runnable {
                // It's possible the view has been detached at this point which can cause issues
                // since the viewModel is not available anymore. We don't really need to remeasure
                // in this case.
                if (isAttachedToWindow) {
                    measure(
                        MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                        MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
                    )
                    layout(left, top, right, bottom)
                }
            }

            // This is needed so it measures correctly the size of the children and react native can
            // size the Javascript view correctly. Not doing this will render the view with height 0
            // and will require the devs to set a fixed height to the view, which is not ideal
            // https://medium.com/traveloka-engineering/react-native-at-traveloka-native-ui-components-c6b66f789f35
            public override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
                super.onMeasure(widthMeasureSpec, heightMeasureSpec)
                if (isAttached) {
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

                    val density = context.resources.displayMetrics.density
                    val finalHeightInDp = finalHeight / density

                    val onMeasureEvent = OnMeasureEvent(
                        this.surfaceId,
                        this.id,
                        finalHeightInDp.toInt()
                    )
                    (context as? ThemedReactContext)?.reactApplicationContext?.let { reactApplicationContext ->
                        emitEvent(reactApplicationContext, this.id, onMeasureEvent)
                    }
                }
            }
        }.also { view ->
            view.setPaywallListener(createPaywallListenerWrapper(themedReactContext, view))
            view.setDismissHandler(getDismissHandler(themedReactContext, view))
        }
    }

    override fun setOfferingId(view: WrappedPaywallFooterComposeView, identifier: String) {
        view.setOfferingId(identifier)
    }

    override fun setFontFamily(view: WrappedPaywallFooterComposeView, customFontProvider: CustomFontProvider) {
        view.setFontProvider(customFontProvider)
    }

    override fun setDisplayDismissButton(view: WrappedPaywallFooterComposeView, display: Boolean) {
        // No-op since PaywallFooterView doesn't have a dismiss button
    }

}
