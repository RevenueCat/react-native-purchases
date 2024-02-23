package com.revenuecat.purchases.react.ui

import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper

internal abstract class BasePaywallViewManager<T : View> : SimpleViewManager<T>() {

    abstract fun setOfferingId(view: T, identifier: String)

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .putEvent(PaywallEvent.ON_PURCHASE_STARTED)
            .putEvent(PaywallEvent.ON_PURCHASE_COMPLETED)
            .putEvent(PaywallEvent.ON_PURCHASE_ERROR)
            .putEvent(PaywallEvent.ON_PURCHASE_CANCELLED)
            .putEvent(PaywallEvent.ON_RESTORE_COMPLETED)
            .putEvent(PaywallEvent.ON_RESTORE_ERROR)
            .putEvent(PaywallEvent.ON_DISMISS)
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
    internal fun createPaywallListenerWrapper(
        themedReactContext: ThemedReactContext,
        view: View
    ) = object : PaywallListenerWrapper() {

        override fun onPurchaseStarted(rcPackage: Map<String, Any?>) {
            val payload = mapOf(
                PaywallEventKey.PACKAGE to rcPackage,
            )
            emitEvent(themedReactContext, view.id, PaywallEvent.ON_PURCHASE_STARTED, payload)
        }

        override fun onPurchaseCompleted(
            customerInfo: Map<String, Any?>,
            storeTransaction: Map<String, Any?>
        ) {
            val payload = mapOf(
                PaywallEventKey.CUSTOMER_INFO to customerInfo,
                PaywallEventKey.STORE_TRANSACTION to storeTransaction
            )
            emitEvent(themedReactContext, view.id, PaywallEvent.ON_PURCHASE_COMPLETED, payload)
        }

        override fun onPurchaseError(error: Map<String, Any?>) {
            val payload = mapOf(PaywallEventKey.ERROR to error)
            emitEvent(themedReactContext, view.id, PaywallEvent.ON_PURCHASE_ERROR, payload)
        }

        override fun onPurchaseCancelled() {
            emitEvent(themedReactContext, view.id, PaywallEvent.ON_PURCHASE_CANCELLED)
        }

        override fun onRestoreStarted() {
            // Will implement when iOS starts sending this event
        }

        override fun onRestoreCompleted(customerInfo: Map<String, Any?>) {
            val payload = mapOf(PaywallEventKey.CUSTOMER_INFO to customerInfo)
            emitEvent(themedReactContext, view.id, PaywallEvent.ON_RESTORE_COMPLETED, payload)
        }

        override fun onRestoreError(error: Map<String, Any?>) {
            val payload = mapOf(PaywallEventKey.ERROR to error)
            emitEvent(themedReactContext, view.id, PaywallEvent.ON_RESTORE_ERROR, payload)
        }

    }

    internal fun getDismissHandler(
        themedReactContext: ThemedReactContext,
        view: T
    ): (() -> Unit) {
        return {
            emitEvent(themedReactContext, view.id, PaywallEvent.ON_DISMISS)
        }
    }

    private fun MapBuilder.Builder<String, Any>.putEvent(
        paywallEvent: PaywallEvent
    ): MapBuilder.Builder<String, Any> {
        val registrationName = MapBuilder.of("registrationName", paywallEvent.eventName)
        return this.put(paywallEvent.eventName, registrationName)
    }

    private fun WritableNativeMap.putMap(keyMap: PaywallEventKey, dictionary: Map<String, Any?>) {
        putMap(
            keyMap.key,
            RNPurchasesConverters.convertMapToWriteableMap(dictionary)
        )
    }

    private fun emitEvent(
        context: ThemedReactContext,
        viewId: Int,
        event: PaywallEvent,
        payload: Map<PaywallEventKey, Map<String, Any?>>,
    ) {
        val convertedPayload = WritableNativeMap().apply {
            payload.forEach { (key, value) ->
                putMap(key.key, RNPurchasesConverters.convertMapToWriteableMap(value))
            }
        }
        emitEvent(context, viewId, event, convertedPayload)
    }

    @Suppress("DEPRECATION")
    private fun emitEvent(
        context: ThemedReactContext,
        viewId: Int,
        event: PaywallEvent,
        payload: WritableNativeMap? = null
    ) {
        context.getJSModule(RCTEventEmitter::class.java).receiveEvent(
            viewId,
            event.eventName,
            payload
        )
    }
}

