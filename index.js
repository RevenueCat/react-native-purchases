"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var react_native_1 = require("react-native");
var RNPurchases = react_native_1.NativeModules.RNPurchases;
var eventEmitter = new react_native_1.NativeEventEmitter(RNPurchases);
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
var PRORATION_MODE;
(function (PRORATION_MODE) {
    PRORATION_MODE[PRORATION_MODE["UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY"] = 0] = "UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY";
    /**
     * Replacement takes effect immediately, and the remaining time will be
     * prorated and credited to the user. This is the current default behavior.
     */
    PRORATION_MODE[PRORATION_MODE["IMMEDIATE_WITH_TIME_PRORATION"] = 1] = "IMMEDIATE_WITH_TIME_PRORATION";
    /**
     * Replacement takes effect immediately, and the billing cycle remains the
     * same. The price for the remaining period will be charged. This option is
     * only available for subscription upgrade.
     */
    PRORATION_MODE[PRORATION_MODE["IMMEDIATE_AND_CHARGE_PRORATED_PRICE"] = 2] = "IMMEDIATE_AND_CHARGE_PRORATED_PRICE";
    /**
     * Replacement takes effect immediately, and the new price will be charged on
     * next recurrence time. The billing cycle stays the same.
     */
    PRORATION_MODE[PRORATION_MODE["IMMEDIATE_WITHOUT_PRORATION"] = 3] = "IMMEDIATE_WITHOUT_PRORATION";
    /**
     * Replacement takes effect when the old plan expires, and the new price will
     * be charged at the same time.
     */
    PRORATION_MODE[PRORATION_MODE["DEFERRED"] = 4] = "DEFERRED";
})(PRORATION_MODE = exports.PRORATION_MODE || (exports.PRORATION_MODE = {}));
var PACKAGE_TYPE;
(function (PACKAGE_TYPE) {
    /**
     * A package that was defined with a custom identifier.
     */
    PACKAGE_TYPE["UNKNOWN"] = "UNKNOWN";
    /**
     * A package that was defined with a custom identifier.
     */
    PACKAGE_TYPE["CUSTOM"] = "CUSTOM";
    /**
     * A package configured with the predefined lifetime identifier.
     */
    PACKAGE_TYPE["LIFETIME"] = "LIFETIME";
    /**
     * A package configured with the predefined annual identifier.
     */
    PACKAGE_TYPE["ANNUAL"] = "ANNUAL";
    /**
     * A package configured with the predefined six month identifier.
     */
    PACKAGE_TYPE["SIX_MONTH"] = "SIX_MONTH";
    /**
     * A package configured with the predefined three month identifier.
     */
    PACKAGE_TYPE["THREE_MONTH"] = "THREE_MONTH";
    /**
     * A package configured with the predefined two month identifier.
     */
    PACKAGE_TYPE["TWO_MONTH"] = "TWO_MONTH";
    /**
     * A package configured with the predefined monthly identifier.
     */
    PACKAGE_TYPE["MONTHLY"] = "MONTHLY";
    /**
     * A package configured with the predefined weekly identifier.
     */
    PACKAGE_TYPE["WEEKLY"] = "WEEKLY";
})(PACKAGE_TYPE = exports.PACKAGE_TYPE || (exports.PACKAGE_TYPE = {}));
var INTRO_ELIGIBILITY_STATUS;
(function (INTRO_ELIGIBILITY_STATUS) {
    /**
     * RevenueCat doesn't have enough information to determine eligibility.
     */
    INTRO_ELIGIBILITY_STATUS[INTRO_ELIGIBILITY_STATUS["INTRO_ELIGIBILITY_STATUS_UNKNOWN"] = 0] = "INTRO_ELIGIBILITY_STATUS_UNKNOWN";
    /**
     * The user is not eligible for a free trial or intro pricing for this product.
     */
    INTRO_ELIGIBILITY_STATUS[INTRO_ELIGIBILITY_STATUS["INTRO_ELIGIBILITY_STATUS_INELIGIBLE"] = 1] = "INTRO_ELIGIBILITY_STATUS_INELIGIBLE";
    /**
     * The user is eligible for a free trial or intro pricing for this product.
     */
    INTRO_ELIGIBILITY_STATUS[INTRO_ELIGIBILITY_STATUS["INTRO_ELIGIBILITY_STATUS_ELIGIBLE"] = 2] = "INTRO_ELIGIBILITY_STATUS_ELIGIBLE";
})(INTRO_ELIGIBILITY_STATUS = exports.INTRO_ELIGIBILITY_STATUS || (exports.INTRO_ELIGIBILITY_STATUS = {}));
var purchaserInfoUpdateListeners = [];
var shouldPurchasePromoProductListeners = [];
exports.isUTCDateStringFuture = function (dateString) {
    var date = new Date(dateString);
    var dateUtcMillis = date.valueOf();
    var now = new Date();
    var nowUtcMillis = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    return nowUtcMillis < dateUtcMillis;
};
eventEmitter.addListener("Purchases-PurchaserInfoUpdated", function (purchaserInfo) {
    purchaserInfoUpdateListeners.forEach(function (listener) { return listener(purchaserInfo); });
});
eventEmitter.addListener("Purchases-ShouldPurchasePromoProduct", function (_a) {
    var callbackID = _a.callbackID;
    shouldPurchasePromoProductListeners.forEach(function (listener) {
        return listener(function () { return RNPurchases.makeDeferredPurchase(callbackID); });
    });
});
var Purchases = /** @class */ (function () {
    function Purchases() {
    }
    /**
     * Sets up Purchases with your API key and an app user id.
     * @param {string} apiKey RevenueCat API Key. Needs to be a String
     * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
     * @param {Boolean?} observerMode An optional boolean. Set this to TRUE if you have your own IAP implementation and want to use only RevenueCat's backend. Default is FALSE.
     * @returns {Promise<void>} Returns when setup completes
     */
    Purchases.setup = function (apiKey, appUserID, observerMode) {
        if (observerMode === void 0) { observerMode = false; }
        if (typeof appUserID !== "undefined" && typeof appUserID !== "string") {
            throw new Error("appUserID needs to be a string");
        }
        return RNPurchases.setupPurchases(apiKey, appUserID, observerMode);
    };
    /**
     * @param {Boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous, this is true by default if you didn't pass an appUserID
     * If an user tries to purchase a product that is active on the current app store account, we will treat it as a restore and alias
     * the new ID with the previous id.
     */
    Purchases.setAllowSharingStoreAccount = function (allowSharing) {
        RNPurchases.setAllowSharingStoreAccount(allowSharing);
    };
    /**
     * @param {Boolean} finishTransactions Set finishTransactions to false if you aren't using Purchases SDK to make the purchase
     */
    Purchases.setFinishTransactions = function (finishTransactions) {
        RNPurchases.setFinishTransactions(finishTransactions);
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
     * @param {ShouldPurchasePromoProductListener} listenerToRemove ShouldPurchasePromoProductListener reference of the listener to remove
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
     * Add a dict of attribution information
     * @param {Dict} data Attribution data from AppsFlyer, Adjust, or Branch
     * @param {ATTRIBUTION_NETWORKS} network Which network, see Purchases.ATTRIBUTION_NETWORKS
     * @param {String?} networkUserId An optional unique id for identifying the user. Needs to be a string.
     */
    Purchases.addAttributionData = function (data, network, networkUserId) {
        RNPurchases.addAttributionData(data, network, networkUserId);
    };
    /**
     * Gets the map of entitlements -> offerings -> products
     * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure
     */
    Purchases.getOfferings = function () {
        return RNPurchases.getOfferings();
    };
    /**
     * Fetch the product info
     * @param {String[]} productIdentifiers Array of product identifiers
     * @param {String} type Optional type of products to fetch, can be inapp or subs. Subs by default
     * @returns {Promise<PurchasesProduct[]>} A promise containing an array of products. The promise will be rejected if the products are not properly
     * configured in RevenueCat or if there is another error retrieving them. Rejections return an error code, and a userInfo object with more information.
     */
    Purchases.getProducts = function (productIdentifiers, type) {
        if (type === void 0) { type = PURCHASE_TYPE.SUBS; }
        return RNPurchases.getProductInfo(productIdentifiers, type);
    };
    /**
     * Make a purchase
     *
     * @deprecated Use purchaseProduct instead.
     *
     * @param {String} productIdentifier The product identifier of the product you want to purchase
     * @param {String?} oldSKU Optional sku you wish to upgrade from.
     * @param {String} type Optional type of product, can be inapp or subs. Subs by default
     * @returns {Promise<{ productIdentifier: String, purchaserInfo: PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information.
     */
    Purchases.makePurchase = function (productIdentifier, oldSKU, type) {
        if (type === void 0) { type = PURCHASE_TYPE.SUBS; }
        if (Array.isArray(oldSKU)) {
            throw new Error("Calling a deprecated method!");
        }
        if (oldSKU !== undefined && oldSKU !== null) {
            return Purchases.purchaseProduct(productIdentifier, { oldSKU: oldSKU }, type).catch(function (error) {
                error.userCancelled = error.code === "1";
                throw error;
            });
        }
        else {
            return Purchases.purchaseProduct(productIdentifier, null, type).catch(function (error) {
                error.userCancelled = error.code === "1";
                throw error;
            });
        }
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
     * a boolean indicating if the user cancelled the purchase, and an object with more information.
     */
    Purchases.purchaseProduct = function (productIdentifier, upgradeInfo, type) {
        if (type === void 0) { type = PURCHASE_TYPE.SUBS; }
        return RNPurchases.purchaseProduct(productIdentifier, upgradeInfo, type).catch(function (error) {
            error.userCancelled = error.code === "1";
            throw error;
        });
    };
    /**
     * Make a purchase
     *
     * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
     * @param {UpgradeInfo} upgradeInfo Android only. Optional UpgradeInfo you wish to upgrade from containing the oldSKU
     * and the optional prorationMode.
     * @returns {Promise<{ productIdentifier: string, purchaserInfo: PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information.
     */
    Purchases.purchasePackage = function (aPackage, upgradeInfo, discount) {
        if (discount === void 0) { discount = null; }
        return RNPurchases.purchasePackage(aPackage.identifier, aPackage.offeringIdentifier, upgradeInfo, discount && discount.identifier).catch(function (error) {
            error.userCancelled = error.code === "1";
            throw error;
        });
    };
    /**
     * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    Purchases.restoreTransactions = function () {
        return RNPurchases.restoreTransactions();
    };
    /**
     * Get the appUserID
     * @returns {Promise<string>} The app user id in a promise
     */
    Purchases.getAppUserID = function () {
        return RNPurchases.getAppUserID();
    };
    /**
     * This function will alias two appUserIDs together.
     * @param {String} newAppUserID The new appUserID that should be linked to the currently identified appUserID. Needs to be a string.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    Purchases.createAlias = function (newAppUserID) {
        // noinspection SuspiciousTypeOfGuard
        if (typeof newAppUserID !== "string") {
            throw new Error("newAppUserID needs to be a string");
        }
        return RNPurchases.createAlias(newAppUserID);
    };
    /**
     * This function will identify the current user with an appUserID. Typically this would be used after a logout to identify a new user without calling configure
     * @param {String} newAppUserID The appUserID that should be linked to the currently user
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    Purchases.identify = function (newAppUserID) {
        // noinspection SuspiciousTypeOfGuard
        if (typeof newAppUserID !== "string") {
            throw new Error("newAppUserID needs to be a string");
        }
        return RNPurchases.identify(newAppUserID);
    };
    /**
     * Resets the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    Purchases.reset = function () {
        return RNPurchases.reset();
    };
    /**
     * Enables/Disables debugs logs
     * @param {Boolean} enabled Enable or not debug logs
     */
    Purchases.setDebugLogsEnabled = function (enabled) {
        return RNPurchases.setDebugLogsEnabled(enabled);
    };
    /**
     * Gets current purchaser info
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    Purchases.getPurchaserInfo = function () {
        return RNPurchases.getPurchaserInfo();
    };
    /**
     * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
     * for subscriptions anytime a sync is needed, like after a successful purchase.
     *
     * @warning This function should only be called if you're not calling makePurchase.
     */
    Purchases.syncPurchases = function () {
        if (react_native_1.Platform.OS === "android") {
            RNPurchases.syncPurchases();
        }
    };
    /**
     * Enable automatic collection of Apple Search Ad attribution. Disabled by default
     * @param {Boolean} enabled Enable or not automatic apple search ads attribution collection
     */
    Purchases.setAutomaticAppleSearchAdsAttributionCollection = function (enabled) {
        if (react_native_1.Platform.OS === "ios") {
            RNPurchases.setAutomaticAppleSearchAdsAttributionCollection(enabled);
        }
    };
    /**
     * @returns {Promise<boolean>} If the `appUserID` has been generated by RevenueCat or not.
     */
    Purchases.isAnonymous = function () {
        return RNPurchases.isAnonymous();
    };
    /**
     *  iOS only. Computes whether or not a user is eligible for the introductory pricing period of a given product.
     *  You should use this method to determine whether or not you show the user the normal product price or the
     *  introductory price. This also applies to trials (trials are considered a type of introductory pricing).
     *
     *  @note Subscription groups are automatically collected for determining eligibility. If RevenueCat can't
     *  definitively compute the eligibility, most likely because of missing group information, it will return
     *  `INTRO_ELIGIBILITY_STATUS_UNKNOWN`. The best course of action on unknown status is to display the non-intro
     *  pricing, to not create a misleading situation. To avoid this, make sure you are testing with the latest version of
     *  iOS so that the subscription group can be collected by the SDK. Android always returns INTRO_ELIGIBILITY_STATUS_UNKNOWN.
     *
     *  @param productIdentifiers Array of product identifiers for which you want to compute eligibility
     *  @returns { [productId: string]: IntroEligibility } A map of IntroEligility per productId
     */
    Purchases.checkTrialOrIntroductoryPriceEligibility = function (productIdentifiers) {
        return RNPurchases.checkTrialOrIntroductoryPriceEligibility(productIdentifiers);
    };
    Purchases.getPaymentDiscount = function (aPackage) {
        return RNPurchases.getPaymentDiscount(aPackage.identifier, aPackage.offeringIdentifier);
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
     * Replace SKU's ProrationMode.
     * @readonly
     * @enum {number}
     */
    Purchases.PRORATION_MODE = PRORATION_MODE;
    /**
     * Enumeration of all possible Package types.
     * @readonly
     * @enum {string}
     */
    Purchases.PACKAGE_TYPE = PACKAGE_TYPE;
    /**
     * Enum of different possible states for intro price eligibility status.
     * @readonly
     * @enum {number}
     */
    Purchases.INTRO_ELIGIBILITY_STATUS = INTRO_ELIGIBILITY_STATUS;
    return Purchases;
}());
exports.default = Purchases;
