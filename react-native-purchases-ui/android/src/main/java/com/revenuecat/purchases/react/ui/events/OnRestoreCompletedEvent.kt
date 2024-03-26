package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

class OnRestoreCompletedEvent(
    private val customerInfo: Map<String, Any?>,
) : PaywallEvent<OnRestoreCompletedEvent>() {
    override fun getPaywallEventName() = PaywallEventName.ON_RESTORE_COMPLETED

    override fun getPayload() = mapOf(PaywallEventKey.CUSTOMER_INFO to customerInfo)
}
