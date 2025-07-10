package com.revenuecat.purchases.react.ui.customercenter.events

import android.util.Log
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.events.RCTModernEventEmitter

internal abstract class CustomerCenterEvent<T>(
    surfaceId: Int,
    viewTag: Int,
) : Event<CustomerCenterEvent<T>>(surfaceId, viewTag) {

    abstract fun getCustomerCenterEventName(): CustomerCenterEventName

    override fun getEventName(): String {
        return getCustomerCenterEventName().eventName
    }
}
