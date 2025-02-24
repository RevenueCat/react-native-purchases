package com.revenuecat.purchases.react.ui

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.revenuecat.purchases.PurchasesErrorCode
import com.revenuecat.purchases.hybridcommon.ui.PaywallResultListener
import com.revenuecat.purchases.hybridcommon.ui.PaywallSource
import com.revenuecat.purchases.hybridcommon.ui.PresentPaywallOptions
import com.revenuecat.purchases.hybridcommon.ui.presentPaywallFromFragment
import com.revenuecat.purchases.ui.revenuecatui.customercenter.ShowCustomerCenter


internal class RNPaywallsModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNPaywalls"
        private const val REQUEST_CODE_CUSTOMER_CENTER = 1001
    }

    private val currentActivityFragment: FragmentActivity?
        get() {
            return when (val currentActivity = currentActivity) {
                is FragmentActivity -> currentActivity
                else -> {
                    Log.e(NAME, "RevenueCat paywalls require application to use a FragmentActivity")
                    null
                }
            }
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
                            PurchasesErrorCode.UnknownError.code.toString(),
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
    fun presentPaywall(
        offeringIdentifier: String?,
        displayCloseButton: Boolean?,
        fontFamily: String?,
        promise: Promise
    ) {
        presentPaywall(
            null,
            offeringIdentifier,
            displayCloseButton,
            fontFamily,
            promise
        )
    }

    @ReactMethod
    fun presentPaywallIfNeeded(
        requiredEntitlementIdentifier: String,
        offeringIdentifier: String?,
        displayCloseButton: Boolean,
        fontFamily: String?,
        promise: Promise
    ) {
        presentPaywall(
            requiredEntitlementIdentifier,
            offeringIdentifier,
            displayCloseButton,
            fontFamily,
            promise
        )
    }

    @ReactMethod
    fun presentCustomerCenter(
        promise: Promise
    ) {
        currentActivity?.let {
            presentCustomerCenterFromActivity(it)
            customerCenterPromise = promise
        } ?: run {
            promise.reject(
                PurchasesErrorCode.UnknownError.code.toString(),
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

    private fun presentPaywall(
        requiredEntitlementIdentifier: String?,
        offeringIdentifier: String?,
        displayCloseButton: Boolean?,
        fontFamilyName: String?,
        promise: Promise
    ) {
        val fragment = currentActivityFragment ?: return
        val fontFamily = fontFamilyName?.let {
            FontAssetManager.getPaywallFontFamily(fontFamilyName = it, fragment.resources.assets)
        }
        presentPaywallFromFragment(
            fragment = fragment,
            PresentPaywallOptions(
                requiredEntitlementIdentifier = requiredEntitlementIdentifier,
                shouldDisplayDismissButton = displayCloseButton,
                paywallSource = offeringIdentifier?.let {
                    PaywallSource.OfferingIdentifier(it)
                } ?: PaywallSource.DefaultOffering,
                paywallResultListener = object : PaywallResultListener {
                    override fun onPaywallResult(paywallResult: String) {
                        promise.resolve(paywallResult)
                    }
                },
                fontFamily = fontFamily
            )
        )
    }

    private fun presentCustomerCenterFromActivity(
        activity: Activity
    ) {
        val intent = ShowCustomerCenter()
            .createIntent(activity, Unit)
        activity.startActivityForResult(intent, REQUEST_CODE_CUSTOMER_CENTER)
    }
}
