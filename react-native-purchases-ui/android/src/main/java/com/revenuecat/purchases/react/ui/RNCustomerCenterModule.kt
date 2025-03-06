package com.revenuecat.purchases.react.ui

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesError
import com.revenuecat.purchases.customercenter.CustomerCenterListener
import com.revenuecat.purchases.ui.revenuecatui.customercenter.ShowCustomerCenter

internal class RNCustomerCenterModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNCustomerCenter"
        private const val REQUEST_CODE_CUSTOMER_CENTER = 1001
    }

    private var customerCenterPromise: Promise? = null

    private val activityEventListener: ActivityEventListener =
        object : BaseActivityEventListener() {
            override fun onActivityResult(
                activity: Activity,
                requestCode: Int,
                resultCode: Int,
                intent: Intent?
            ) {
                if (requestCode == REQUEST_CODE_CUSTOMER_CENTER) {
                    if (resultCode == Activity.RESULT_OK) {
                        Log.d(NAME, "Customer Center closed successfully")
                        customerCenterPromise?.resolve(null)
                    } else {
                        Log.d(NAME, "Customer Center closed with result $resultCode")
                        customerCenterPromise?.reject(
                            "CUSTOMER_CENTER_ERROR",
                            "Customer Center closed with result code: $resultCode",
                            null
                        )
                    }
                    customerCenterPromise = null
                }
            }
        }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun presentCustomerCenter(
        promise: Promise
    ) {
        currentActivity?.let {
            customerCenterPromise = promise
            presentCustomerCenterFromActivity(it)
        } ?: run {
            promise.reject(
                "CUSTOMER_CENTER_MISSING_ACTIVITY",
                "Could not present Customer Center. There's no activity",
                null
            )
        }
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private fun presentCustomerCenterFromActivity(
        activity: Activity
    ) {
        val customerCenterListener = createCustomerCenterListener()
        Purchases.sharedInstance.customerCenterListener = customerCenterListener
        val intent = ShowCustomerCenter()
            .createIntent(activity, Unit)
        activity.startActivityForResult(intent, REQUEST_CODE_CUSTOMER_CENTER)
    }

    private fun createCustomerCenterListener(): CustomerCenterListener {
        return object : CustomerCenterListener {
            override fun onFeedbackSurveyCompleted(feedbackSurveyOptionId: String) {
                val params = WritableNativeMap().apply {
                    putString("feedbackSurveyOptionId", feedbackSurveyOptionId)
                }
                sendEvent("onFeedbackSurveyCompleted", params)
            }

            override fun onShowingManageSubscriptions() {
                sendEvent("onShowingManageSubscriptions", null)
            }

            override fun onRestoreCompleted(customerInfo: CustomerInfo) {
                val params = WritableNativeMap().apply {
                    // TODO
//                    putMap("customerInfo", RNPurchasesConverters.convertCustomerInfoToMap(customerInfo))
                }
                sendEvent("onRestoreCompleted", params)
            }

            override fun onRestoreFailed(error: PurchasesError) {
                val params = WritableNativeMap().apply {
                    // TODO
//                    putMap("error", RNPurchasesConverters.convertErrorToMap(error))
                }
                sendEvent("onRestoreFailed", params)
            }

            override fun onRestoreStarted() {
                sendEvent("onRestoreStarted", null)
            }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext.runOnUiQueueThread {
            try {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            } catch (e: Exception) {
                Log.e(NAME, "Error sending event $eventName", e)
            }
        }
    }
}
