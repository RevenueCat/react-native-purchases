package com.revenuecat.purchases.react.ui.customercenter.events

internal class CustomerCenterOnDismissEvent(
    surfaceId: Int,
    viewTag: Int,
) : CustomerCenterEvent<CustomerCenterOnDismissEvent>(surfaceId, viewTag) {
    override fun getCustomerCenterEventName() = CustomerCenterEventName.ON_DISMISS
}
