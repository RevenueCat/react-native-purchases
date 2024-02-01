package com.revenuecat.purchases.react.ui

import android.annotation.SuppressLint
import androidx.core.view.children
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.events.RCTModernEventEmitter
import com.facebook.react.uimanager.events.ReactEventEmitter
import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper
import com.revenuecat.purchases.react.ui.RNPurchasesConverters.convertMapToWriteableMap
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallFooterView


@OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
internal class PaywallFooterViewManager : BasePaywallViewManager<PaywallFooterView>() {

    override fun getName(): String {
        return "RCPaywallFooterView"
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .put(
                "onPurchaseStarted",
                MapBuilder.of("registrationName", "onPurchaseStarted")
            ).put(
                "onPurchaseCompleted",
                MapBuilder.of("registrationName", "onPurchaseCompleted")
            ).put(
                "onPurchaseError",
                MapBuilder.of("registrationName", "onPurchaseError")
            ).put(
                "onPurchaseCancelled",
                MapBuilder.of("registrationName", "onPurchaseCancelled")
            ).put(
                "onRestoreStarted",
                MapBuilder.of("registrationName", "onRestoreStarted")
            ).put(
                "onRestoreCompleted",
                MapBuilder.of("registrationName", "onRestoreCompleted")
            ).put(
                "onRestoreError",
                MapBuilder.of("registrationName", "onRestoreError")
            ).build()
    }

    // TODO: RCTEventEmitter is deprecated, and RCTModernEventEmitter should be used instead
    // but documentation is not clear on how to use it so keeping this for now
    @Suppress("DEPRECATION")
    @SuppressLint("UnsafeOptInUsageError")
    override fun createViewInstance(themedReactContext: ThemedReactContext): PaywallFooterView {
        val paywallFooterView: PaywallFooterView = object : PaywallFooterView(themedReactContext) {

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
        }
        paywallFooterView.setPaywallListener(object : PaywallListenerWrapper() {

            override fun onPurchaseStarted(rcPackage: Map<String, Any?>) {
                themedReactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(
                        paywallFooterView.id,
                        "onPurchaseStarted",
                        convertMapToWriteableMap(rcPackage)
                    )
            }

            override fun onPurchaseCompleted(
                customerInfo: Map<String, Any?>,
                storeTransaction: Map<String, Any?>
            ) {
                val writableMap = WritableNativeMap().apply {
                    putMap("customerInfo", convertMapToWriteableMap(customerInfo))
                    putMap("storeTransaction", convertMapToWriteableMap(storeTransaction))
                }

                themedReactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(paywallFooterView.id, "onPurchaseCompleted", writableMap)
            }

            override fun onPurchaseError(error: Map<String, Any?>) {
                themedReactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(
                        paywallFooterView.id, "onPurchaseError",
                        convertMapToWriteableMap(error)
                    )
            }

            override fun onPurchaseCancelled() {
                themedReactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(
                        paywallFooterView.id, "onPurchaseCancelled", null
                    )
            }

            override fun onRestoreStarted() {
                themedReactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(
                        paywallFooterView.id, "onRestoreStarted", null
                    )
            }

            override fun onRestoreCompleted(customerInfo: Map<String, Any?>) {
                themedReactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(
                        paywallFooterView.id,
                        "onRestoreCompleted",
                        convertMapToWriteableMap(customerInfo)
                    )
            }

            override fun onRestoreError(error: Map<String, Any?>) {
                themedReactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(
                        paywallFooterView.id,
                        "onRestoreError",
                        convertMapToWriteableMap(error)
                    )
            }


        })

        return paywallFooterView
    }

    override fun setOfferingId(view: PaywallFooterView, identifier: String) {
        view.setOfferingId(identifier)
    }

}
