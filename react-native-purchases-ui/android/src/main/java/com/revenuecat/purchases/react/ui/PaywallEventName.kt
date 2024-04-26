package com.revenuecat.purchases.react.ui

internal enum class PaywallEventName(val eventName: String) {
    ON_PURCHASE_STARTED("onPurchaseStarted"),
    ON_PURCHASE_COMPLETED("onPurchaseCompleted"),
    ON_PURCHASE_ERROR("onPurchaseError"),
    ON_PURCHASE_CANCELLED("onPurchaseCancelled"),
    ON_RESTORE_STARTED("onRestoreStarted"),
    ON_RESTORE_COMPLETED("onRestoreCompleted"),
    ON_RESTORE_ERROR("onRestoreError"),
    ON_DISMISS("onDismiss"),
    ON_MEASURE("onMeasure");
}

internal enum class PaywallEventKey(val key: String) {
    PACKAGE("packageBeingPurchased"),
    CUSTOMER_INFO("customerInfo"),
    STORE_TRANSACTION("storeTransaction"),
    ERROR("error"),
    MEASUREMENTS("measurements"),
    HEIGHT("height"),
}
