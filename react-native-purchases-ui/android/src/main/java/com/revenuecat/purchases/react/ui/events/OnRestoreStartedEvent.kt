package com.revenuecat.purchases.react.ui.events

import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnRestoreStartedEvent(
    surfaceId: Int,
    viewTag: Int,
) : PaywallEvent<OnRestoreStartedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_RESTORE_STARTED

    override fun getPayload(): Map<PaywallEventKey, Map<String, Any?>> = emptyMap()
}
