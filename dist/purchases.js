"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOREKIT_VERSION = exports.LOG_LEVEL = exports.REFUND_REQUEST_STATUS = exports.BILLING_FEATURE = exports.PURCHASES_ARE_COMPLETED_BY_TYPE = exports.PURCHASE_TYPE = void 0;
var react_native_1 = require("react-native");
var purchases_typescript_internal_1 = require("@revenuecat/purchases-typescript-internal");
// This export is kept to keep backwards compatibility to any possible users using this file directly
var purchases_typescript_internal_2 = require("@revenuecat/purchases-typescript-internal");
Object.defineProperty(exports, "PURCHASE_TYPE", { enumerable: true, get: function () { return purchases_typescript_internal_2.PURCHASE_TYPE; } });
Object.defineProperty(exports, "PURCHASES_ARE_COMPLETED_BY_TYPE", { enumerable: true, get: function () { return purchases_typescript_internal_2.PURCHASES_ARE_COMPLETED_BY_TYPE; } });
Object.defineProperty(exports, "BILLING_FEATURE", { enumerable: true, get: function () { return purchases_typescript_internal_2.BILLING_FEATURE; } });
Object.defineProperty(exports, "REFUND_REQUEST_STATUS", { enumerable: true, get: function () { return purchases_typescript_internal_2.REFUND_REQUEST_STATUS; } });
Object.defineProperty(exports, "LOG_LEVEL", { enumerable: true, get: function () { return purchases_typescript_internal_2.LOG_LEVEL; } });
Object.defineProperty(exports, "STOREKIT_VERSION", { enumerable: true, get: function () { return purchases_typescript_internal_2.STOREKIT_VERSION; } });
var react_native_2 = require("react-native");
var RNPurchases = react_native_1.NativeModules.RNPurchases;
var eventEmitter = new react_native_1.NativeEventEmitter(RNPurchases);
var customerInfoUpdateListeners = [];
var shouldPurchasePromoProductListeners = [];
var customLogHandler;
eventEmitter.addListener("Purchases-CustomerInfoUpdated", function (customerInfo) {
    customerInfoUpdateListeners.forEach(function (listener) { return listener(customerInfo); });
});
eventEmitter.addListener("Purchases-ShouldPurchasePromoProduct", function (_a) {
    var callbackID = _a.callbackID;
    shouldPurchasePromoProductListeners.forEach(function (listener) {
        return listener(function () { return RNPurchases.makeDeferredPurchase(callbackID); });
    });
});
eventEmitter.addListener("Purchases-LogHandlerEvent", function (_a) {
    var logLevel = _a.logLevel, message = _a.message;
    var logLevelEnum = purchases_typescript_internal_1.LOG_LEVEL[logLevel];
    customLogHandler(logLevelEnum, message);
});
var Purchases = /** @class */ (function () {
    function Purchases() {
    }
    /**
     * Sets up Purchases with your API key and an app user id.
     * @param {String} apiKey RevenueCat API Key. Needs to be a String
     * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
     * @param {PurchasesAreCompletedBy} [purchasesAreCompletedBy=PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT] Set this to an instance of PurchasesAreCompletedByMyApp if you have your own IAP implementation and want to use only RevenueCat's backend. Default is PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT.
     * @param {STOREKIT_VERSION} [storeKitVersion=DEFAULT] iOS-only. Defaults to STOREKIT_2. StoreKit 2 is only available on iOS 16+. StoreKit 1 will be used for previous iOS versions regardless of this setting.
     * @param {ENTITLEMENT_VERIFICATION_MODE} [entitlementVerificationMode=ENTITLEMENT_VERIFICATION_MODE.DISABLED] Sets the entitlement verifciation mode to use. For more details, check https://rev.cat/trusted-entitlements
     * @param {boolean} [useAmazon=false] An optional boolean. Android-only. Set this to TRUE to enable Amazon on compatible devices.
     * @param {String?} userDefaultsSuiteName An optional string. iOS-only, will be ignored for Android.
     * Set this if you would like the RevenueCat SDK to store its preferences in a different NSUserDefaults suite, otherwise it will use standardUserDefaults.
     * Default is null, which will make the SDK use standardUserDefaults.
     * @param {boolean} [pendingTransactionsForPrepaidPlansEnabled=false] An optional boolean. Android-only. Set this to TRUE to enable pending transactions for prepaid subscriptions in Google Play.
     *
     * @warning If you use purchasesAreCompletedBy=PurchasesAreCompletedByMyApp, you must also provide a value for storeKitVersion.
     */
    Purchases.configure = function (_a) {
        var apiKey = _a.apiKey, _b = _a.appUserID, appUserID = _b === void 0 ? null : _b, _c = _a.purchasesAreCompletedBy, purchasesAreCompletedBy = _c === void 0 ? purchases_typescript_internal_1.PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT : _c, userDefaultsSuiteName = _a.userDefaultsSuiteName, _d = _a.storeKitVersion, storeKitVersion = _d === void 0 ? purchases_typescript_internal_1.STOREKIT_VERSION.DEFAULT : _d, _e = _a.useAmazon, useAmazon = _e === void 0 ? false : _e, _f = _a.shouldShowInAppMessagesAutomatically, shouldShowInAppMessagesAutomatically = _f === void 0 ? true : _f, _g = _a.entitlementVerificationMode, entitlementVerificationMode = _g === void 0 ? purchases_typescript_internal_1.ENTITLEMENT_VERIFICATION_MODE.DISABLED : _g, _h = _a.pendingTransactionsForPrepaidPlansEnabled, pendingTransactionsForPrepaidPlansEnabled = _h === void 0 ? false : _h;
        if (apiKey === undefined || typeof apiKey !== "string") {
            throw new Error('Invalid API key. It must be called with an Object: configure({apiKey: "key"})');
        }
        if (appUserID !== null &&
            typeof appUserID !== "undefined" &&
            typeof appUserID !== "string") {
            throw new Error("appUserID needs to be a string");
        }
        var purchasesCompletedByToUse = purchases_typescript_internal_1.PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT;
        var storeKitVersionToUse = storeKitVersion;
        if (Purchases.isPurchasesAreCompletedByMyApp(purchasesAreCompletedBy)) {
            purchasesCompletedByToUse = purchases_typescript_internal_1.PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP;
            storeKitVersionToUse = purchasesAreCompletedBy.storeKitVersion;
            if (storeKitVersion !== purchases_typescript_internal_1.STOREKIT_VERSION.DEFAULT &&
                storeKitVersionToUse !== storeKitVersion) {
                // Typically, console messages aren't used in TS libraries, but in this case it's worth calling out the difference in
                // StoreKit versions, and since the difference isn't possible farther down the call chain, we should go ahead
                // and log it here.
                // tslint:disable-next-line:no-console
                console.warn("Warning: The storeKitVersion in purchasesAreCompletedBy does not match the function's storeKitVersion parameter. We will use the value found in purchasesAreCompletedBy.");
            }
            if (storeKitVersionToUse === purchases_typescript_internal_1.STOREKIT_VERSION.DEFAULT) {
                // tslint:disable-next-line:no-console
                console.warn("Warning: You should provide the specific StoreKit version you're using in your implementation when configuring PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP, and not rely on the DEFAULT.");
            }
        }
        RNPurchases.setupPurchases(apiKey, appUserID, purchasesCompletedByToUse, userDefaultsSuiteName, storeKitVersionToUse, useAmazon, shouldShowInAppMessagesAutomatically, entitlementVerificationMode, pendingTransactionsForPrepaidPlansEnabled);
    };
    /**
     * @deprecated, configure behavior through the RevenueCat dashboard (app.revenuecat.com) instead.
     * If an user tries to purchase a product that is active on the current app store account,
     * we will treat it as a restore and alias the new ID with the previous id.
     * If you have configured the Legacy restore behavior in the RevenueCat dashboard
     * and are currently setting this to true, keep this setting active.
     * @param {boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous,
     * this is true by default if you didn't pass an appUserID
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    Purchases.setAllowSharingStoreAccount = function (allowSharing) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setAllowSharingStoreAccount(allowSharing);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * iOS only.
     * @param {boolean} simulatesAskToBuyInSandbox Set this property to true *only* when testing the ask-to-buy / SCA
     * purchases flow. More information: http://errors.rev.cat/ask-to-buy
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    Purchases.setSimulatesAskToBuyInSandbox = function (simulatesAskToBuyInSandbox) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (react_native_2.Platform.OS === "ios") {
                    RNPurchases.setSimulatesAskToBuyInSandbox(simulatesAskToBuyInSandbox);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Sets a function to be called on updated customer info
     * @param {CustomerInfoUpdateListener} customerInfoUpdateListener CustomerInfo update listener
     */
    Purchases.addCustomerInfoUpdateListener = function (customerInfoUpdateListener) {
        if (typeof customerInfoUpdateListener !== "function") {
            throw new Error("addCustomerInfoUpdateListener needs a function");
        }
        customerInfoUpdateListeners.push(customerInfoUpdateListener);
    };
    /**
     * Removes a given CustomerInfoUpdateListener
     * @param {CustomerInfoUpdateListener} listenerToRemove CustomerInfoUpdateListener reference of the listener to remove
     * @returns {boolean} True if listener was removed, false otherwise
     */
    Purchases.removeCustomerInfoUpdateListener = function (listenerToRemove) {
        if (customerInfoUpdateListeners.includes(listenerToRemove)) {
            customerInfoUpdateListeners = customerInfoUpdateListeners.filter(function (listener) { return listenerToRemove !== listener; });
            return true;
        }
        return false;
    };
    /**
     * Sets a function to be called on purchases initiated on the Apple App Store. This is only used in iOS.
     * @param {ShouldPurchasePromoProductListener} shouldPurchasePromoProductListener Called when a user initiates a
     * promotional in-app purchase from the App Store. If your app is able to handle a purchase at the current time, run
     * the deferredPurchase function. If the app is not in a state to make a purchase: cache the deferredPurchase, then
     * call the deferredPurchase when the app is ready to make the promotional purchase.
     * If the purchase should never be made, you don't need to ever call the deferredPurchase and the app will not
     * proceed with promotional purchases.
     */
    Purchases.addShouldPurchasePromoProductListener = function (shouldPurchasePromoProductListener) {
        if (typeof shouldPurchasePromoProductListener !== "function") {
            throw new Error("addShouldPurchasePromoProductListener needs a function");
        }
        shouldPurchasePromoProductListeners.push(shouldPurchasePromoProductListener);
    };
    /**
     * Removes a given ShouldPurchasePromoProductListener
     * @param {ShouldPurchasePromoProductListener} listenerToRemove ShouldPurchasePromoProductListener reference of
     * the listener to remove
     * @returns {boolean} True if listener was removed, false otherwise
     */
    Purchases.removeShouldPurchasePromoProductListener = function (listenerToRemove) {
        if (shouldPurchasePromoProductListeners.includes(listenerToRemove)) {
            shouldPurchasePromoProductListeners =
                shouldPurchasePromoProductListeners.filter(function (listener) { return listenerToRemove !== listener; });
            return true;
        }
        return false;
    };
    /**
     * Gets the map of entitlements -> offerings -> products
     * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure. The promise will be rejected if configure
     * has not been called yet.
     */
    Purchases.getOfferings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.getOfferings()];
                }
            });
        });
    };
    /**
     * Retrieves a current offering for a placement identifier, use this to access offerings defined by targeting
     * placements configured in the RevenueCat dashboard.
     * @param {String} placementIdentifier The placement identifier to fetch a current offeringn for
     * @returns {Promise<PurchasesOffering | null>} Promise of an optional offering. The promise will be rejected if configure
     * has not been called yet.
     */
    Purchases.getCurrentOfferingForPlacement = function (placementIdentifier) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.getCurrentOfferingForPlacement(placementIdentifier)];
                }
            });
        });
    };
    /**
     * Syncs subscriber attributes and then fetches the configured offerings for this user. This method is intended to
     * be called when using Targeting Rules with Custom Attributes. Any subscriber attributes should be set before
     * calling this method to ensure the returned offerings are applied with the latest subscriber attributes.
     * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure. The promise will be rejected if configure
     * has not been called yet.
     */
    Purchases.syncAttributesAndOfferingsIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.syncAttributesAndOfferingsIfNeeded()];
                }
            });
        });
    };
    /**
     * Fetch the product info
     * @param {String[]} productIdentifiers Array of product identifiers
     * @param {String} type Optional type of products to fetch, can be SUBSCRIPTION or NON_SUBSCRIPTION. SUBSCRIPTION by default
     * @returns {Promise<PurchasesStoreProduct[]>} A promise containing an array of products. The promise will be rejected
     * if the products are not properly configured in RevenueCat or if there is another error retrieving them.
     * Rejections return an error code, and a userInfo object with more information. The promise will also be rejected
     * if configure has not been called yet.
     */
    Purchases.getProducts = function (productIdentifiers_1) {
        return __awaiter(this, arguments, void 0, function (productIdentifiers, type) {
            if (type === void 0) { type = purchases_typescript_internal_1.PRODUCT_CATEGORY.SUBSCRIPTION; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.getProductInfo(productIdentifiers, type)];
                }
            });
        });
    };
    /**
     * Make a purchase
     *
     * @param {String} productIdentifier The product identifier of the product you want to purchase
     * @param {UpgradeInfo} upgradeInfo Android only. Optional UpgradeInfo you wish to upgrade from containing the oldSKU
     * and the optional prorationMode.
     * @param {String} type Optional type of product, can be inapp or subs. Subs by default
     * @deprecated, use purchaseStoreProduct instead
     */
    Purchases.purchaseProduct = function (productIdentifier_1, upgradeInfo_1) {
        return __awaiter(this, arguments, void 0, function (productIdentifier, upgradeInfo, type) {
            if (type === void 0) { type = purchases_typescript_internal_1.PURCHASE_TYPE.SUBS; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        console.log("Calling purchaseProduct");
                        console.log("ProductIdentifier: ", productIdentifier);
                        console.log("UpgradeInfo: ", upgradeInfo);
                        console.log("Type: ", type);
                        return [2 /*return*/, RNPurchases.purchaseProduct(productIdentifier, upgradeInfo, type, null, null, null).catch(function (error) {
                                error.userCancelled =
                                    error.code === purchases_typescript_internal_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * Make a purchase
     *
     * @param {PurchasesStoreProduct} product The product you want to purchase
     * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
     * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo:CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will
     * also be rejected if configure has not been called yet.
     */
    Purchases.purchaseStoreProduct = function (product, googleProductChangeInfo, googleIsPersonalizedPrice) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        console.log("Calling purchaseStoreProduct");
                        console.log("Product: ", product);
                        console.log("GoogleProductChangeInfo: ", googleProductChangeInfo);
                        console.log("GoogleIsPersonalizedPrice: ", googleIsPersonalizedPrice);
                        return [2 /*return*/, RNPurchases.purchaseProduct(product.identifier, googleProductChangeInfo, product.productCategory, null, googleIsPersonalizedPrice == null
                                ? null
                                : { isPersonalizedPrice: googleIsPersonalizedPrice }, product.presentedOfferingContext).catch(function (error) {
                                error.userCancelled =
                                    error.code === purchases_typescript_internal_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * iOS only. Purchase a product applying a given discount.
     *
     * @param {PurchasesStoreProduct} product The product you want to purchase
     * @param {PurchasesPromotionalOffer} discount Discount to apply to this package. Retrieve this discount using getPromotionalOffer.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo:CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will be
     * rejected if configure has not been called yet.
     */
    Purchases.purchaseDiscountedProduct = function (product, discount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        if (typeof discount === "undefined" || discount == null) {
                            throw new Error("A discount is required");
                        }
                        return [2 /*return*/, RNPurchases.purchaseProduct(product.identifier, null, null, discount.timestamp.toString(), null, product.presentedOfferingContext).catch(function (error) {
                                error.userCancelled =
                                    error.code === purchases_typescript_internal_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * Make a purchase
     *
     * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
     * @param {UpgradeInfo} upgradeInfo DEPRECATED. Use googleProductChangeInfo.
     * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
     * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
     * has not been called yet.
     */
    Purchases.purchasePackage = function (aPackage, upgradeInfo, googleProductChangeInfo, googleIsPersonalizedPrice) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.purchasePackage(aPackage.identifier, aPackage.presentedOfferingContext, googleProductChangeInfo || upgradeInfo, null, googleIsPersonalizedPrice == null
                                ? null
                                : { isPersonalizedPrice: googleIsPersonalizedPrice }).catch(function (error) {
                                error.userCancelled =
                                    error.code === purchases_typescript_internal_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * Google only. Make a purchase of a subscriptionOption
     *
     * @param {SubscriptionOption} subscriptionOption The SubscriptionOption you wish to purchase. You can get the SubscriptionOption from StoreProducts by calling getOfferings
     * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
     * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
     * has not been called yet.
     */
    Purchases.purchaseSubscriptionOption = function (subscriptionOption, googleProductChangeInfo, googleIsPersonalizedPrice) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Purchases.throwIfIOSPlatform()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.purchaseSubscriptionOption(subscriptionOption.productId, subscriptionOption.id, googleProductChangeInfo, null, googleIsPersonalizedPrice == null
                                ? null
                                : { isPersonalizedPrice: googleIsPersonalizedPrice }, subscriptionOption.presentedOfferingContext).catch(function (error) {
                                error.userCancelled =
                                    error.code === purchases_typescript_internal_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * iOS only. Purchase a package applying a given discount.
     *
     * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
     * @param {PurchasesPromotionalOffer} discount Discount to apply to this package. Retrieve this discount using getPromotionalOffer.
     * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
     * has not been called yet.
     */
    Purchases.purchaseDiscountedPackage = function (aPackage, discount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        if (typeof discount === "undefined" || discount == null) {
                            throw new Error("A discount is required");
                        }
                        return [2 /*return*/, RNPurchases.purchasePackage(aPackage.identifier, aPackage.presentedOfferingContext, null, discount.timestamp.toString(), null).catch(function (error) {
                                error.userCancelled =
                                    error.code === purchases_typescript_internal_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
     * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be also be rejected if configure has not been called yet.
     */
    Purchases.restorePurchases = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.restorePurchases()];
                }
            });
        });
    };
    /**
     * Get the appUserID
     * @returns {Promise<string>} The app user id in a promise
     */
    Purchases.getAppUserID = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.getAppUserID()];
                }
            });
        });
    };
    /**
     * This function will logIn the current user with an appUserID. Typically this would be used after a log in
     * to identify a user without calling configure.
     * @param {String} appUserID The appUserID that should be linked to the currently user
     * @returns {Promise<LogInResult>} A promise of an object that contains the customerInfo after logging in, as well
     * as a boolean indicating whether the user has just been created for the first time in the RevenueCat backend. The
     * promise will be rejected if configure has not been called yet or if there's an issue logging in.
     */
    Purchases.logIn = function (appUserID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        // noinspection SuspiciousTypeOfGuard
                        if (typeof appUserID !== "string") {
                            throw new Error("appUserID needs to be a string");
                        }
                        return [2 /*return*/, RNPurchases.logIn(appUserID)];
                }
            });
        });
    };
    /**
     * Logs out the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
     * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code,
     * and a userInfo object with more information. The promise will be rejected if configure has not been called yet or if
     * there's an issue logging out.
     */
    Purchases.logOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.logOut()];
                }
            });
        });
    };
    /**
     * Enables/Disables debugs logs
     * @param {boolean} enabled Enable or not debug logs
     * @deprecated, use setLogLevel instead
     */
    Purchases.setDebugLogsEnabled = function (enabled) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                RNPurchases.setDebugLogsEnabled(enabled);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Used to set the log level. Useful for debugging issues with the lovely team @RevenueCat.
     * The default is {LOG_LEVEL.INFO} in release builds and {LOG_LEVEL.DEBUG} in debug builds.
     * @param {LOG_LEVEL} level
     */
    Purchases.setLogLevel = function (level) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                RNPurchases.setLogLevel(level);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Set a custom log handler for redirecting logs to your own logging system.
     * By default, this sends info, warning, and error messages.
     * If you wish to receive Debug level messages, see [setLogLevel].
     * @param {LogHandler} logHandler It will get called for each log event.
     * Use this function to redirect the log to your own logging system
     */
    Purchases.setLogHandler = function (logHandler) {
        customLogHandler = logHandler;
        RNPurchases.setLogHandler();
    };
    /**
     * Gets current customer info
     * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be rejected if configure has not been called yet or if
     * there's an issue getting the customer information.
     */
    Purchases.getCustomerInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.getCustomerInfo()];
                }
            });
        });
    };
    /**
     * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
     * for subscriptions anytime a sync is needed, like after a successful purchase.
     *
     * @warning This function should only be called if you're not calling purchaseProduct/purchaseStoreProduct/purchasePackage/purchaseSubscriptionOption.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * syncing purchases.
     */
    Purchases.syncPurchases = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.syncPurchases();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This method will send a purchase to the RevenueCat backend. This function should only be called if you are
     * in Amazon observer mode or performing a client side migration of your current users to RevenueCat.
     *
     * The receipt IDs are cached if successfully posted so they are not posted more than once.
     *
     * @param {string} productID Product ID associated to the purchase.
     * @param {string} receiptID ReceiptId that represents the Amazon purchase.
     * @param {string} amazonUserID Amazon's userID. This parameter will be ignored when syncing a Google purchase.
     * @param {(string|null|undefined)} isoCurrencyCode Product's currency code in ISO 4217 format.
     * @param {(number|null|undefined)} price Product's price.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * syncing purchases.
     */
    Purchases.syncAmazonPurchase = function (productID, receiptID, amazonUserID, isoCurrencyCode, price) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfIOSPlatform()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 2:
                        _a.sent();
                        RNPurchases.syncAmazonPurchase(productID, receiptID, amazonUserID, isoCurrencyCode, price);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @deprecated, use syncAmazonPurchase instead.
     *
     * This method will send a purchase to the RevenueCat backend. This function should only be called if you are
     * in Amazon observer mode or performing a client side migration of your current users to RevenueCat.
     *
     * The receipt IDs are cached if successfully posted so they are not posted more than once.
     *
     * @param {string} productID Product ID associated to the purchase.
     * @param {string} receiptID ReceiptId that represents the Amazon purchase.
     * @param {string} amazonUserID Amazon's userID. This parameter will be ignored when syncing a Google purchase.
     * @param {(string|null|undefined)} isoCurrencyCode Product's currency code in ISO 4217 format.
     * @param {(number|null|undefined)} price Product's price.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * syncing purchases.
     */
    Purchases.syncObserverModeAmazonPurchase = function (productID, receiptID, amazonUserID, isoCurrencyCode, price) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfIOSPlatform()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 2:
                        _a.sent();
                        RNPurchases.syncObserverModeAmazonPurchase(productID, receiptID, amazonUserID, isoCurrencyCode, price);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * iOS only. Always returns an error on iOS < 15.
     *
     * Use this method only if you already have your own IAP implementation using StoreKit 2 and want to use
     * RevenueCat's backend. If you are using StoreKit 1 for your implementation, you do not need this method.
     *
     * You only need to use this method with *new* purchases. Subscription updates are observed automatically.
     *
     * Important: This should only be used if you have set PurchasesAreCompletedBy to MY_APP during SDK configuration.
     *
     * @warning You need to finish the transaction yourself after calling this method.
     *
     * @param {string} productID Product ID that was just purchased
     * @returns {Promise<PurchasesStoreTransaction>} If there was a transacton found and handled for the provided product ID.
     */
    Purchases.recordPurchase = function (productID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfAndroidPlatform()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.recordPurchaseForProductID(productID)];
                }
            });
        });
    };
    /**
     * Enable automatic collection of Apple Search Ad attribution on iOS. Disabled by default
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    Purchases.enableAdServicesAttributionTokenCollection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(react_native_2.Platform.OS === "ios")) return [3 /*break*/, 2];
                        return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.enableAdServicesAttributionTokenCollection();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @returns { Promise<boolean> } If the `appUserID` has been generated by RevenueCat or not.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    Purchases.isAnonymous = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.isAnonymous()];
                }
            });
        });
    };
    /**
     * iOS only. Computes whether or not a user is eligible for the introductory pricing period of a given product.
     * You should use this method to determine whether or not you show the user the normal product price or the
     * introductory price. This also applies to trials (trials are considered a type of introductory pricing).
     *
     * @note Subscription groups are automatically collected for determining eligibility. If RevenueCat can't
     * definitively compute the eligibility, most likely because of missing group information, it will return
     * `INTRO_ELIGIBILITY_STATUS_UNKNOWN`. The best course of action on unknown status is to display the non-intro
     * pricing, to not create a misleading situation. To avoid this, make sure you are testing with the latest version of
     * iOS so that the subscription group can be collected by the SDK. Android always returns INTRO_ELIGIBILITY_STATUS_UNKNOWN.
     *
     * @param productIdentifiers Array of product identifiers for which you want to compute eligibility
     * @returns { Promise<[productId: string]: IntroEligibility> } A map of IntroEligility per productId. The promise
     * will be rejected if configure has not been called yet or if there's in an error checking eligibility.
     */
    Purchases.checkTrialOrIntroductoryPriceEligibility = function (productIdentifiers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.checkTrialOrIntroductoryPriceEligibility(productIdentifiers)];
                }
            });
        });
    };
    /**
     * iOS only. Use this function to retrieve the `PurchasesPromotionalOffer` for a given `PurchasesPackage`.
     *
     * @param product The `PurchasesStoreProduct` the user intends to purchase.
     * @param discount The `PurchasesStoreProductDiscount` to apply to the product.
     * @returns { Promise<PurchasesPromotionalOffer> } Returns when the `PurchasesPaymentDiscount` is returned.
     * Null is returned for Android and incompatible iOS versions. The promise will be rejected if configure has not been
     * called yet or if there's an error getting the payment discount.
     */
    Purchases.getPromotionalOffer = function (product, discount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        if (react_native_2.Platform.OS === "android") {
                            return [2 /*return*/, Promise.resolve(undefined)];
                        }
                        if (typeof discount === "undefined" || discount == null) {
                            throw new Error("A discount is required");
                        }
                        return [2 /*return*/, RNPurchases.getPromotionalOffer(product.identifier, discount.identifier)];
                }
            });
        });
    };
    /**
     * Invalidates the cache for customer information.
     *
     * Most apps will not need to use this method; invalidating the cache can leave your app in an invalid state.
     * Refer to https://docs.revenuecat.com/docs/customer-info#section-get-user-information for more information on
     * using the cache properly.
     *
     * This is useful for cases where customer information might have been updated outside of the app, like if a
     * promotional subscription is granted through the RevenueCat dashboard.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
     * invalidating the customer info cache.
     */
    Purchases.invalidateCustomerInfoCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.invalidateCustomerInfoCache();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** iOS only. Presents a code redemption sheet, useful for redeeming offer codes
     * Refer to https://docs.revenuecat.com/docs/ios-subscription-offers#offer-codes for more information on how
     * to configure and use offer codes
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
     * presenting the code redemption sheet.
     */
    Purchases.presentCodeRedemptionSheet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(react_native_2.Platform.OS === "ios")) return [3 /*break*/, 2];
                        return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.presentCodeRedemptionSheet();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attributes are useful for storing additional, structured information on a user.
     * Since attributes are writable using a public key they should not be used for
     * managing secure or sensitive information such as subscription status, coins, etc.
     *
     * Key names starting with "$" are reserved names used by RevenueCat. For a full list of key
     * restrictions refer to our guide: https://docs.revenuecat.com/docs/subscriber-attributes
     *
     * @param attributes Map of attributes by key. Set the value as an empty string to delete an attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
     * setting the subscriber attributes.
     */
    Purchases.setAttributes = function (attributes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setAttributes(attributes);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the email address for the user
     *
     * @param email Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the email.
     */
    Purchases.setEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setEmail(email);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the phone number for the user
     *
     * @param phoneNumber Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the phone number.
     */
    Purchases.setPhoneNumber = function (phoneNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setPhoneNumber(phoneNumber);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the display name for the user
     *
     * @param displayName Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the display name.
     */
    Purchases.setDisplayName = function (displayName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setDisplayName(displayName);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the push token for the user
     *
     * @param pushToken null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the push token.
     */
    Purchases.setPushToken = function (pushToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setPushToken(pushToken);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set this property to your proxy URL before configuring Purchases *only* if you've received a proxy key value
     * from your RevenueCat contact.
     * @returns {Promise<void>} The promise to be returned after setting the proxy has been completed.
     */
    Purchases.setProxyURL = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, RNPurchases.setProxyURLString(url)];
            });
        });
    };
    /**
     * Automatically collect subscriber attributes associated with the device identifiers.
     * $idfa, $idfv, $ip on iOS
     * $gpsAdId, $androidId, $ip on Android
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting collecting the device identifiers.
     */
    Purchases.collectDeviceIdentifiers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.collectDeviceIdentifiers();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the Adjust Id for the user
     * Required for the RevenueCat Adjust integration
     *
     * @param adjustID Adjust ID to use in Adjust integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting Adjust ID.
     */
    Purchases.setAdjustID = function (adjustID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setAdjustID(adjustID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the AppsFlyer Id for the user
     * Required for the RevenueCat AppsFlyer integration
     * @param appsflyerID Appsflyer ID to use in Appsflyer integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Appsflyer ID.
     */
    Purchases.setAppsflyerID = function (appsflyerID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setAppsflyerID(appsflyerID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the Facebook SDK Anonymous Id for the user
     * Recommended for the RevenueCat Facebook integration
     *
     * @param fbAnonymousID Facebook Anonymous ID to use in Mparticle integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Facebook Anonymous ID.
     */
    Purchases.setFBAnonymousID = function (fbAnonymousID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setFBAnonymousID(fbAnonymousID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the mParticle Id for the user
     * Recommended for the RevenueCat mParticle integration
     *
     * @param mparticleID Mparticle ID to use in Mparticle integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Mparticle ID.
     */
    Purchases.setMparticleID = function (mparticleID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setMparticleID(mparticleID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the CleverTap Id for the user
     * Required for the RevenueCat CleverTap integration
     *
     * @param cleverTapID CleverTap user ID to use in CleverTap integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the CleverTap ID.
     */
    Purchases.setCleverTapID = function (cleverTapID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setCleverTapID(cleverTapID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the Mixpanel Distinct Id for the user
     * Required for the RevenueCat Mixpanel integration
     *
     * @param mixpanelDistinctID Mixpanel Distinct ID to use in Mixpanel integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Mixpanel Distinct ID.
     */
    Purchases.setMixpanelDistinctID = function (mixpanelDistinctID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setMixpanelDistinctID(mixpanelDistinctID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the Firebase App Instance ID for the user
     * Required for the RevenueCat Firebase integration
     *
     * @param firebaseAppInstanceID Firebase App Instance ID to use in Firebase integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Firebase App Instance ID.
     */
    Purchases.setFirebaseAppInstanceID = function (firebaseAppInstanceID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setFirebaseAppInstanceID(firebaseAppInstanceID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the OneSignal Player Id for the user
     * Required for the RevenueCat OneSignal integration
     *
     * @param onesignalID OneSignal Player ID to use in OneSignal integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the OneSignal ID.
     */
    Purchases.setOnesignalID = function (onesignalID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setOnesignalID(onesignalID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the Airship Channel Id for the user
     * Required for the RevenueCat Airship integration
     *
     * @param airshipChannelID Airship Channel ID to use in Airship integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Airship Channel ID.
     */
    Purchases.setAirshipChannelID = function (airshipChannelID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setAirshipChannelID(airshipChannelID);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the install media source for the user
     *
     * @param mediaSource Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the media source.
     */
    Purchases.setMediaSource = function (mediaSource) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setMediaSource(mediaSource);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the install campaign for the user
     *
     * @param campaign Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the campaign.
     */
    Purchases.setCampaign = function (campaign) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setCampaign(campaign);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the install ad group for the user
     *
     * @param adGroup Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting ad group.
     */
    Purchases.setAdGroup = function (adGroup) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setAdGroup(adGroup);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the install ad for the user
     *
     * @param ad Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the ad subscriber attribute.
     */
    Purchases.setAd = function (ad) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setAd(ad);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the install keyword for the user
     *
     * @param keyword Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the keyword.
     */
    Purchases.setKeyword = function (keyword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setKeyword(keyword);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscriber attribute associated with the install ad creative for the user
     *
     * @param creative Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the creative subscriber attribute.
     */
    Purchases.setCreative = function (creative) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setCreative(creative);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if billing is supported for the current user (meaning IN-APP purchases are supported)
     * and optionally, whether a list of specified feature types are supported.
     *
     * Note: Billing features are only relevant to Google Play Android users.
     * For other stores and platforms, billing features won't be checked.
     *
     * @param features An array of feature types to check for support. Feature types must be one of
     *       [BILLING_FEATURE]. By default, is an empty list and no specific feature support will be checked.
     * @returns {Promise<boolean>} promise with boolean response. True if billing is supported, false otherwise.
     */
    Purchases.canMakePayments = function (features) {
        if (features === void 0) { features = []; }
        return RNPurchases.canMakePayments(features);
    };
    /**
     * iOS 15+ only. Presents a refund request sheet in the current window scene for
     * the latest transaction associated with the active entitlement.
     *
     * If the request was unsuccessful, no active entitlements could be found for
     * the user, or multiple active entitlements were found for the user,
     * the promise will return an error.
     * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
     *
     * Important: This method should only be used if your user can only have a single active entitlement at a given time.
     * If a user could have more than one entitlement at a time, use `beginRefundRequestForEntitlement` instead.
     *
     * @returns {Promise<REFUND_REQUEST_STATUS>} Returns REFUND_REQUEST_STATUS: The status of the
     *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
     */
    Purchases.beginRefundRequestForActiveEntitlement = function () {
        return __awaiter(this, void 0, void 0, function () {
            var refundRequestStatusInt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Purchases.throwIfAndroidPlatform()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, RNPurchases.beginRefundRequestForActiveEntitlement()];
                    case 3:
                        refundRequestStatusInt = _a.sent();
                        if (refundRequestStatusInt == null) {
                            throw new purchases_typescript_internal_1.UnsupportedPlatformError();
                        }
                        return [2 /*return*/, Purchases.convertIntToRefundRequestStatus(refundRequestStatusInt)];
                }
            });
        });
    };
    /**
     * iOS 15+ only. Presents a refund request sheet in the current window scene for
     * the latest transaction associated with the `entitlement`.
     *
     * If the request was unsuccessful, the promise will return an error.
     * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
     *
     * @param entitlementInfo The entitlement to begin a refund request for.
     * @returns {Promise<REFUND_REQUEST_STATUS>} Returns REFUND_REQUEST_STATUS: The status of the
     *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
     */
    Purchases.beginRefundRequestForEntitlement = function (entitlementInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var refundRequestStatusInt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Purchases.throwIfAndroidPlatform()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, RNPurchases.beginRefundRequestForEntitlementId(entitlementInfo.identifier)];
                    case 3:
                        refundRequestStatusInt = _a.sent();
                        if (refundRequestStatusInt == null) {
                            throw new purchases_typescript_internal_1.UnsupportedPlatformError();
                        }
                        return [2 /*return*/, Purchases.convertIntToRefundRequestStatus(refundRequestStatusInt)];
                }
            });
        });
    };
    /**
     * iOS 15+ only. Presents a refund request sheet in the current window scene for
     * the latest transaction associated with the `product`.
     *
     * If the request was unsuccessful, the promise will return an error.
     * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
     *
     * @param storeProduct The StoreProduct to begin a refund request for.
     * @returns {Promise<REFUND_REQUEST_STATUS>} Returns a REFUND_REQUEST_STATUS: The status of the
     *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
     */
    Purchases.beginRefundRequestForProduct = function (storeProduct) {
        return __awaiter(this, void 0, void 0, function () {
            var refundRequestStatusInt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Purchases.throwIfAndroidPlatform()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, RNPurchases.beginRefundRequestForProductId(storeProduct.identifier)];
                    case 3:
                        refundRequestStatusInt = _a.sent();
                        if (refundRequestStatusInt == null) {
                            throw new purchases_typescript_internal_1.UnsupportedPlatformError();
                        }
                        return [2 /*return*/, Purchases.convertIntToRefundRequestStatus(refundRequestStatusInt)];
                }
            });
        });
    };
    /**
     * Shows in-app messages available from the App Store or Google Play. You need to disable messages from showing
     * automatically using [PurchasesConfiguration.shouldShowInAppMessagesAutomatically].
     *
     * Note: In iOS, this requires version 16+. In older versions the promise will be resolved successfully
     * immediately.
     *
     * @param messageTypes An array of message types that the stores can display inside your app. Must be one of
     *       [IN_APP_MESSAGE_TYPE]. By default, is undefined and all message types will be shown.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    Purchases.showInAppMessages = function (messageTypes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.showInAppMessages(messageTypes)];
                }
            });
        });
    };
    /**
     * Check if configure has finished and Purchases has been configured.
     *
     * @returns {Promise<Boolean>} promise with boolean response
     */
    Purchases.isConfigured = function () {
        return RNPurchases.isConfigured();
    };
    Purchases.throwIfNotConfigured = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isConfigured;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.isConfigured()];
                    case 1:
                        isConfigured = _a.sent();
                        if (!isConfigured) {
                            throw new purchases_typescript_internal_1.UninitializedPurchasesError();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Purchases.throwIfAndroidPlatform = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (react_native_2.Platform.OS === "android") {
                    throw new purchases_typescript_internal_1.UnsupportedPlatformError();
                }
                return [2 /*return*/];
            });
        });
    };
    Purchases.throwIfIOSPlatform = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (react_native_2.Platform.OS === "ios") {
                    throw new purchases_typescript_internal_1.UnsupportedPlatformError();
                }
                return [2 /*return*/];
            });
        });
    };
    Purchases.isPurchasesAreCompletedByMyApp = function (obj) {
        return (typeof obj === "object" &&
            obj !== null &&
            obj.type ===
                purchases_typescript_internal_1.PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP);
    };
    Purchases.convertIntToRefundRequestStatus = function (refundRequestStatusInt) {
        switch (refundRequestStatusInt) {
            case 0:
                return purchases_typescript_internal_1.REFUND_REQUEST_STATUS.SUCCESS;
            case 1:
                return purchases_typescript_internal_1.REFUND_REQUEST_STATUS.USER_CANCELLED;
            default:
                return purchases_typescript_internal_1.REFUND_REQUEST_STATUS.ERROR;
        }
    };
    /**
     * Supported SKU types.
     * @readonly
     * @enum {string}
     * @deprecated, use PRODUCT_CATEGORY
     */
    Purchases.PURCHASE_TYPE = purchases_typescript_internal_1.PURCHASE_TYPE;
    /**
     * Supported product categories.
     * @readonly
     * @enum {string}
     */
    Purchases.PRODUCT_CATEGORY = purchases_typescript_internal_1.PRODUCT_CATEGORY;
    /**
     * Enum for billing features.
     * Currently, these are only relevant for Google Play Android users:
     * https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
     * @readonly
     * @enum {string}
     */
    Purchases.BILLING_FEATURE = purchases_typescript_internal_1.BILLING_FEATURE;
    /**
     * Enum with possible return states for beginning refund request.
     * @readonly
     * @enum {string}
     */
    Purchases.REFUND_REQUEST_STATUS = purchases_typescript_internal_1.REFUND_REQUEST_STATUS;
    /**
     * Replace SKU's ProrationMode.
     * @readonly
     * @enum {number}
     */
    Purchases.PRORATION_MODE = purchases_typescript_internal_1.PRORATION_MODE;
    /**
     * Enumeration of all possible Package types.
     * @readonly
     * @enum {string}
     */
    Purchases.PACKAGE_TYPE = purchases_typescript_internal_1.PACKAGE_TYPE;
    /**
     * Enum of different possible states for intro price eligibility status.
     * @readonly
     * @enum {number}
     */
    Purchases.INTRO_ELIGIBILITY_STATUS = purchases_typescript_internal_1.INTRO_ELIGIBILITY_STATUS;
    /**
     * Enum of all error codes the SDK produces.
     * @readonly
     * @enum {string}
     */
    Purchases.PURCHASES_ERROR_CODE = purchases_typescript_internal_1.PURCHASES_ERROR_CODE;
    /**
     * List of valid log levels.
     * @readonly
     * @enum {string}
     */
    Purchases.LOG_LEVEL = purchases_typescript_internal_1.LOG_LEVEL;
    /**
     * List of valid in app message types.
     * @readonly
     * @enum {number}
     */
    Purchases.IN_APP_MESSAGE_TYPE = purchases_typescript_internal_1.IN_APP_MESSAGE_TYPE;
    /**
     * Enum of entitlement verification modes.
     * @readonly
     * @enum {string}
     */
    Purchases.ENTITLEMENT_VERIFICATION_MODE = purchases_typescript_internal_1.ENTITLEMENT_VERIFICATION_MODE;
    /**
     * The result of the verification process.
     * @readonly
     * @enum {string}
     */
    Purchases.VERIFICATION_RESULT = purchases_typescript_internal_1.VERIFICATION_RESULT;
    /**
     * Enum of StoreKit version.
     * @readonly
     * @enum {string}
     */
    Purchases.STOREKIT_VERSION = purchases_typescript_internal_1.STOREKIT_VERSION;
    /**
     * Enum of PurchasesAreCompletedByType.
     * @readonly
     * @enum {string}
     */
    Purchases.PURCHASES_ARE_COMPLETED_BY_TYPE = purchases_typescript_internal_1.PURCHASES_ARE_COMPLETED_BY_TYPE;
    /**
     * @internal
     */
    Purchases.UninitializedPurchasesError = purchases_typescript_internal_1.UninitializedPurchasesError;
    /**
     * @internal
     */
    Purchases.UnsupportedPlatformError = purchases_typescript_internal_1.UnsupportedPlatformError;
    return Purchases;
}());
exports.default = Purchases;
