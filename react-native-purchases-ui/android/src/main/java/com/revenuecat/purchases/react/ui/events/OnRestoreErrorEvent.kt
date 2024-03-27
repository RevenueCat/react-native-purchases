package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnRestoreErrorEvent(
    surfaceId: Int,
    viewTag: Int,
    private val error: Map<String, Any?>
) : PaywallEvent<OnRestoreErrorEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_RESTORE_ERROR

    override fun getPayload() = mapOf(PaywallEventKey.ERROR to error)
}
