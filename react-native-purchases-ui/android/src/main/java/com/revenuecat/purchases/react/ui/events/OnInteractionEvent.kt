package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName
import com.revenuecat.purchases.react.ui.RNPurchasesConverters

internal class OnInteractionEvent(
    surfaceId: Int,
    viewTag: Int,
    private val interaction: Map<String, Any>,
) : PaywallEvent<OnInteractionEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_INTERACTION

    override fun getPayload(): Map<PaywallEventKey, Map<String, Any?>> = emptyMap()

    override fun getEventData(): WritableMap = RNPurchasesConverters.convertMapToWriteableMap(interaction)
}
