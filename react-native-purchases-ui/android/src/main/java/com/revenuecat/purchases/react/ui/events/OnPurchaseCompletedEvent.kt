package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnPurchaseCompletedEvent(
    surfaceId: Int,
    viewTag: Int,
    private val customerInfo: Map<String, Any?>,
    private val storeTransaction: Map<String, Any?>
) : PaywallEvent<OnPurchaseCompletedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_COMPLETED

    override fun getPayload() = mapOf(
        PaywallEventKey.CUSTOMER_INFO to customerInfo,
        PaywallEventKey.STORE_TRANSACTION to storeTransaction
    )
}
