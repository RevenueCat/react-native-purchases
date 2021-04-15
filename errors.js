"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesErrorHelper = exports.PurchasesErrorCode = void 0;
// Error codes indicating the reson for an error.
var PurchasesErrorCode;
(function (PurchasesErrorCode) {
    PurchasesErrorCode[PurchasesErrorCode["UnknownError"] = 0] = "UnknownError";
    PurchasesErrorCode[PurchasesErrorCode["PurchaseCancelledError"] = 1] = "PurchaseCancelledError";
    PurchasesErrorCode[PurchasesErrorCode["StoreProblemError"] = 2] = "StoreProblemError";
    PurchasesErrorCode[PurchasesErrorCode["PurchaseNotAllowedError"] = 3] = "PurchaseNotAllowedError";
    PurchasesErrorCode[PurchasesErrorCode["PurchaseInvalidError"] = 4] = "PurchaseInvalidError";
    PurchasesErrorCode[PurchasesErrorCode["ProductNotAvailableForPurchaseError"] = 5] = "ProductNotAvailableForPurchaseError";
    PurchasesErrorCode[PurchasesErrorCode["ProductAlreadyPurchasedError"] = 6] = "ProductAlreadyPurchasedError";
    PurchasesErrorCode[PurchasesErrorCode["ReceiptAlreadyInUseError"] = 7] = "ReceiptAlreadyInUseError";
    PurchasesErrorCode[PurchasesErrorCode["InvalidReceiptError"] = 8] = "InvalidReceiptError";
    PurchasesErrorCode[PurchasesErrorCode["MissingReceiptFileError"] = 9] = "MissingReceiptFileError";
    PurchasesErrorCode[PurchasesErrorCode["NetworkError"] = 10] = "NetworkError";
    PurchasesErrorCode[PurchasesErrorCode["InvalidCredentialsError"] = 11] = "InvalidCredentialsError";
    PurchasesErrorCode[PurchasesErrorCode["UnexpectedBackendResponseError"] = 12] = "UnexpectedBackendResponseError";
    PurchasesErrorCode[PurchasesErrorCode["ReceiptInUseByOtherSubscriberError"] = 13] = "ReceiptInUseByOtherSubscriberError";
    PurchasesErrorCode[PurchasesErrorCode["InvalidAppUserIdError"] = 14] = "InvalidAppUserIdError";
    PurchasesErrorCode[PurchasesErrorCode["OperationAlreadyInProgressError"] = 15] = "OperationAlreadyInProgressError";
    PurchasesErrorCode[PurchasesErrorCode["UnknownBackendError"] = 16] = "UnknownBackendError";
    PurchasesErrorCode[PurchasesErrorCode["InvalidAppleSubscriptionKeyError"] = 17] = "InvalidAppleSubscriptionKeyError";
    PurchasesErrorCode[PurchasesErrorCode["IneligibleError"] = 18] = "IneligibleError";
    PurchasesErrorCode[PurchasesErrorCode["InsufficientPermissionsError"] = 19] = "InsufficientPermissionsError";
    PurchasesErrorCode[PurchasesErrorCode["PaymentPendingError"] = 20] = "PaymentPendingError";
    PurchasesErrorCode[PurchasesErrorCode["InvalidSubscriberAttributesError"] = 21] = "InvalidSubscriberAttributesError";
    PurchasesErrorCode[PurchasesErrorCode["LogOutAnonymousUserError"] = 22] = "LogOutAnonymousUserError";
})(PurchasesErrorCode = exports.PurchasesErrorCode || (exports.PurchasesErrorCode = {}));
var PurchasesErrorHelper = /** @class */ (function () {
    function PurchasesErrorHelper() {
    }
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
    PurchasesErrorHelper.getErrorCode = function (error) {
        var errorCode = parseInt(error.code, 10);
        if (errorCode in PurchasesErrorCode) {
            return errorCode;
        }
        else {
            return PurchasesErrorCode.UnknownError;
        }
    };
    return PurchasesErrorHelper;
}());
exports.PurchasesErrorHelper = PurchasesErrorHelper;
