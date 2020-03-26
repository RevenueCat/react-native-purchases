package com.revenuecat.purchases.common

import android.app.Activity
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.SkuDetails
import com.revenuecat.purchases.PurchaserInfo
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesError
import com.revenuecat.purchases.PurchasesErrorCode
import com.revenuecat.purchases.UpgradeInfo
import com.revenuecat.purchases.createAliasWith
import com.revenuecat.purchases.getNonSubscriptionSkusWith
import com.revenuecat.purchases.getOfferingsWith
import com.revenuecat.purchases.getPurchaserInfoWith
import com.revenuecat.purchases.getSubscriptionSkusWith
import com.revenuecat.purchases.identifyWith
import com.revenuecat.purchases.purchasePackageWith
import com.revenuecat.purchases.purchaseProductWith
import com.revenuecat.purchases.resetWith
import com.revenuecat.purchases.restorePurchasesWith
import org.json.JSONObject

fun addAttributionData(
    data: Map<String, String>,
    network: Int,
    networkUserId: String?
) {
    for (attributionNetwork in Purchases.AttributionNetwork.values()) {
        if (attributionNetwork.serverValue == network) {
            Purchases.addAttributionData(data, attributionNetwork, networkUserId)
        }
    }
}

fun addAttributionData(
    data: JSONObject,
    network: Int,
    networkUserId: String?
) {
    for (attributionNetwork in Purchases.AttributionNetwork.values()) {
        if (attributionNetwork.serverValue == network) {
            Purchases.addAttributionData(data, attributionNetwork, networkUserId)
        }
    }
}

fun setAllowSharingAppStoreAccount(
    allowSharingAppStoreAccount: Boolean
) {
    Purchases.sharedInstance.allowSharingPlayStoreAccount = allowSharingAppStoreAccount
}

fun getOfferings(
    onResult: OnResult
) {
    Purchases.sharedInstance.getOfferingsWith(onError = { onResult.onError(it.map()) }) {
        onResult.onReceived(it.map())
    }
}

fun getProductInfo(
    productIDs: List<String>,
    type: String,
    onResult: OnResultList
) {
    val onError: (PurchasesError) -> Unit = { onResult.onError(it.map()) }
    val onReceived: (List<SkuDetails>) -> Unit = { onResult.onReceived(it.map()) }

    if (type.equals("subs", ignoreCase = true)) {
        Purchases.sharedInstance.getSubscriptionSkusWith(productIDs, onError, onReceived)
    } else {
        Purchases.sharedInstance.getNonSubscriptionSkusWith(productIDs, onError, onReceived)
    }
}

fun purchaseProduct(
    activity: Activity?,
    productIdentifier: String,
    oldSku: String?,
    prorationMode: Int?,
    type: String,
    onResult: OnResult
) {
    if (activity != null) {
        val onReceiveSkus: (List<SkuDetails>) -> Unit = { skus ->
            val productToBuy = skus.firstOrNull {
                it.sku == productIdentifier && it.type.equals(type, ignoreCase = true)
            }
            if (productToBuy != null) {
                if (oldSku == null || oldSku.isBlank()) {
                    Purchases.sharedInstance.purchaseProductWith(
                        activity,
                        productToBuy,
                        onError = getMakePurchaseErrorFunction(onResult),
                        onSuccess = getMakePurchaseSuccessFunction(onResult)
                    )
                } else {
                    Purchases.sharedInstance.purchaseProductWith(
                        activity,
                        productToBuy,
                        UpgradeInfo(oldSku, prorationMode),
                        onError = getMakePurchaseErrorFunction(onResult),
                        onSuccess = getMakePurchaseSuccessFunction(onResult)
                    )
                }
            } else {
                onResult.onError(
                    PurchasesError(
                        PurchasesErrorCode.ProductNotAvailableForPurchaseError,
                        "Couldn't find product."
                    ).map()
                )
            }

        }
        if (type.equals("subs", ignoreCase = true)) {
            Purchases.sharedInstance.getSubscriptionSkusWith(
                listOf(productIdentifier),
                { onResult.onError(it.map()) },
                onReceiveSkus
            )
        } else {
            Purchases.sharedInstance.getNonSubscriptionSkusWith(
                listOf(productIdentifier),
                { onResult.onError(it.map()) },
                onReceiveSkus
            )
        }
    } else {
        onResult.onError(
            PurchasesError(
                PurchasesErrorCode.PurchaseInvalidError,
                "There is no current Activity"
            ).map()
        )
    }
}


