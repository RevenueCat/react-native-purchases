package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnPurchaseCancelledEvent(
    surfaceId: Int,
    viewTag: Int,
) : PaywallEvent<OnPurchaseCancelledEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_CANCELLED

    override fun getPayload(): Map<PaywallEventKey, Map<String, Any?>> = emptyMap()
}
