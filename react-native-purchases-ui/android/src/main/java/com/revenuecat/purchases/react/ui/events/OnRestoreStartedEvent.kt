package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventName

class OnRestoreStartedEvent : PaywallEvent<OnRestoreStartedEvent>() {
    override fun getPaywallEventName() = PaywallEventName.ON_RESTORE_STARTED

    override fun getPayload() = null
}
