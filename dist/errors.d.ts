export declare enum PURCHASES_ERROR_CODE {
    UNKNOWN_ERROR = "0",
    PURCHASE_CANCELLED_ERROR = "1",
    STORE_PROBLEM_ERROR = "2",
    PURCHASE_NOT_ALLOWED_ERROR = "3",
    PURCHASE_INVALID_ERROR = "4",
    PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR = "5",
    PRODUCT_ALREADY_PURCHASED_ERROR = "6",
    RECEIPT_ALREADY_IN_USE_ERROR = "7",
    INVALID_RECEIPT_ERROR = "8",
    MISSING_RECEIPT_FILE_ERROR = "9",
    NETWORK_ERROR = "10",
    INVALID_CREDENTIALS_ERROR = "11",
    UNEXPECTED_BACKEND_RESPONSE_ERROR = "12",
    RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR = "13",
    INVALID_APP_USER_ID_ERROR = "14",
    OPERATION_ALREADY_IN_PROGRESS_ERROR = "15",
    UNKNOWN_BACKEND_ERROR = "16",
    INVALID_APPLE_SUBSCRIPTION_KEY_ERROR = "17",
    INELIGIBLE_ERROR = "18",
    INSUFFICIENT_PERMISSIONS_ERROR = "19",
    PAYMENT_PENDING_ERROR = "20",
    INVALID_SUBSCRIBER_ATTRIBUTES_ERROR = "21",
    LOG_OUT_ANONYMOUS_USER_ERROR = "22"
}
export interface PurchasesError {
    code: PURCHASES_ERROR_CODE;
    message: string;
    readableErrorCode: string;
    userInfo: ErrorInfo;
    underlyingErrorMessage: string;
    userCancelled: boolean | null;
}
export interface ErrorInfo {
    readableErrorCode: string;
}
export declare class UninitializedPurchasesError extends Error {
    constructor();
}
