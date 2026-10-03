package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnRestoreInitiatedEvent(
    surfaceId: Int,
    viewTag: Int,
    private val requestId: String,
) : PaywallEvent<OnRestoreInitiatedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_RESTORE_INITIATED

    override fun getPayload(): Map<PaywallEventKey, Map<String, Any?>> = emptyMap()

    override fun getEventData(): WritableMap {
        return super.getEventData().apply {
            putString(PaywallEventKey.REQUEST_ID.key, requestId)
        }
    }
}
