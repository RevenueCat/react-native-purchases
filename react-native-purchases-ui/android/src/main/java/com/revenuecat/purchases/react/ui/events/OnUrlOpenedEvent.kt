package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName

internal class OnUrlOpenedEvent(
    surfaceId: Int,
    viewTag: Int,
    private val url: String,
) : PaywallEvent<OnUrlOpenedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_URL_OPENED

    override fun getPayload(): Map<PaywallEventKey, Map<String, Any?>> = emptyMap()

    override fun getEventData(): WritableMap {
        return super.getEventData().apply {
            putString(PaywallEventKey.URL.key, url)
        }
    }
}
