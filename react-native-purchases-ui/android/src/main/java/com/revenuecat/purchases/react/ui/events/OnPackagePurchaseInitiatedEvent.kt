package com.revenuecat.purchases.react.ui.events

import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.revenuecat.purchases.react.ui.PaywallEventKey
import com.revenuecat.purchases.react.ui.PaywallEventName
import com.revenuecat.purchases.react.ui.RNPurchasesConverters

internal class OnPurchasePackageInitiatedEvent(
    surfaceId: Int,
    viewTag: Int,
    private val packageMap: Map<String, Any?>,
    private val callbackId: String
) : PaywallEvent<OnPurchasePackageInitiatedEvent>(surfaceId, viewTag) {
    override fun getPaywallEventName() = PaywallEventName.ON_PURCHASE_PACKAGE_INITIATED

    override fun getPayload() = mapOf(
        PaywallEventKey.PACKAGE to packageMap,
    )

    override fun getEventData(): WritableMap {
        return WritableNativeMap().apply {
            putMap(PaywallEventKey.PACKAGE.key, RNPurchasesConverters.convertMapToWriteableMap(packageMap))
            putString(PaywallEventKey.CALLBACK_ID.key, callbackId)
        }
    }
}

