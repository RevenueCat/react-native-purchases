import {ErrorInfo, PurchasesError, PURCHASES_ERROR_CODE} from '../dist';

function checkErrorCodes(errorCode: PURCHASES_ERROR_CODE): boolean {
  switch (errorCode) {
    case PURCHASES_ERROR_CODE.UNKNOWN_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.INVALID_RECEIPT_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.MISSING_RECEIPT_FILE_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.OPERATION_ALREADY_IN_PROGRESS_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.UNKNOWN_BACKEND_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.INVALID_APPLE_SUBSCRIPTION_KEY_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.INELIGIBLE_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.INSUFFICIENT_PERMISSIONS_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.INVALID_SUBSCRIBER_ATTRIBUTES_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.LOG_OUT_ANONYMOUS_USER_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.CONFIGURATION_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.EMPTY_SUBSCRIBER_ATTRIBUTES_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PRODUCT_DISCOUNT_MISSING_IDENTIFIER_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PRODUCT_DISCOUNT_MISSING_SUBSCRIPTION_GROUP_IDENTIFIER_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.CUSTOMER_INFO_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.SYSTEM_INFO_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.BEGIN_REFUND_REQUEST_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.PRODUCT_REQUEST_TIMED_OUT_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.API_ENDPOINT_BLOCKED:
      return true;
    case PURCHASES_ERROR_CODE.INVALID_PROMOTIONAL_OFFER_ERROR:
      return true;
    case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
      return true;
  }
}

function checkPurchasesError(purchasesError: PurchasesError) {
  const errorCode: PURCHASES_ERROR_CODE = purchasesError.code;
  const message: string = purchasesError.message;
  const readableErrorCode: string = purchasesError.readableErrorCode;
  const userInfo: ErrorInfo = purchasesError.userInfo;
  const underlyingErrorMessage: string = purchasesError.underlyingErrorMessage;
  const userCancelled: boolean | null = purchasesError.userCancelled;
}

function checkErrorInfo(errorInfo: ErrorInfo) {
  const readableErrorCode: string = errorInfo.readableErrorCode;
}
