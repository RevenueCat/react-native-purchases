package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventName

class OnDismissEvent : PaywallEvent<OnDismissEvent>() {
    override fun getPaywallEventName() = PaywallEventName.ON_DISMISS

    override fun getPayload() = null
}
