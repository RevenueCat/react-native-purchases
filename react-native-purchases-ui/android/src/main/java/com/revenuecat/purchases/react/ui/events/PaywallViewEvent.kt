package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.revenuecat.purchases.react.ui.PaywallEventName
import com.revenuecat.purchases.react.ui.RNPurchasesConverters

internal class PaywallViewEvent(
    surfaceId: Int,
    viewTag: Int,
    private val paywallEventName: PaywallEventName,
    private val payload: Map<String, Any?>,
) : Event<PaywallViewEvent>(surfaceId, viewTag) {
    override fun getEventName(): String = paywallEventName.eventName

    // EventDispatcherImpl merges same-name events staged in one frame unless this is false; every
    // interaction must reach JS.
    override fun canCoalesce(): Boolean = paywallEventName != PaywallEventName.ON_INTERACTION

    override fun getEventData(): WritableMap = RNPurchasesConverters.convertMapToWriteableMap(payload)
}
