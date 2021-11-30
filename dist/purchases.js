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
        while (_) try {
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
exports.BILLING_FEATURE = exports.PURCHASE_TYPE = exports.ATTRIBUTION_NETWORK = void 0;
var react_native_1 = require("react-native");
var errors_1 = require("./errors");
var offerings_1 = require("./offerings");
var react_native_2 = require("react-native");
var RNPurchases = react_native_1.NativeModules.RNPurchases;
var eventEmitter = new react_native_1.NativeEventEmitter(RNPurchases);
var purchaserInfoUpdateListeners = [];
var shouldPurchasePromoProductListeners = [];
eventEmitter.addListener("Purchases-PurchaserInfoUpdated", function (purchaserInfo) {
    purchaserInfoUpdateListeners.forEach(function (listener) { return listener(purchaserInfo); });
});
eventEmitter.addListener("Purchases-ShouldPurchasePromoProduct", function (_a) {
    var callbackID = _a.callbackID;
    shouldPurchasePromoProductListeners.forEach(function (listener) {
        return listener(function () { return RNPurchases.makeDeferredPurchase(callbackID); });
    });
});
var ATTRIBUTION_NETWORK;
(function (ATTRIBUTION_NETWORK) {
    ATTRIBUTION_NETWORK[ATTRIBUTION_NETWORK["APPLE_SEARCH_ADS"] = 0] = "APPLE_SEARCH_ADS";
    ATTRIBUTION_NETWORK[ATTRIBUTION_NETWORK["ADJUST"] = 1] = "ADJUST";
    ATTRIBUTION_NETWORK[ATTRIBUTION_NETWORK["APPSFLYER"] = 2] = "APPSFLYER";
    ATTRIBUTION_NETWORK[ATTRIBUTION_NETWORK["BRANCH"] = 3] = "BRANCH";
    ATTRIBUTION_NETWORK[ATTRIBUTION_NETWORK["TENJIN"] = 4] = "TENJIN";
    ATTRIBUTION_NETWORK[ATTRIBUTION_NETWORK["FACEBOOK"] = 5] = "FACEBOOK";
})(ATTRIBUTION_NETWORK = exports.ATTRIBUTION_NETWORK || (exports.ATTRIBUTION_NETWORK = {}));
var PURCHASE_TYPE;
(function (PURCHASE_TYPE) {
    /**
     * A type of SKU for in-app products.
     */
    PURCHASE_TYPE["INAPP"] = "inapp";
    /**
     * A type of SKU for subscriptions.
     */
    PURCHASE_TYPE["SUBS"] = "subs";
})(PURCHASE_TYPE = exports.PURCHASE_TYPE || (exports.PURCHASE_TYPE = {}));
/**
 * Enum for billing features.
 * Currently, these are only relevant for Google Play Android users:
 * https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
 */
var BILLING_FEATURE;
(function (BILLING_FEATURE) {
    /**
     * Purchase/query for subscriptions.
     */
    BILLING_FEATURE[BILLING_FEATURE["SUBSCRIPTIONS"] = 0] = "SUBSCRIPTIONS";
    /**
     * Subscriptions update/replace.
     */
    BILLING_FEATURE[BILLING_FEATURE["SUBSCRIPTIONS_UPDATE"] = 1] = "SUBSCRIPTIONS_UPDATE";
    /**
     * Purchase/query for in-app items on VR.
     */
    BILLING_FEATURE[BILLING_FEATURE["IN_APP_ITEMS_ON_VR"] = 2] = "IN_APP_ITEMS_ON_VR";
    /**
     * Purchase/query for subscriptions on VR.
     */
    BILLING_FEATURE[BILLING_FEATURE["SUBSCRIPTIONS_ON_VR"] = 3] = "SUBSCRIPTIONS_ON_VR";
    /**
     * Launch a price change confirmation flow.
     */
    BILLING_FEATURE[BILLING_FEATURE["PRICE_CHANGE_CONFIRMATION"] = 4] = "PRICE_CHANGE_CONFIRMATION";
})(BILLING_FEATURE = exports.BILLING_FEATURE || (exports.BILLING_FEATURE = {}));
var Purchases = /** @class */ (function () {
    function Purchases() {
    }
    /**
     * Sets up Purchases with your API key and an app user id.
     * @param {String} apiKey RevenueCat API Key. Needs to be a String
     * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
     * @param {boolean?} observerMode An optional boolean. Set this to TRUE if you have your own IAP implementation and want to use only RevenueCat's backend. Default is FALSE.
     * @param {String?} userDefaultsSuiteName An optional string. iOS-only, will be ignored for Android.
     * Set this if you would like the RevenueCat SDK to store its preferences in a different NSUserDefaults suite, otherwise it will use standardUserDefaults.
     * Default is null, which will make the SDK use standardUserDefaults.
     */
    Purchases.setup = function (apiKey, appUserID, observerMode, userDefaultsSuiteName) {
        if (observerMode === void 0) { observerMode = false; }
        if (appUserID !== null && typeof appUserID !== "undefined" && typeof appUserID !== "string") {
            throw new Error("appUserID needs to be a string");
        }
        RNPurchases.setupPurchases(apiKey, appUserID, observerMode, userDefaultsSuiteName);
    };
    /**
     * @deprecated, configure behavior through the RevenueCat dashboard instead.
     * If an user tries to purchase a product that is active on the current app store account,
     * we will treat it as a restore and alias the new ID with the previous id.
     * @param {boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous,
     * this is true by default if you didn't pass an appUserID
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet.
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
     * @param {boolean} finishTransactions Set finishTransactions to false if you aren't using Purchases SDK to
     * make the purchase
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet.
     */
    Purchases.setFinishTransactions = function (finishTransactions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setFinishTransactions(finishTransactions);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * iOS only.
     * @param {boolean} simulatesAskToBuyInSandbox Set this property to true *only* when testing the ask-to-buy / SCA
     * purchases flow. More information: http://errors.rev.cat/ask-to-buy
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet.
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
     * Sets a function to be called on updated purchaser info
     * @param {PurchaserInfoUpdateListener} purchaserInfoUpdateListener PurchaserInfo update listener
     */
    Purchases.addPurchaserInfoUpdateListener = function (purchaserInfoUpdateListener) {
        if (typeof purchaserInfoUpdateListener !== "function") {
            throw new Error("addPurchaserInfoUpdateListener needs a function");
        }
        purchaserInfoUpdateListeners.push(purchaserInfoUpdateListener);
    };
    /**
     * Removes a given PurchaserInfoUpdateListener
     * @param {PurchaserInfoUpdateListener} listenerToRemove PurchaserInfoUpdateListener reference of the listener to remove
     * @returns {boolean} True if listener was removed, false otherwise
     */
    Purchases.removePurchaserInfoUpdateListener = function (listenerToRemove) {
        if (purchaserInfoUpdateListeners.includes(listenerToRemove)) {
            purchaserInfoUpdateListeners = purchaserInfoUpdateListeners.filter(function (listener) { return listenerToRemove !== listener; });
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
            shouldPurchasePromoProductListeners = shouldPurchasePromoProductListeners.filter(function (listener) { return listenerToRemove !== listener; });
            return true;
        }
        return false;
    };
    /**
     * @deprecated, use set<NetworkId> methods instead.
     *
     * Add a dict of attribution information
     * @param {Dict} data Attribution data from AppsFlyer, Adjust, or Branch
     * @param {ATTRIBUTION_NETWORKS} network Which network, see Purchases.ATTRIBUTION_NETWORKS
     * @param {String?} networkUserId An optional unique id for identifying the user. Needs to be a string.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet.
     */
    Purchases.addAttributionData = function (data, network, networkUserId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                RNPurchases.addAttributionData(data, network, networkUserId);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Gets the map of entitlements -> offerings -> products
     * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure. The promise will be rejected if setup
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
     * Fetch the product info
     * @param {String[]} productIdentifiers Array of product identifiers
     * @param {String} type Optional type of products to fetch, can be inapp or subs. Subs by default
     * @returns {Promise<PurchasesProduct[]>} A promise containing an array of products. The promise will be rejected
     * if the products are not properly configured in RevenueCat or if there is another error retrieving them.
     * Rejections return an error code, and a userInfo object with more information. The promise will also be rejected
     * if setup has not been called yet.
     */
    Purchases.getProducts = function (productIdentifiers, type) {
        if (type === void 0) { type = PURCHASE_TYPE.SUBS; }
        return __awaiter(this, void 0, void 0, function () {
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
     * @returns {Promise<{ productIdentifier: string, purchaserInfo:PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will
     * also be rejected if setup has not been called yet.
     */
    Purchases.purchaseProduct = function (productIdentifier, upgradeInfo, type) {
        if (type === void 0) { type = PURCHASE_TYPE.SUBS; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.purchaseProduct(productIdentifier, upgradeInfo, type, null).catch(function (error) {
                                error.userCancelled = error.code === errors_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * iOS only. Purchase a product applying a given discount.
     *
     * @param {PurchasesProduct} product The product you want to purchase
     * @param {PurchasesPaymentDiscount} discount Discount to apply to this package. Retrieve this discount using getPaymentDiscount.
     * @returns {Promise<{ productIdentifier: string, purchaserInfo:PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will be
     * rejected if setup has not been called yet.
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
                        return [2 /*return*/, RNPurchases.purchaseProduct(product.identifier, null, null, discount.timestamp.toString()).catch(function (error) {
                                error.userCancelled = error.code === errors_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
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
     * @param {UpgradeInfo} upgradeInfo Android only. Optional UpgradeInfo you wish to upgrade from containing the oldSKU
     * and the optional prorationMode.
     * @returns {Promise<{ productIdentifier: string, purchaserInfo: PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if setup
     * has not been called yet.
     */
    Purchases.purchasePackage = function (aPackage, upgradeInfo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.purchasePackage(aPackage.identifier, aPackage.offeringIdentifier, upgradeInfo, null).catch(function (error) {
                                error.userCancelled = error.code === errors_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
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
     * @param {PurchasesPaymentDiscount} discount Discount to apply to this package. Retrieve this discount using getPaymentDiscount.
     * @returns {Promise<{ productIdentifier: string, purchaserInfo: PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if setup
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
                        return [2 /*return*/, RNPurchases.purchasePackage(aPackage.identifier, aPackage.offeringIdentifier, null, discount.timestamp.toString()).catch(function (error) {
                                error.userCancelled = error.code === errors_1.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
                                throw error;
                            })];
                }
            });
        });
    };
    /**
     * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be also be rejected if setup has not been called yet.
     */
    Purchases.restoreTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.restoreTransactions()];
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
     * @returns {Promise<LogInResult>} A promise of an object that contains the purchaserInfo after logging in, as well
     * as a boolean indicating whether the user has just been created for the first time in the RevenueCat backend. The
     * promise will be rejected if setup has not been called yet or if there's an issue logging in.
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
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code,
     * and a userInfo object with more information. The promise will be rejected if setup has not been called yet or if
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
     * @deprecated, use logIn instead.
     * This function will alias two appUserIDs together.
     * @param {String} newAppUserID The new appUserID that should be linked to the currently identified appUserID.
     * Needs to be a string.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a
     * userInfo object with more information. The promise will be rejected if setup has not been called yet or if
     * there's an issue creating the alias.
     */
    Purchases.createAlias = function (newAppUserID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        // noinspection SuspiciousTypeOfGuard
                        if (typeof newAppUserID !== "string") {
                            throw new Error("newAppUserID needs to be a string");
                        }
                        return [2 /*return*/, RNPurchases.createAlias(newAppUserID)];
                }
            });
        });
    };
    /**
     * @deprecated, use logIn instead.
     * This function will identify the current user with an appUserID. Typically this would be used after a logout to
     * identify a new user without calling configure
     * @param {String} newAppUserID The appUserID that should be linked to the currently user
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be rejected if setup has not been called yet or if
     * there's an issue identifying the user.
     */
    Purchases.identify = function (newAppUserID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        // noinspection SuspiciousTypeOfGuard
                        if (typeof newAppUserID !== "string") {
                            throw new Error("newAppUserID needs to be a string");
                        }
                        return [2 /*return*/, RNPurchases.identify(newAppUserID)];
                }
            });
        });
    };
    /**
     * @deprecated, use logOut instead.
     * Resets the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the
     *  cache.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be rejected if setup has not been called yet or if
     * there's an issue resetting the user.
     */
    Purchases.reset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.reset()];
                }
            });
        });
    };
    /**
     * Enables/Disables debugs logs
     * @param {boolean} enabled Enable or not debug logs
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
     * Gets current purchaser info
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be rejected if setup has not been called yet or if
     * there's an issue getting the purchaser information.
     */
    Purchases.getPurchaserInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, RNPurchases.getPurchaserInfo()];
                }
            });
        });
    };
    /**
     * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
     * for subscriptions anytime a sync is needed, like after a successful purchase.
     *
     * @warning This function should only be called if you're not calling purchaseProduct/purchasePackage.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * Enable automatic collection of Apple Search Ad attribution. Disabled by default
     * @param {boolean} enabled Enable or not automatic apple search ads attribution collection
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet.
     */
    Purchases.setAutomaticAppleSearchAdsAttributionCollection = function (enabled) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (react_native_2.Platform.OS === "ios") {
                    RNPurchases.setAutomaticAppleSearchAdsAttributionCollection(enabled);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @returns { Promise<boolean> } If the `appUserID` has been generated by RevenueCat or not.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet.
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
     * will be rejected if setup has not been called yet or if there's in an error checking eligibility.
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
     * iOS only. Use this function to retrieve the `PurchasesPaymentDiscount` for a given `PurchasesPackage`.
     *
     * @param product The `PurchasesProduct` the user intends to purchase.
     * @param discount The `PurchasesDiscount` to apply to the product.
     * @returns { Promise<PurchasesPaymentDiscount> } Returns when the `PurchasesPaymentDiscount` is returned.
     * Null is returned for Android and incompatible iOS versions. The promise will be rejected if setup has not been
     * called yet or if there's an error getting the payment discount.
     */
    Purchases.getPaymentDiscount = function (product, discount) {
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
                        return [2 /*return*/, RNPurchases.getPaymentDiscount(product.identifier, discount.identifier)];
                }
            });
        });
    };
    /**
     * Invalidates the cache for purchaser information.
     *
     * Most apps will not need to use this method; invalidating the cache can leave your app in an invalid state.
     * Refer to https://docs.revenuecat.com/docs/purchaserinfo#section-get-user-information for more information on
     * using the cache properly.
     *
     * This is useful for cases where purchaser information might have been updated outside of the app, like if a
     * promotional subscription is granted through the RevenueCat dashboard.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or there's an error
     * invalidating the purchaser info cache.
     */
    Purchases.invalidatePurchaserInfoCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.invalidatePurchaserInfoCache();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** iOS only. Presents a code redemption sheet, useful for redeeming offer codes
     * Refer to https://docs.revenuecat.com/docs/ios-subscription-offers#offer-codes for more information on how
     * to configure and use offer codes
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
     * setting the proxy url.
     */
    Purchases.setProxyURL = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Purchases.throwIfNotConfigured()];
                    case 1:
                        _a.sent();
                        RNPurchases.setProxyURLString(url);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Automatically collect subscriber attributes associated with the device identifiers.
     * $idfa, $idfv, $ip on iOS
     * $gpsAdId, $androidId, $ip on Android
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @param adjustID Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @param appsflyerID Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @param fbAnonymousID Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @param mparticleID Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * Subscriber attribute associated with the OneSignal Player Id for the user
     * Required for the RevenueCat OneSignal integration
     *
     * @param onesignalID Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
     * setting the Onesignal ID.
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
     * @param airshipChannelID Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @returns {Promise<void>} The promise will be rejected if setup has not been called yet or if there's an error
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
     * @param feature An array of feature types to check for support. Feature types must be one of
     *       [BILLING_FEATURE]. By default, is an empty list and no specific feature support will be checked.
     * @returns {Promise<Boolean>} promise with boolean response. True if billing is supported, false otherwise.
     */
    Purchases.canMakePayments = function (features) {
        if (features === void 0) { features = []; }
        return RNPurchases.canMakePayments(features);
    };
    /**
     * Check if setup has finished and Purchases has been configured.
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
                            throw new errors_1.UninitializedPurchasesError();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enum for attribution networks
     * @readonly
     * @enum {number}
     */
    Purchases.ATTRIBUTION_NETWORK = ATTRIBUTION_NETWORK;
    /**
     * @deprecated use ATTRIBUTION_NETWORK instead
     *
     * Enum for attribution networks
     * @readonly
     * @enum {number}
     */
    Purchases.ATTRIBUTION_NETWORKS = ATTRIBUTION_NETWORK;
    /**
     * Supported SKU types.
     * @readonly
     * @enum {string}
     */
    Purchases.PURCHASE_TYPE = PURCHASE_TYPE;
    /**
     * Enum for billing features.
     * Currently, these are only relevant for Google Play Android users:
     * https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
     * @readonly
     * @enum  {string}
     */
    Purchases.BILLING_FEATURE = BILLING_FEATURE;
    /**
     * Replace SKU's ProrationMode.
     * @readonly
     * @enum {number}
     */
    Purchases.PRORATION_MODE = offerings_1.PRORATION_MODE;
    /**
     * Enumeration of all possible Package types.
     * @readonly
     * @enum {string}
     */
    Purchases.PACKAGE_TYPE = offerings_1.PACKAGE_TYPE;
    /**
     * Enum of different possible states for intro price eligibility status.
     * @readonly
     * @enum {number}
     */
    Purchases.INTRO_ELIGIBILITY_STATUS = offerings_1.INTRO_ELIGIBILITY_STATUS;
    /**
     * Enum of all error codes the SDK produces.
     * @readonly
     * @enum {string}
     */
    Purchases.PURCHASES_ERROR_CODE = errors_1.PURCHASES_ERROR_CODE;
    Purchases.UninitializedPurchasesError = errors_1.UninitializedPurchasesError;
    return Purchases;
}());
exports.default = Purchases;
