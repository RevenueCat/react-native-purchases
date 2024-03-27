package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.uimanager.events.Event
import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName
import com.revenuecat.purchases.react.ui.RNPurchasesConverters

internal abstract class PaywallEvent<T>(
    surfaceId: Int,
    viewTag: Int,
) : Event<PaywallEvent<T>>(surfaceId, viewTag) {

    abstract fun getPaywallEventName(): PaywallEventName

    abstract fun getPayload(): Map<PaywallEventKey, Map<String, Any?>>

    override fun getEventName(): String {
        return getPaywallEventName().eventName
    }

    override fun getEventData(): WritableMap {
        val convertedPayload = getPayload().let { payload ->
            WritableNativeMap().apply {
                payload.forEach { (key, value) ->
                    putMap(key.key, RNPurchasesConverters.convertMapToWriteableMap(value))
                }
            }
        }

        return convertedPayload
    }
}
