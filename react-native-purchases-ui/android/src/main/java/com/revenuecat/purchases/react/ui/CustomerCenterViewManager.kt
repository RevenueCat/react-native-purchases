package com.revenuecat.purchases.react.ui

import android.view.View
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.revenuecat.purchases.react.ui.customercenter.events.CustomerCenterEventName
import com.revenuecat.purchases.react.ui.views.WrappedCustomerCenterView

internal class CustomerCenterViewManager :
    SimpleViewManager<WrappedCustomerCenterView>() {

    companion object {
        const val REACT_CLASS: String = "CustomerCenterView"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .putEvent(CustomerCenterEventName.ON_DISMISS)
            .build()
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): WrappedCustomerCenterView {
        val wrappedView = WrappedCustomerCenterView(themedReactContext)
        wrappedView.id = View.generateViewId()

        wrappedView.setDismissHandler {
            emitDismissEvent(themedReactContext, wrappedView)
        }

        return wrappedView
    }

    private fun MapBuilder.Builder<String, Any>.putEvent(
        event: CustomerCenterEventName
    ): MapBuilder.Builder<String, Any> {
        val registrationName = MapBuilder.of("registrationName", event.eventName)
        return this.put(event.eventName, registrationName)
    }

    private fun emitDismissEvent(
        context: ReactContext,
        view: WrappedCustomerCenterView
    ) {
        android.util.Log.d(REACT_CLASS, "CustomerCenter dismiss event triggered")

        // Emit the onDismiss event to React Native
        context
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, CustomerCenterEventName.ON_DISMISS.eventName, null)
    }
}
