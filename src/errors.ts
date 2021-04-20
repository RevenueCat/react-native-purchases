
// Error codes indicating the reason for an error.
export enum PurchasesErrorCode {
    UnknownError = 0,
    PurchaseCancelledError = 1,
    StoreProblemError = 2,
    PurchaseNotAllowedError = 3,
    PurchaseInvalidError = 4,
    ProductNotAvailableForPurchaseError = 5,
    ProductAlreadyPurchasedError = 6,
    ReceiptAlreadyInUseError = 7,
    InvalidReceiptError = 8,
    MissingReceiptFileError = 9,
    NetworkError = 10,
    InvalidCredentialsError = 11,
    UnexpectedBackendResponseError = 12,
    ReceiptInUseByOtherSubscriberError = 13,
    InvalidAppUserIdError = 14,
    OperationAlreadyInProgressError = 15,
    UnknownBackendError = 16,
    InvalidAppleSubscriptionKeyError = 17,
    IneligibleError = 18,
    InsufficientPermissionsError = 19,
    PaymentPendingError = 20,
    InvalidSubscriberAttributesError = 21,
    LogOutAnonymousUserError = 22,
}

export interface PurchasesError {
    code: string;
    message: string;
    readableErrorCode: string;
    underlyingErrorMessage: string;
    userCancelled: boolean | null;
}

export class PurchasesErrorHelper {
    /// Use this to convert an Error to a PurchasesErrorCode.
    /// It will return `PurchasesErrorCode.UnknownError` if the error code is not
    /// in the range of PurchasesErrorCodes.
    ///
    /// For example: 
    /// try {
    ///    PurchaserInfo purchaserInfo = await Purchases.purchasePackage(package);
    /// } catch (error) {
    ///     const errorCode = PurchasesErrorHelper.getErrorCode(error);
    ///     switch(errorCode) {
    ///     case PurchasesErrorCode.PurchaseCancelledError:
    ///       print("User cancelled");
    ///       break;
    ///     case PurchasesErrorCode.PurchaseNotAllowedError:
    ///       print("User not allowed to purchase");
    ///       break;
    ///     default:
    ///       // Do other stuff
    ///       break;
    ///   }
    /// }
    public static getErrorCode(error: PurchasesError): PurchasesErrorCode {
        const errorCode = parseInt(error.code, 10);

        if (errorCode in PurchasesErrorCode) {
            return errorCode as PurchasesErrorCode;
        } else {
            return PurchasesErrorCode.UnknownError;
        }
    }
}
