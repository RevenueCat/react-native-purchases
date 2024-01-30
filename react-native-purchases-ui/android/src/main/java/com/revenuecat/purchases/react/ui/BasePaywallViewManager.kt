package com.revenuecat.purchases.react.ui

import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.annotations.ReactProp

internal abstract class BasePaywallViewManager<T : View> : SimpleViewManager<T>() {

    abstract fun setOfferingId(view: T, identifier: String)

    @ReactProp(name = "options")
    fun setOptions(view: T, options: ReadableMap?) {
        options?.let { props ->
            if (props.hasKey("offering")) {
                props.getDynamic("offering").asMap()?.let { offeringMap ->
                    if (offeringMap.hasKey("identifier") && !offeringMap.isNull("identifier")) {
                        setOfferingId(view, offeringMap.getString("identifier")!!)
                    }
                }
            }
        }
    }
}