fun purchasePackage(
    activity: Activity?,
    packageIdentifier: String,
    offeringIdentifier: String,
    oldSku: String?,
    prorationMode: Int?,
    onResult: OnResult
) {
    if (activity != null) {
        Purchases.sharedInstance.getOfferingsWith(
            { onResult.onError(it.map()) },
            { offerings ->
                val packageToBuy =
                    offerings[offeringIdentifier]?.availablePackages?.firstOrNull {
                        it.identifier.equals(packageIdentifier, ignoreCase = true)
                    }
                if (packageToBuy != null) {
                    if (oldSku == null || oldSku.isBlank()) {
                        Purchases.sharedInstance.purchasePackageWith(
                            activity,
                            packageToBuy,
                            onError = getMakePurchaseErrorFunction(onResult),
                            onSuccess = getMakePurchaseSuccessFunction(onResult)
                        )
                    } else {
                        Purchases.sharedInstance.purchasePackageWith(
                            activity,
                            packageToBuy,
                            UpgradeInfo(oldSku, prorationMode),
                            onError = getMakePurchaseErrorFunction(onResult),
                            onSuccess = getMakePurchaseSuccessFunction(onResult)
                        )
                    }
                } else {
                    onResult.onError(
                        PurchasesError(
                            PurchasesErrorCode.ProductNotAvailableForPurchaseError,
                            "Couldn't find product."
                        ).map()
                    )
                }
            }
        )
    } else {
        onResult.onError(
            PurchasesError(
                PurchasesErrorCode.PurchaseInvalidError,
                "There is no current Activity"
            ).map()
        )
    }
}

fun getAppUserID() = Purchases.sharedInstance.appUserID

fun restoreTransactions(
    onResult: OnResult
) {
    Purchases.sharedInstance.restorePurchasesWith(onError = { onResult.onError(it.map()) }) {
        onResult.onReceived(it.map())
    }
}

fun reset(
    onResult: OnResult
) {
    Purchases.sharedInstance.resetWith(onError = { onResult.onError(it.map()) }) {
        onResult.onReceived(it.map())
    }
}

fun identify(
    appUserID: String,
    onResult: OnResult
) {
    Purchases.sharedInstance.identifyWith(appUserID, onError = { onResult.onError(it.map()) }) {
        onResult.onReceived(it.map())
    }
}

fun createAlias(
    newAppUserID: String,
    onResult: OnResult
) {
    Purchases.sharedInstance.createAliasWith(
        newAppUserID,
        onError = { onResult.onError(it.map()) }) {
        onResult.onReceived(it.map())
    }
}

fun setDebugLogsEnabled(
    enabled: Boolean
) {
    Purchases.debugLogsEnabled = enabled
}

fun getPurchaserInfo(
    onResult: OnResult
) {
    Purchases.sharedInstance.getPurchaserInfoWith(onError = { onResult.onError(it.map()) }) {
        onResult.onReceived(it.map())
    }
}

fun syncPurchases() {
    Purchases.sharedInstance.syncPurchases()
}

fun isAnonymous(): Boolean {
    return Purchases.sharedInstance.isAnonymous
}

fun setFinishTransactions(
    enabled: Boolean
) {
    Purchases.sharedInstance.finishTransactions = enabled
}

// Returns Unknown for all since it's not available in Android
fun checkTrialOrIntroductoryPriceEligibility(
    productIdentifiers: List<String>
): Map<String, Map<String, Any>> {
    // INTRO_ELIGIBILITY_STATUS_UNKNOWN = 0
    return productIdentifiers.map {
        it to mapOf("status" to 0, "description" to "Status indeterminate.")
    }.toMap()
}

fun invalidatePurchaserInfoCache() { 
    Purchases.sharedInstance.invalidatePurchaserInfoCache()
}

// region Subscriber Attributes

fun setAttributes(attributes: Map<String, String?>) {
    Purchases.sharedInstance.setAttributes(attributes)
}

fun setEmail(email: String?) {
    Purchases.sharedInstance.setEmail(email)
}

fun setPhoneNumber(phoneNumber: String?) {
    Purchases.sharedInstance.setPhoneNumber(phoneNumber)
}

fun setDisplayName(displayName: String?) {
    Purchases.sharedInstance.setDisplayName(displayName)
}

fun setPushToken(fcmToken: String?) {
    Purchases.sharedInstance.setPushToken(fcmToken)
}

// region private functions

private fun getMakePurchaseErrorFunction(onResult: OnResult): (PurchasesError, Boolean) -> Unit {
    return { error, userCancelled -> onResult.onError(error.map(mapOf("userCancelled" to userCancelled))) }
}

private fun getMakePurchaseSuccessFunction(onResult: OnResult): (Purchase, PurchaserInfo) -> Unit {
    return { purchase, purchaserInfo ->
        onResult.onReceived(
            mapOf(
                "productIdentifier" to purchase.sku,
                "purchaserInfo" to purchaserInfo.map()
            )
        )
    }
}

private fun PurchasesError.map(
    extra: Map<String, Any?> = mapOf()
): ErrorContainer =
    ErrorContainer(
        code.ordinal,
        message,
        mapOf(
            "code" to code.ordinal,
            "message" to message,
            "readableErrorCode" to code.name,
            "readable_error_code" to code.name,
            "underlyingErrorMessage" to (underlyingErrorMessage ?: "")
        ) + extra
    )

data class ErrorContainer(
    val code: Int,
    val message: String,
    val info: Map<String, Any?>
)
