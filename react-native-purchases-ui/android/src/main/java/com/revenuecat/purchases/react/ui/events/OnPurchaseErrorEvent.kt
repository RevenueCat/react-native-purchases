package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

class OnPurchaseErrorEvent(
    private val error: Map<String, Any?>
) : PaywallEvent<OnPurchaseErrorEvent>() {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_ERROR

    override fun getPayload() = mapOf(PaywallEventKey.ERROR to error)
}
