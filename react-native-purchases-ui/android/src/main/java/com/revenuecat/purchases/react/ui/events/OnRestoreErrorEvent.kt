package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

class OnRestoreErrorEvent(
    private val error: Map<String, Any?>
) : PaywallEvent<OnRestoreErrorEvent>() {
    override fun getPaywallEventName() = PaywallEventName.ON_RESTORE_ERROR

    override fun getPayload() = mapOf(PaywallEventKey.ERROR to error)
}
