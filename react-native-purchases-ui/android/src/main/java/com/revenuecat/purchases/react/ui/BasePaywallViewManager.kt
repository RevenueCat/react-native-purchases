package com.revenuecat.purchases.react.ui

import android.annotation.SuppressLint
import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallFooterView

internal abstract class BasePaywallViewManager<T : View> : SimpleViewManager<T>() {

    abstract fun setOfferingId(view: T, identifier: String)

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .putEvent("onPurchaseStarted")
            .putEvent("onPurchaseCompleted")
            .putEvent("onPurchaseError")
            .putEvent("onPurchaseCancelled")
            .putEvent("onRestoreStarted")
            .putEvent("onRestoreCompleted")
            .putEvent("onRestoreError")
            .build()
    }

    @ReactProp(name = "options")
    fun setOptions(view: T, options: ReadableMap?) {
        options?.let { props ->
            if (props.hasKey("offering")) {
                props.getDynamic("offering").asMap()?.let { offeringMap ->
                    if (offeringMap.hasKey("identifier") && !offeringMap.isNull("identifier")) {
                        setOfferingId(view, offeringMap.getString("identifier")!!)
                    }
                }
            }
        }
    }

    // TODO: RCTEventEmitter is deprecated, and RCTModernEventEmitter should be used instead
    // but documentation is not clear on how to use it so keeping this for now
    @Suppress("DEPRECATION")
    internal fun createPaywallListenerWrapper(
        themedReactContext: ThemedReactContext,
        view: View
    ) = object : PaywallListenerWrapper() {

        override fun onPurchaseStarted(rcPackage: Map<String, Any?>) {
            themedReactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(
                    view.id,
                    "onPurchaseStarted",
                    RNPurchasesConverters.convertMapToWriteableMap(rcPackage)
                )
        }

        override fun onPurchaseCompleted(
            customerInfo: Map<String, Any?>,
            storeTransaction: Map<String, Any?>
        ) {
            val writableMap = WritableNativeMap().apply {
                putMap("customerInfo", RNPurchasesConverters.convertMapToWriteableMap(customerInfo))
                putMap(
                    "storeTransaction",
                    RNPurchasesConverters.convertMapToWriteableMap(storeTransaction)
                )
            }

            themedReactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(view.id, "onPurchaseCompleted", writableMap)
        }

        override fun onPurchaseError(error: Map<String, Any?>) {
            themedReactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(
                    view.id, "onPurchaseError",
                    RNPurchasesConverters.convertMapToWriteableMap(error)
                )
        }

        override fun onPurchaseCancelled() {
            themedReactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(
                    view.id, "onPurchaseCancelled", null
                )
        }

        override fun onRestoreStarted() {
            themedReactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(
                    view.id, "onRestoreStarted", null
                )
        }

        override fun onRestoreCompleted(customerInfo: Map<String, Any?>) {
            themedReactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(
                    view.id,
                    "onRestoreCompleted",
                    RNPurchasesConverters.convertMapToWriteableMap(customerInfo)
                )
        }

        override fun onRestoreError(error: Map<String, Any?>) {
            themedReactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(
                    view.id,
                    "onRestoreError",
                    RNPurchasesConverters.convertMapToWriteableMap(error)
                )
        }

    }

    private fun MapBuilder.Builder<String, Any>.putEvent(
        registrationName: String
    ): MapBuilder.Builder<String, Any> {
        return this.put(registrationName, MapBuilder.of("registrationName", registrationName))
    }

}

