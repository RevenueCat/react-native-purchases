package com.revenuecat.purchases.react.ui

import androidx.core.view.children
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerModule
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallFooterView

@OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
internal class PaywallFooterViewManager : BasePaywallViewManager<PaywallFooterView>() {

    override fun getName(): String {
        return "RCPaywallFooterView"
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): PaywallFooterView {
        return object : PaywallFooterView(themedReactContext) {

            // This is required so the change from Loading to Loaded resizes the view
            // https://github.com/facebook/react-native/issues/17968#issuecomment-1672111483
            override fun requestLayout() {
                super.requestLayout()
                post(measureAndLayout)
            }

            private val measureAndLayout = Runnable {
                measure(
                    MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
                )
                layout(left, top, right, bottom)
            }

            // This is needed so it measures correctly the size of the children and react native can
            // size the Javascript view correctly. Not doing this will render the view with height 0
            // and will require the devs to set a fixed height to the view, which is not ideal
            // https://medium.com/traveloka-engineering/react-native-at-traveloka-native-ui-components-c6b66f789f35
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
        }.also { view ->
            view.setPaywallListener(createPaywallListenerWrapper(themedReactContext, view))
            view.setDismissHandler(getDismissHandler(themedReactContext, view))
        }
    }

    override fun setOfferingId(view: PaywallFooterView, identifier: String) {
        view.setOfferingId(identifier)
    }

    override fun setFontFamily(view: PaywallFooterView, customFontProvider: CustomFontProvider) {
        view.setFontProvider(customFontProvider)
    }

    override fun setDisplayDismissButton(view: PaywallFooterView, display: Boolean) {
        // No-op since PaywallFooterView doesn't have a dismiss button
    }

}
