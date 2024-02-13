package com.revenuecat.purchases.react.ui

internal enum class PaywallEvent(val eventName: String) {
    ON_PURCHASE_COMPLETED("onPurchaseCompleted"),
    ON_PURCHASE_ERROR("onPurchaseError"),
    ON_PURCHASE_CANCELLED("onPurchaseCancelled"),
    ON_RESTORE_COMPLETED("onRestoreCompleted"),
    ON_RESTORE_ERROR("onRestoreError"),
    ON_DISMISS("onDismiss");
}

internal enum class PaywallEventKey(val key: String) {
    CUSTOMER_INFO("customerInfo"),
    STORE_TRANSACTION("storeTransaction"),
    ERROR("error")
}
