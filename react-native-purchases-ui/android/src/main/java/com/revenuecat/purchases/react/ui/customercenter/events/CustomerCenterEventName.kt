package com.revenuecat.purchases.react.ui.customercenter.events

internal enum class CustomerCenterEventName(val eventName: String) {
    ON_DISMISS("onDismiss"),
    ON_CUSTOM_ACTION_SELECTED("onCustomActionSelected"),
    ON_RESTORE_STARTED("onRestoreStarted"),
    ON_RESTORE_COMPLETED("onRestoreCompleted"),
    ON_RESTORE_FAILED("onRestoreFailed"),
    ON_SHOWING_MANAGE_SUBSCRIPTIONS("onShowingManageSubscriptions"),
    ON_FEEDBACK_SURVEY_COMPLETED("onFeedbackSurveyCompleted"),
    ON_MANAGEMENT_OPTION_SELECTED("onManagementOptionSelected"),
    ON_REFUND_REQUEST_STARTED("onRefundRequestStarted"),
    ON_REFUND_REQUEST_COMPLETED("onRefundRequestCompleted");
}
