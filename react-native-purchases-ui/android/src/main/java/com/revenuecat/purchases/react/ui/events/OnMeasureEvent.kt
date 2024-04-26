package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnMeasureEvent(
    surfaceId: Int,
    viewTag: Int,
    private val height: Int
) : PaywallEvent<OnDismissEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_MEASURE

    override fun getPayload() = mapOf(
        PaywallEventKey.MEASUREMENTS to mapOf(PaywallEventKey.HEIGHT.key to height),
    )
}

