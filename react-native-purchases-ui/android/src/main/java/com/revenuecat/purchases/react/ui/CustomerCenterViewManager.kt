package com.revenuecat.purchases.react.ui

import android.util.Log
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.revenuecat.purchases.react.ui.customercenter.events.CustomerCenterEventName
import com.revenuecat.purchases.react.ui.customercenter.events.CustomerCenterOnDismissEvent
import com.revenuecat.purchases.ui.revenuecatui.views.CustomerCenterView

internal class CustomerCenterViewManager :
    SimpleViewManager<ViewWrapperFrameLayout<CustomerCenterView>>() {

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

    private var wrapper: ViewWrapperFrameLayout<CustomerCenterView>? = null

    override fun createViewInstance(themedReactContext: ThemedReactContext): ViewWrapperFrameLayout<CustomerCenterView> {
        val wrapper = ViewWrapperFrameLayout(themedReactContext) {
            CustomerCenterView(themedReactContext)
                .also { view ->
                    view.id = View.generateViewId()
                    view.setDismissHandler {
                        emitDismissEvent(themedReactContext)
                    }
                }
        }

        this.wrapper = wrapper

        return wrapper
    }

    private fun MapBuilder.Builder<String, Any>.putEvent(
        event: CustomerCenterEventName
    ): MapBuilder.Builder<String, Any> {
        val registrationName = MapBuilder.of("registrationName", event.eventName)
        return this.put(event.eventName, registrationName)
    }

    protected fun emitDismissEvent(
        context: ReactContext
    ) {
        wrapper?.let {
            val surfaceId = UIManagerHelper.getSurfaceId(it)

            val event = CustomerCenterOnDismissEvent(surfaceId, it.id)
            emitEvent(context, it.id, event)
        }
    }

    protected fun emitEvent(
        context: ReactContext,
        viewId: Int,
        event: Event<*>,
    ) {
        Log.d(REACT_CLASS, "Dispatching OnDismissEvent for viewId=${viewId}")

        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(context, viewId)
        eventDispatcher?.dispatchEvent(event)
    }
}
