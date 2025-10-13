package com.revenuecat.purchases.react.ui

import android.util.Log
import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.revenuecat.purchases.hybridcommon.ui.CustomerCenterListenerWrapper
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
            .putEvent(CustomerCenterEventName.ON_CUSTOM_ACTION_SELECTED)
            .putEvent(CustomerCenterEventName.ON_RESTORE_STARTED)
            .putEvent(CustomerCenterEventName.ON_RESTORE_COMPLETED)
            .putEvent(CustomerCenterEventName.ON_RESTORE_FAILED)
            .putEvent(CustomerCenterEventName.ON_SHOWING_MANAGE_SUBSCRIPTIONS)
            .putEvent(CustomerCenterEventName.ON_FEEDBACK_SURVEY_COMPLETED)
            .putEvent(CustomerCenterEventName.ON_MANAGEMENT_OPTION_SELECTED)
            .putEvent(CustomerCenterEventName.ON_REFUND_REQUEST_STARTED)
            .putEvent(CustomerCenterEventName.ON_REFUND_REQUEST_COMPLETED)
            .build()
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): WrappedCustomerCenterView {
        val wrappedView = WrappedCustomerCenterView(themedReactContext)
        wrappedView.id = View.generateViewId()

        wrappedView.setDismissHandler {
            emitDismissEvent(themedReactContext, wrappedView)
        }

        val customerCenterListener = createCustomerCenterListener(themedReactContext, wrappedView)
        wrappedView.setCustomerCenterListener(customerCenterListener)

        return wrappedView
    }

    override fun onDropViewInstance(view: WrappedCustomerCenterView) {
        super.onDropViewInstance(view)
        view.setCustomerCenterListener(null)
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
        Log.d(REACT_CLASS, "CustomerCenter dismiss event triggered")
        emitEvent(context, view, CustomerCenterEventName.ON_DISMISS, null)
    }

    private fun createCustomerCenterListener(
        themedReactContext: ThemedReactContext,
        view: WrappedCustomerCenterView
    ): CustomerCenterListenerWrapper {
        return object : CustomerCenterListenerWrapper() {
            override fun onRestoreStartedWrapper() {
                emitEvent(
                    themedReactContext,
                    view,
                    CustomerCenterEventName.ON_RESTORE_STARTED,
                    Arguments.createMap()
                )
            }

            override fun onRestoreCompletedWrapper(customerInfo: Map<String, Any?>) {
                val payload = WritableNativeMap().apply {
                    putMap("customerInfo", RNPurchasesConverters.convertMapToWriteableMap(customerInfo))
                }
                emitEvent(
                    themedReactContext,
                    view,
                    CustomerCenterEventName.ON_RESTORE_COMPLETED,
                    payload
                )
            }

            override fun onRestoreFailedWrapper(error: Map<String, Any?>) {
                val payload = WritableNativeMap().apply {
                    putMap("error", RNPurchasesConverters.convertMapToWriteableMap(error))
                }
                emitEvent(
                    themedReactContext,
                    view,
                    CustomerCenterEventName.ON_RESTORE_FAILED,
                    payload
                )
            }

            override fun onShowingManageSubscriptionsWrapper() {
                emitEvent(
                    themedReactContext,
                    view,
                    CustomerCenterEventName.ON_SHOWING_MANAGE_SUBSCRIPTIONS,
                    Arguments.createMap()
                )
            }

            override fun onFeedbackSurveyCompletedWrapper(feedbackSurveyOptionId: String) {
                val payload = WritableNativeMap().apply {
                    putString("feedbackSurveyOptionId", feedbackSurveyOptionId)
                }
                emitEvent(
                    themedReactContext,
                    view,
                    CustomerCenterEventName.ON_FEEDBACK_SURVEY_COMPLETED,
                    payload
                )
            }

            override fun onManagementOptionSelectedWrapper(action: String, url: String?) {
                emitManagementOptionSelectedEvent(themedReactContext, view, action, url)
            }

            override fun onManagementOptionSelectedWrapper(
                action: String,
                customAction: String?,
                purchaseIdentifier: String?
            ) {
                // DEPRECATED: handled by onCustomActionSelectedWrapper
            }

            override fun onCustomActionSelectedWrapper(actionId: String, purchaseIdentifier: String?) {
                emitCustomActionSelectedEvent(
                    themedReactContext,
                    view,
                    actionId,
                    purchaseIdentifier
                )
            }

        }
    }

    private fun emitManagementOptionSelectedEvent(
        context: ReactContext,
        view: WrappedCustomerCenterView,
        action: String,
        url: String?
    ) {
        val payload = WritableNativeMap().apply {
            putString("option", action)
            if (url != null) {
                putString("url", url)
            } else {
                putNull("url")
            }
        }

        emitEvent(
            context,
            view,
            CustomerCenterEventName.ON_MANAGEMENT_OPTION_SELECTED,
            payload
        )
    }

    private fun emitCustomActionSelectedEvent(
        context: ReactContext,
        view: WrappedCustomerCenterView,
        actionId: String,
        purchaseIdentifier: String?
    ) {
        val payload = WritableNativeMap().apply {
            putString("actionId", actionId)
            if (purchaseIdentifier != null) {
                putString("purchaseIdentifier", purchaseIdentifier)
            } else {
                putNull("purchaseIdentifier")
            }
        }

        emitEvent(
            context,
            view,
            CustomerCenterEventName.ON_CUSTOM_ACTION_SELECTED,
            payload
        )
    }

    private fun emitEvent(
        context: ReactContext,
        view: WrappedCustomerCenterView,
        event: CustomerCenterEventName,
        params: WritableMap?
    ) {
        context
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, event.eventName, params)
    }
}
