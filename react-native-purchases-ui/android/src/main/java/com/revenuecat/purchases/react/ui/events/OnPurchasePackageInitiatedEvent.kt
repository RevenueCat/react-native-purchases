package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnPurchasePackageInitiatedEvent(
    surfaceId: Int,
    viewTag: Int,
    private val packageMap: Map<String, Any?>,
    private val requestId: String,
) : PaywallEvent<OnPurchasePackageInitiatedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_PACKAGE_INITIATED

    override fun getPayload() = mapOf(
        PaywallEventKey.PACKAGE to packageMap,
    )

    override fun getEventData(): WritableMap {
        return super.getEventData().apply {
            putString(PaywallEventKey.REQUEST_ID.key, requestId)
        }
    }
}
