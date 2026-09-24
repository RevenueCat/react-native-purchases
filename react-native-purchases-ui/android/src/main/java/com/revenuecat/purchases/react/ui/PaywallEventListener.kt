package com.revenuecat.purchases.react.ui

import com.revenuecat.purchases.hybridcommon.ui.PaywallListenerWrapper

internal fun paywallEventListener(
    jsResumesPurchase: () -> Boolean,
    emit: (PaywallEventName, Map<String, Any?>) -> Unit,
): PaywallListenerWrapper = object : PaywallListenerWrapper() {
    override fun onPurchaseStarted(rcPackage: Map<String, Any?>) =
        emit(PaywallEventName.ON_PURCHASE_STARTED, mapOf(PaywallEventKey.PACKAGE.key to rcPackage))

    override fun onPurchaseCompleted(customerInfo: Map<String, Any?>, storeTransaction: Map<String, Any?>) =
        emit(
            PaywallEventName.ON_PURCHASE_COMPLETED,
            mapOf(
                PaywallEventKey.CUSTOMER_INFO.key to customerInfo,
                PaywallEventKey.STORE_TRANSACTION.key to storeTransaction,
            ),
        )

    override fun onPurchaseError(error: Map<String, Any?>) =
        emit(PaywallEventName.ON_PURCHASE_ERROR, mapOf(PaywallEventKey.ERROR.key to error))

    override fun onPurchaseCancelled() = emit(PaywallEventName.ON_PURCHASE_CANCELLED, emptyMap())

    override fun onRestoreStarted() = emit(PaywallEventName.ON_RESTORE_STARTED, emptyMap())

    override fun onRestoreCompleted(customerInfo: Map<String, Any?>) =
        emit(PaywallEventName.ON_RESTORE_COMPLETED, mapOf(PaywallEventKey.CUSTOMER_INFO.key to customerInfo))

    override fun onRestoreError(error: Map<String, Any?>) =
        emit(PaywallEventName.ON_RESTORE_ERROR, mapOf(PaywallEventKey.ERROR.key to error))

    override fun onPurchasePackageInitiated(rcPackage: Map<String, Any?>, requestId: String) {
        if (jsResumesPurchase()) {
            emit(
                PaywallEventName.ON_PURCHASE_PACKAGE_INITIATED,
                mapOf(PaywallEventKey.PACKAGE.key to rcPackage, PaywallEventKey.REQUEST_ID.key to requestId),
            )
        } else {
            super.onPurchasePackageInitiated(rcPackage, requestId)
        }
    }

    override fun onWebCheckoutOpened() = emit(PaywallEventName.ON_WEB_CHECKOUT_OPENED, emptyMap())

    override fun onUrlOpened(url: String) = emit(PaywallEventName.ON_URL_OPENED, mapOf(PaywallEventKey.URL.key to url))

    override fun onInteraction(event: Map<String, Any>) = emit(PaywallEventName.ON_INTERACTION, event)
}
