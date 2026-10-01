package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnWebCheckoutOpenedEvent(
    surfaceId: Int,
    viewTag: Int,
) : PaywallEvent<OnWebCheckoutOpenedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_WEB_CHECKOUT_OPENED

    override fun getPayload(): Map<PaywallEventKey, Map<String, Any?>> = emptyMap()
}
