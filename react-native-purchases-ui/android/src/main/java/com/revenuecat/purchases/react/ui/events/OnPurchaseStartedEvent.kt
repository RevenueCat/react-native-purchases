package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnPurchaseStartedEvent(
    surfaceId: Int,
    viewTag: Int,
    private val packageMap: Map<String, Any?>
) : PaywallEvent<OnPurchaseStartedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_STARTED

    override fun getPayload() = mapOf(
        PaywallEventKey.PACKAGE to packageMap,
    )
}
