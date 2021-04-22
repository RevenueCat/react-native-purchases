
// Error codes indicating the reason for an error.
export enum PurchasesErrorCode {
    UnknownError = "0",
    PurchaseCancelledError = "1",
    StoreProblemError = "2",
    PurchaseNotAllowedError = "3",
    PurchaseInvalidError = "4",
    ProductNotAvailableForPurchaseError = "5",
    ProductAlreadyPurchasedError = "6",
    ReceiptAlreadyInUseError = "7",
    InvalidReceiptError = "8",
    MissingReceiptFileError = "9",
    NetworkError = "10",
    InvalidCredentialsError = "11",
    UnexpectedBackendResponseError = "12",
    ReceiptInUseByOtherSubscriberError = "13",
    InvalidAppUserIdError = "14",
    OperationAlreadyInProgressError = "15",
    UnknownBackendError = "16",
    InvalidAppleSubscriptionKeyError = "17",
    IneligibleError = "18",
    InsufficientPermissionsError = "19",
    PaymentPendingError = "20",
    InvalidSubscriberAttributesError = "21",
    LogOutAnonymousUserError = "22",
}

export interface PurchasesError {
    code: PurchasesErrorCode;
    message: string;
    readableErrorCode: string;
    underlyingErrorMessage: string;
    
   // @deprecated
   // use code === Purchases.PurchasesErrorCode.PurchaseCancelledError instead
   userCancelled: boolean | null;
}
