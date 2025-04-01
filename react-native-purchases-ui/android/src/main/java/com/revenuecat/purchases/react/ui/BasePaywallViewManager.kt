package com.revenuecat.purchases.react.ui

import android.view.View
import com.facebook.react.bridge.ReactContext
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
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider

internal abstract class BasePaywallViewManager<T : View> : SimpleViewManager<T>() {

    companion object PropNames {
        private const val PROP_OPTIONS = "options"
        private const val OPTION_OFFERING = "offering"
        private const val OFFERING_IDENTIFIER = "identifier"
        private const val OPTION_FONT_FAMILY = "fontFamily"
        private const val OPTION_DISPLAY_CLOSE_BUTTON = "displayCloseButton"
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
            .putEvent(PaywallEventName.ON_MEASURE)
            .build()
    }

    abstract fun setFontFamily(view: T, customFontProvider: CustomFontProvider)

    @ReactProp(name = PROP_OPTIONS)
    fun setOptions(view: T, options: ReadableMap?) {
        if (options != null) {
            setOfferingIdProp(view, options)
            setFontFamilyProp(view, options)
            setDisplayCloseButton(view, options)
        }
    }

    private fun setOfferingIdProp(view: T, options: ReadableMap?) {
        val optionsMap = options?.toHashMap()
        if (optionsMap == null || !optionsMap.containsKey(OPTION_OFFERING)) {
            return
        }
        if (optionsMap[OPTION_OFFERING] == null) {
            // getDynamic crashes if the value is null, that's why we use props?.toHashMap
            return
        }
        // this is a workaround for the fact that getDynamic doesn't work with null values
        val offeringIdentifier =
            options.getDynamic(OPTION_OFFERING)?.asMap()?.getString(OFFERING_IDENTIFIER)
        offeringIdentifier?.let {
            setOfferingId(view, it)
        }
    }

    private fun setFontFamilyProp(view: T, options: ReadableMap?) {
        options?.getString(OPTION_FONT_FAMILY)?.let {
            FontAssetManager.getFontFamily(fontFamilyName = it, view.resources.assets)?.let {
                setFontFamily(view, CustomFontProvider(it))
            }
        }
    }

    private fun setDisplayCloseButton(view: T, options: ReadableMap) {
        options.takeIf { it.hasKey(OPTION_DISPLAY_CLOSE_BUTTON) }?.let {
            setDisplayDismissButton(view, it.getBoolean(OPTION_DISPLAY_CLOSE_BUTTON))
        }
    }

    internal fun createPaywallListenerWrapper(
        themedReactContext: ThemedReactContext,
        view: View
    ) = object : PaywallListenerWrapper() {
        override fun onPurchaseStarted(rcPackage: Map<String, Any?>) {
            val event = OnPurchaseStartedEvent(
                surfaceId = view.surfaceId,
                viewTag = view.id,
                rcPackage
            )
            emitEvent(themedReactContext, view.id, event)
        }

        override fun onPurchaseCompleted(
            customerInfo: Map<String, Any?>,
            storeTransaction: Map<String, Any?>
        ) {
            val event = OnPurchaseCompletedEvent(
                surfaceId = view.surfaceId,
                viewTag = view.id,
                customerInfo,
                storeTransaction
            )
            emitEvent(themedReactContext, view.id, event)
        }

        override fun onPurchaseError(error: Map<String, Any?>) {
            val event = OnPurchaseErrorEvent(
                surfaceId = view.surfaceId,
                viewTag = view.id,
                error
            )
            emitEvent(themedReactContext, view.id, event)
        }

        override fun onPurchaseCancelled() {
            val event = OnPurchaseCancelledEvent(
                surfaceId = view.surfaceId,
                viewTag = view.id,
            )
            emitEvent(themedReactContext, view.id, event)
        }

        override fun onRestoreStarted() {
            val event = OnRestoreStartedEvent(
                surfaceId = view.surfaceId,
                viewTag = view.id,
            )
            emitEvent(themedReactContext, view.id, event)
        }

        override fun onRestoreCompleted(customerInfo: Map<String, Any?>) {
            val event = OnRestoreCompletedEvent(
                surfaceId = view.surfaceId,
                viewTag = view.id,
                customerInfo,
            )
            emitEvent(themedReactContext, view.id, event)
        }

        override fun onRestoreError(error: Map<String, Any?>) {
            val event = OnRestoreErrorEvent(
                surfaceId = view.surfaceId,
                viewTag = view.id,
                error,
            )
            emitEvent(themedReactContext, view.id, event)
        }

    }

    internal fun getDismissHandler(
        themedReactContext: ThemedReactContext,
        view: View,
    ): (() -> Unit) = {
        val event = OnDismissEvent(view.surfaceId, view.id)
        emitEvent(themedReactContext, view.id, event)
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

    protected fun emitEvent(
        context: ReactContext,
        viewId: Int,
        event: Event<*>,
    ) {
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(context, viewId)
        eventDispatcher?.dispatchEvent(event)
    }
}
