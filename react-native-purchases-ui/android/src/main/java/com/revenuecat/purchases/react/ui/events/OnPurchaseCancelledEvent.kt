package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventName

class OnPurchaseCancelledEvent : PaywallEvent<OnPurchaseCancelledEvent>() {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_CANCELLED

    override fun getPayload() = null
}
