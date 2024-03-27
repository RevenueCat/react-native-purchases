package com.revenuecat.purchases.react.ui

import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.Event
import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper
import com.revenuecat.purchases.react.ui.events.OnDismissEvent
import com.revenuecat.purchases.react.ui.events.OnPurchaseCancelledEvent
import com.revenuecat.purchases.react.ui.events.OnPurchaseCompletedEvent
import com.revenuecat.purchases.react.ui.events.OnPurchaseErrorEvent
import com.revenuecat.purchases.react.ui.events.OnPurchaseStartedEvent
import com.revenuecat.purchases.react.ui.events.OnRestoreCompletedEvent
import com.revenuecat.purchases.react.ui.events.OnRestoreErrorEvent
import com.revenuecat.purchases.react.ui.events.OnRestoreStartedEvent
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider

internal abstract class BasePaywallViewManager<T : View> : SimpleViewManager<T>() {

    companion object PropNames {
        private const val PROP_OPTIONS = "options"
        private const val OPTION_OFFERING = "offering"
        private const val OFFERING_IDENTIFIER = "identifier"
        private const val OPTION_FONT_FAMILY = "fontFamily"
    }

    abstract fun setOfferingId(view: T, identifier: String)

    abstract fun setDisplayDismissButton(view: T, display: Boolean)

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .putEvent(PaywallEventName.ON_PURCHASE_STARTED)
            .putEvent(PaywallEventName.ON_PURCHASE_COMPLETED)
            .putEvent(PaywallEventName.ON_PURCHASE_ERROR)
            .putEvent(PaywallEventName.ON_PURCHASE_CANCELLED)
            .putEvent(PaywallEventName.ON_RESTORE_STARTED)
            .putEvent(PaywallEventName.ON_RESTORE_COMPLETED)
            .putEvent(PaywallEventName.ON_RESTORE_ERROR)
            .putEvent(PaywallEventName.ON_DISMISS)
            .build()
    }

    @OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
    abstract fun setFontFamily(view: T, customFontProvider: CustomFontProvider)

    @ReactProp(name = PROP_OPTIONS)
    fun setOptions(view: T, options: ReadableMap?) {
        options?.let { props ->
            setOfferingIdProp(view, props)
            setFontFamilyProp(view, props)
            setDisplayCloseButton(view, props)
        }
    }

    private fun setOfferingIdProp(view: T, props: ReadableMap?) {
        val offeringIdentifier = props?.getDynamic(OPTION_OFFERING)?.asMap()?.getString(OFFERING_IDENTIFIER)
        offeringIdentifier?.let {
            setOfferingId(view, it)
        }
    }

    @OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
    private fun setFontFamilyProp(view: T, props: ReadableMap?) {
        props?.getString(OPTION_FONT_FAMILY)?.let {
            FontAssetManager.getFontFamily(fontFamilyName = it, view.resources.assets)?.let {
                setFontFamily(view, CustomFontProvider(it))
            }
        }
    }

    private fun setDisplayCloseButton(view: T, options: ReadableMap) {
        options.takeIf { it.hasKey("displayCloseButton") }?.let {
            setDisplayDismissButton(view, it.getBoolean("displayCloseButton"))
        }
    }

    internal fun createPaywallListenerWrapper(
        themedReactContext: ThemedReactContext,
        view: View
    ) = object : PaywallListenerWrapper() {

        override fun onPurchaseStarted(rcPackage: Map<String, Any?>) {
            emitEvent(themedReactContext, view.id, OnPurchaseStartedEvent(rcPackage))
        }

        override fun onPurchaseCompleted(
            customerInfo: Map<String, Any?>,
            storeTransaction: Map<String, Any?>
        ) {
            val event = OnPurchaseCompletedEvent(customerInfo, storeTransaction)
            emitEvent(themedReactContext, view.id, event)
        }

        override fun onPurchaseError(error: Map<String, Any?>) {
            emitEvent(themedReactContext, view.id, OnPurchaseErrorEvent(error))
        }

        override fun onPurchaseCancelled() {
            emitEvent(themedReactContext, view.id, OnPurchaseCancelledEvent())
        }

        override fun onRestoreStarted() {
            emitEvent(themedReactContext, view.id, OnRestoreStartedEvent())
        }

        override fun onRestoreCompleted(customerInfo: Map<String, Any?>) {
            emitEvent(themedReactContext, view.id, OnRestoreCompletedEvent(customerInfo))
        }

        override fun onRestoreError(error: Map<String, Any?>) {
            emitEvent(themedReactContext, view.id, OnRestoreErrorEvent(error))
        }

    }

    internal fun getDismissHandler(
        themedReactContext: ThemedReactContext,
        view: T
    ): (() -> Unit) = {
        emitEvent(themedReactContext, view.id, OnDismissEvent())
    }

    private fun MapBuilder.Builder<String, Any>.putEvent(
        paywallEvent: PaywallEventName
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
        event: Event<*>,
    ) {
        UIManagerHelper.getEventDispatcherForReactTag(context, viewId)?.dispatchEvent(event)
    }

}
