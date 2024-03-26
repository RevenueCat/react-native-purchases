package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

class OnPurchaseStartedEvent(
    private val packageMap: Map<String, Any?>
) : PaywallEvent<OnPurchaseStartedEvent>() {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_STARTED

    override fun getPayload() = mapOf(
        PaywallEventKey.PACKAGE to packageMap,
    )
}
