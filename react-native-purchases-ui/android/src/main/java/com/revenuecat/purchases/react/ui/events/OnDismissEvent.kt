package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnDismissEvent(
    surfaceId: Int,
    viewTag: Int,
) : PaywallEvent<OnDismissEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_DISMISS

    override fun getPayload(): Map<PaywallEventKey, Map<String, Any?>> = emptyMap()
}
