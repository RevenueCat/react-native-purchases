"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PURCHASES_ERROR_CODE = void 0;
// Error codes indicating the reason for an error.
var PURCHASES_ERROR_CODE;
(function (PURCHASES_ERROR_CODE) {
    PURCHASES_ERROR_CODE["UNKNOWN_ERROR"] = "0";
    PURCHASES_ERROR_CODE["PURCHASE_CANCELLED_ERROR"] = "1";
    PURCHASES_ERROR_CODE["STORE_PROBLEM_ERROR"] = "2";
    PURCHASES_ERROR_CODE["PURCHASE_NOT_ALLOWED_ERROR"] = "3";
    PURCHASES_ERROR_CODE["PURCHASE_INVALID_ERROR"] = "4";
    PURCHASES_ERROR_CODE["PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR"] = "5";
    PURCHASES_ERROR_CODE["PRODUCT_ALREADY_PURCHASED_ERROR"] = "6";
    PURCHASES_ERROR_CODE["RECEIPT_ALREADY_IN_USE_ERROR"] = "7";
    PURCHASES_ERROR_CODE["INVALID_RECEIPT_ERROR"] = "8";
    PURCHASES_ERROR_CODE["MISSING_RECEIPT_FILE_ERROR"] = "9";
    PURCHASES_ERROR_CODE["NETWORK_ERROR"] = "10";
    PURCHASES_ERROR_CODE["INVALID_CREDENTIALS_ERROR"] = "11";
    PURCHASES_ERROR_CODE["UNEXPECTED_BACKEND_RESPONSE_ERROR"] = "12";
    PURCHASES_ERROR_CODE["RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR"] = "13";
    PURCHASES_ERROR_CODE["INVALID_APP_USER_ID_ERROR"] = "14";
    PURCHASES_ERROR_CODE["OPERATION_ALREADY_IN_PROGRESS_ERROR"] = "15";
    PURCHASES_ERROR_CODE["UNKNOWN_BACKEND_ERROR"] = "16";
    PURCHASES_ERROR_CODE["INVALID_APPLE_SUBSCRIPTION_KEY_ERROR"] = "17";
    PURCHASES_ERROR_CODE["INELIGIBLE_ERROR"] = "18";
    PURCHASES_ERROR_CODE["INSUFFICIENT_PERMISSIONS_ERROR"] = "19";
    PURCHASES_ERROR_CODE["PAYMENT_PENDING_ERROR"] = "20";
    PURCHASES_ERROR_CODE["INVALID_SUBSCRIBER_ATTRIBUTES_ERROR"] = "21";
    PURCHASES_ERROR_CODE["LOG_OUT_ANONYMOUS_USER_ERROR"] = "22";
})(PURCHASES_ERROR_CODE = exports.PURCHASES_ERROR_CODE || (exports.PURCHASES_ERROR_CODE = {}));
