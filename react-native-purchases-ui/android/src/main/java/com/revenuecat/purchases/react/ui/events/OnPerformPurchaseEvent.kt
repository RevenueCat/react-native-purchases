package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnPerformPurchaseEvent(
    surfaceId: Int,
    viewTag: Int,
    private val packageMap: Map<String, Any?>,
    private val requestId: String,
) : PaywallEvent<OnPerformPurchaseEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_PERFORM_PURCHASE

    override fun getPayload() = mapOf(
        PaywallEventKey.PACKAGE to packageMap,
    )

    override fun getEventData(): WritableMap {
        return super.getEventData().apply {
            putString(PaywallEventKey.REQUEST_ID.key, requestId)
        }
    }
}
