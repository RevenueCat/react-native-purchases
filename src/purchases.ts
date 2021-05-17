import { NativeEventEmitter, NativeModules } from "react-native";
import { PurchasesError, PURCHASES_ERROR_CODE } from "./errors";
import { PurchaserInfo } from "./purchaserInfo";
import {
    PRORATION_MODE,
    PACKAGE_TYPE,
    INTRO_ELIGIBILITY_STATUS,
    PurchasesOfferings,
    PurchasesProduct,
    UpgradeInfo,
    PurchasesPaymentDiscount,
    PurchasesPackage,
    IntroEligibility,
    PurchasesDiscount
} from "./offerings";

import { Platform } from "react-native";

const { RNPurchases } = NativeModules;
const eventEmitter = new NativeEventEmitter(RNPurchases);

/**
 * Listener used on updated purchaser info
 * @callback PurchaserInfoUpdateListener
 * @param {Object} purchaserInfo Object containing info for the purchaser
 */
export type PurchaserInfoUpdateListener = (purchaserInfo: PurchaserInfo) => void;
export type ShouldPurchasePromoProductListener = (deferredPurchase: () => MakePurchasePromise) => void;
type MakePurchasePromise = Promise<{ productIdentifier: string; purchaserInfo: PurchaserInfo; }>;

let purchaserInfoUpdateListeners: PurchaserInfoUpdateListener[] = [];
let shouldPurchasePromoProductListeners: ShouldPurchasePromoProductListener[] = [];

eventEmitter.addListener(
    "Purchases-PurchaserInfoUpdated",
    (purchaserInfo: PurchaserInfo) => {
        purchaserInfoUpdateListeners.forEach(listener => listener(purchaserInfo));
    }
);

eventEmitter.addListener(
    "Purchases-ShouldPurchasePromoProduct",
    ({ callbackID }: { callbackID: number }) => {
        shouldPurchasePromoProductListeners.forEach(listener =>
            listener(() => RNPurchases.makeDeferredPurchase(callbackID))
        );
    }
);

export enum ATTRIBUTION_NETWORK {
    APPLE_SEARCH_ADS = 0,
    ADJUST = 1,
    APPSFLYER = 2,
    BRANCH = 3,
    TENJIN = 4,
    FACEBOOK = 5,
}

export enum PURCHASE_TYPE {
    /**
     * A type of SKU for in-app products.
     */
    INAPP = "inapp",

    /**
     * A type of SKU for subscriptions.
     */
    SUBS = "subs",
}

/**
 * Holds the logIn result
 */
export interface LogInResult {
  /**
   * The Purchaser Info for the user.
   */
  readonly purchaserInfo: PurchaserInfo;
  /**
   * True if the call resulted in a new user getting created in the RevenueCat backend.
   */
  readonly created: boolean;
}

export default class Purchases {
    /**
     * Enum for attribution networks
     * @readonly
     * @enum {number}
     */
    public static ATTRIBUTION_NETWORK = ATTRIBUTION_NETWORK;

    /**
     * @deprecated use ATTRIBUTION_NETWORK instead
     *
     * Enum for attribution networks
     * @readonly
     * @enum {number}
     */
    public static ATTRIBUTION_NETWORKS = ATTRIBUTION_NETWORK;

    /**
     * Supported SKU types.
     * @readonly
     * @enum {string}
     */
    public static PURCHASE_TYPE = PURCHASE_TYPE;

    /**
     * Replace SKU's ProrationMode.
     * @readonly
     * @enum {number}
     */
    public static PRORATION_MODE = PRORATION_MODE;

    /**
     * Enumeration of all possible Package types.
     * @readonly
     * @enum {string}
     */
    public static PACKAGE_TYPE = PACKAGE_TYPE;

    /**
     * Enum of different possible states for intro price eligibility status.
     * @readonly
     * @enum {number}
     */
    public static INTRO_ELIGIBILITY_STATUS = INTRO_ELIGIBILITY_STATUS;

    /**
     * Enum of all error codes the SDK produces. 
     * @readonly
     * @enum {string}
     */
    public static PURCHASES_ERROR_CODE = PURCHASES_ERROR_CODE;

    /**
     * Sets up Purchases with your API key and an app user id.
     * @param {String} apiKey RevenueCat API Key. Needs to be a String
     * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
     * @param {boolean?} observerMode An optional boolean. Set this to TRUE if you have your own IAP implementation and want to use only RevenueCat's backend. Default is FALSE.
     * @param {String?} userDefaultsSuiteName An optional string. iOS-only, will be ignored for Android. 
     * Set this if you would like the RevenueCat SDK to store its preferences in a different NSUserDefaults suite, otherwise it will use standardUserDefaults.
     * Default is null, which will make the SDK use standardUserDefaults.
     */
    public static setup(
        apiKey: string,
        appUserID?: string | null,
        observerMode: boolean = false,
        userDefaultsSuiteName?: string
    ): void {
        if (appUserID !== null && typeof appUserID !== "undefined" && typeof appUserID !== "string") {
            throw new Error("appUserID needs to be a string");
        }
        RNPurchases.setupPurchases(
            apiKey,
            appUserID,
            observerMode,
            userDefaultsSuiteName
        );
    }

    /**
     * @deprecated, configure behavior through the RevenueCat dashboard instead.
     * If an user tries to purchase a product that is active on the current app store account, we will treat it as a restore and alias
     * the new ID with the previous id.
     * @param {boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous, this is true by default if you didn't pass an appUserID
     */
    public static setAllowSharingStoreAccount(allowSharing: boolean): void {
        RNPurchases.setAllowSharingStoreAccount(allowSharing);
    }

    /**
     * @param {boolean} finishTransactions Set finishTransactions to false if you aren't using Purchases SDK to make the purchase
     */
    public static setFinishTransactions(finishTransactions: boolean): void {
        RNPurchases.setFinishTransactions(finishTransactions);
    }

    /**
     * iOS only.
     * @param {boolean} simulatesAskToBuyInSandbox Set this property to true *only* when testing the ask-to-buy / SCA purchases flow. 
     * More information: http://errors.rev.cat/ask-to-buy
     */
    public static setSimulatesAskToBuyInSandbox(simulatesAskToBuyInSandbox: boolean): void {
        if (Platform.OS === "ios") {
            RNPurchases.setSimulatesAskToBuyInSandbox(simulatesAskToBuyInSandbox);
        }
    }

    /**
     * Sets a function to be called on updated purchaser info
     * @param {PurchaserInfoUpdateListener} purchaserInfoUpdateListener PurchaserInfo update listener
     */
    public static addPurchaserInfoUpdateListener(
        purchaserInfoUpdateListener: PurchaserInfoUpdateListener
    ): void {
        if (typeof purchaserInfoUpdateListener !== "function") {
            throw new Error("addPurchaserInfoUpdateListener needs a function");
        }
        purchaserInfoUpdateListeners.push(purchaserInfoUpdateListener);
    }

    /**
     * Removes a given PurchaserInfoUpdateListener
     * @param {PurchaserInfoUpdateListener} listenerToRemove PurchaserInfoUpdateListener reference of the listener to remove
     * @returns {boolean} True if listener was removed, false otherwise
     */
    public static removePurchaserInfoUpdateListener(
        listenerToRemove: PurchaserInfoUpdateListener
    ): boolean {
        if (purchaserInfoUpdateListeners.includes(listenerToRemove)) {
            purchaserInfoUpdateListeners = purchaserInfoUpdateListeners.filter(
                listener => listenerToRemove !== listener
            );
            return true;
        }
        return false;
    }

    /**
     * Sets a function to be called on purchases initiated on the Apple App Store. This is only used in iOS.
     * @param {ShouldPurchasePromoProductListener} shouldPurchasePromoProductListener Called when a user initiates a
     * promotional in-app purchase from the App Store. If your app is able to handle a purchase at the current time, run
     * the deferredPurchase function. If the app is not in a state to make a purchase: cache the deferredPurchase, then
     * call the deferredPurchase when the app is ready to make the promotional purchase.
     * If the purchase should never be made, you don't need to ever call the deferredPurchase and the app will not
     * proceed with promotional purchases.
     */
    public static addShouldPurchasePromoProductListener(
        shouldPurchasePromoProductListener: ShouldPurchasePromoProductListener
    ): void {
        if (typeof shouldPurchasePromoProductListener !== "function") {
            throw new Error("addShouldPurchasePromoProductListener needs a function");
        }
        shouldPurchasePromoProductListeners.push(shouldPurchasePromoProductListener);
    }

    /**
     * Removes a given ShouldPurchasePromoProductListener
     * @param {ShouldPurchasePromoProductListener} listenerToRemove ShouldPurchasePromoProductListener reference of the listener to remove
     * @returns {boolean} True if listener was removed, false otherwise
     */
    public static removeShouldPurchasePromoProductListener(
        listenerToRemove: ShouldPurchasePromoProductListener
    ): boolean {
        if (shouldPurchasePromoProductListeners.includes(listenerToRemove)) {
            shouldPurchasePromoProductListeners = shouldPurchasePromoProductListeners.filter(
                listener => listenerToRemove !== listener
            );
            return true;
        }
        return false;
    }

    /**
     * @deprecated, use set<NetworkId> methods instead.
     * 
     * Add a dict of attribution information
     * @param {Dict} data Attribution data from AppsFlyer, Adjust, or Branch
     * @param {ATTRIBUTION_NETWORKS} network Which network, see Purchases.ATTRIBUTION_NETWORKS
     * @param {String?} networkUserId An optional unique id for identifying the user. Needs to be a string.
     */
    public static addAttributionData(
        data: { [key: string]: any },
        network: ATTRIBUTION_NETWORK,
        networkUserId?: string
    ): void {
        RNPurchases.addAttributionData(data, network, networkUserId);
    }

    /**
     * Gets the map of entitlements -> offerings -> products
     * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure
     */
    public static getOfferings(): Promise<PurchasesOfferings> {
        return RNPurchases.getOfferings();
    }

    /**
     * Fetch the product info
     * @param {String[]} productIdentifiers Array of product identifiers
     * @param {String} type Optional type of products to fetch, can be inapp or subs. Subs by default
     * @returns {Promise<PurchasesProduct[]>} A promise containing an array of products. The promise will be rejected if the products are not properly
     * configured in RevenueCat or if there is another error retrieving them. Rejections return an error code, and a userInfo object with more information.
     */
    public static getProducts(
        productIdentifiers: string[],
        type: PURCHASE_TYPE = PURCHASE_TYPE.SUBS
    ): Promise<PurchasesProduct[]> {
        return RNPurchases.getProductInfo(productIdentifiers, type);
    }

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
    public static purchaseProduct(
        productIdentifier: string,
        upgradeInfo?: UpgradeInfo | null,
        type: PURCHASE_TYPE = PURCHASE_TYPE.SUBS
    ): MakePurchasePromise {
        return RNPurchases.purchaseProduct(
            productIdentifier,
            upgradeInfo,
            type,
            null
        ).catch((error: PurchasesError) => {
            error.userCancelled = error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
            throw error;
        });
    }

    /**
     * iOS only. Purchase a product applying a given discount.
     *
     * @param {PurchasesProduct} product The product you want to purchase
     * @param {PurchasesPaymentDiscount} discount Discount to apply to this package. Retrieve this discount using getPaymentDiscount.
     * @returns {Promise<{ productIdentifier: string, purchaserInfo:PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information.
     */
    public static purchaseDiscountedProduct(
        product: PurchasesProduct,
        discount: PurchasesPaymentDiscount
    ): MakePurchasePromise {
        if (typeof discount === "undefined" || discount == null) {
            throw new Error("A discount is required");
        }
        return RNPurchases.purchaseProduct(
            product.identifier,
            null,
            null,
            discount.timestamp.toString()
        ).catch((error: PurchasesError) => {
            error.userCancelled = error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
            throw error;
        });
    }

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
    public static purchasePackage(
        aPackage: PurchasesPackage,
        upgradeInfo?: UpgradeInfo | null
    ): MakePurchasePromise {
        return RNPurchases.purchasePackage(
            aPackage.identifier,
            aPackage.offeringIdentifier,
            upgradeInfo,
            null
        ).catch((error: PurchasesError) => {
            error.userCancelled = error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
            throw error;
        });
    }

    /**
     * iOS only. Purchase a package applying a given discount.
     *
     * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
     * @param {PurchasesPaymentDiscount} discount Discount to apply to this package. Retrieve this discount using getPaymentDiscount.
     * @returns {Promise<{ productIdentifier: string, purchaserInfo: PurchaserInfo }>} A promise of an object containing
     * a purchaser info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information.
     */
    public static purchaseDiscountedPackage(
        aPackage: PurchasesPackage,
        discount: PurchasesPaymentDiscount
    ): MakePurchasePromise {
        if (typeof discount === "undefined" || discount == null) {
            throw new Error("A discount is required");
        }
        return RNPurchases.purchasePackage(
            aPackage.identifier,
            aPackage.offeringIdentifier,
            null,
            discount.timestamp.toString()
        ).catch((error: PurchasesError) => {
            error.userCancelled = error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
            throw error;
        });
    }

    /**
     * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    public static restoreTransactions(): Promise<PurchaserInfo> {
        return RNPurchases.restoreTransactions();
    }

    /**
     * Get the appUserID
     * @returns {string} The app user id in a promise
     */
    public static getAppUserID(): string {
        return RNPurchases.getAppUserID();
    }

    /**
     * This function will logIn the current user with an appUserID. Typically this would be used after a log in 
     * to identify a user without calling configure.
     * @param {String} appUserID The appUserID that should be linked to the currently user
     * @returns {Promise<LogInResult>} A promise of an object that contains the purchaserInfo after logging in, as well as a boolean indicating 
     * whether the user has just been created for the first time in the RevenueCat backend. 
     */
    public static logIn(appUserID: string): Promise<LogInResult> {
      // noinspection SuspiciousTypeOfGuard
      if (typeof appUserID !== "string") {
        throw new Error("appUserID needs to be a string");
      }
      return RNPurchases.logIn(appUserID);
    }

    /**
     * Logs out the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    public static logOut(): Promise<PurchaserInfo> {
      return RNPurchases.logOut();
    }

    /**
     * @deprecated, use logIn instead.
     * This function will alias two appUserIDs together.
     * @param {String} newAppUserID The new appUserID that should be linked to the currently identified appUserID. Needs to be a string.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    public static createAlias(newAppUserID: string): Promise<PurchaserInfo> {
        // noinspection SuspiciousTypeOfGuard
        if (typeof newAppUserID !== "string") {
            throw new Error("newAppUserID needs to be a string");
        }
        return RNPurchases.createAlias(newAppUserID);
    }

    /**
     * @deprecated, use logIn instead.
     * This function will identify the current user with an appUserID. Typically this would be used after a logout to identify a new user without calling configure
     * @param {String} newAppUserID The appUserID that should be linked to the currently user
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    public static identify(newAppUserID: string): Promise<PurchaserInfo> {
        // noinspection SuspiciousTypeOfGuard
        if (typeof newAppUserID !== "string") {
            throw new Error("newAppUserID needs to be a string");
        }
        return RNPurchases.identify(newAppUserID);
    }

    /**
     * @deprecated, use logOut instead.
     * Resets the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    public static reset(): Promise<PurchaserInfo> {
        return RNPurchases.reset();
    }

    /**
     * Enables/Disables debugs logs
     * @param {boolean} enabled Enable or not debug logs
     */
    public static setDebugLogsEnabled(enabled: boolean): void {
        RNPurchases.setDebugLogsEnabled(enabled);
    }

    /**
     * Gets current purchaser info
     * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    public static getPurchaserInfo(): Promise<PurchaserInfo> {
        return RNPurchases.getPurchaserInfo();
    }

    /**
     * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
     * for subscriptions anytime a sync is needed, like after a successful purchase.
     *
     * @warning This function should only be called if you're not calling makePurchase.
     */
    public static syncPurchases(): void {
        RNPurchases.syncPurchases();
    }

    /**
     * Enable automatic collection of Apple Search Ad attribution. Disabled by default
     * @param {boolean} enabled Enable or not automatic apple search ads attribution collection
     */
    public static setAutomaticAppleSearchAdsAttributionCollection(
        enabled: boolean
    ): void {
        if (Platform.OS === "ios") {
            RNPurchases.setAutomaticAppleSearchAdsAttributionCollection(enabled);
        }
    }

    /**
     * @returns { boolean } If the `appUserID` has been generated by RevenueCat or not.
     */
    public static isAnonymous(): boolean {
        return RNPurchases.isAnonymous();
    }

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
     *  @returns { Promise<[productId: string]: IntroEligibility> } A map of IntroEligility per productId
     */
    public static checkTrialOrIntroductoryPriceEligibility(
        productIdentifiers: string[]
    ): Promise<{ [productId: string]: IntroEligibility }> {
        return RNPurchases.checkTrialOrIntroductoryPriceEligibility(
            productIdentifiers
        );
    }

    /**
     *  iOS only. Use this function to retrieve the `PurchasesPaymentDiscount` for a given `PurchasesPackage`.
     *
     *  @param product The `PurchasesProduct` the user intends to purchase.
     *  @param discount The `PurchasesDiscount` to apply to the product.
     *  @returns { Promise<PurchasesPaymentDiscount> } Returns when the `PurchasesPaymentDiscount` is returned. Null is returned for Android and incompatible iOS versions.
     */
    public static getPaymentDiscount(
        product: PurchasesProduct,
        discount: PurchasesDiscount
    ): Promise<PurchasesPaymentDiscount | undefined> {
        if (Platform.OS === "android") {
            return Promise.resolve(undefined);
        }
        if (typeof discount === "undefined" || discount == null) {
            throw new Error("A discount is required");
        }
        return RNPurchases.getPaymentDiscount(
            product.identifier,
            discount.identifier
        );
    }


    /**
     * Invalidates the cache for purchaser information.
     *
     * Most apps will not need to use this method; invalidating the cache can leave your app in an invalid state.
     * Refer to https://docs.revenuecat.com/docs/purchaserinfo#section-get-user-information for more information on
     * using the cache properly.
     *
     * This is useful for cases where purchaser information might have been updated outside of the app, like if a
     * promotional subscription is granted through the RevenueCat dashboard.
     */
    public static invalidatePurchaserInfoCache(): void {
        RNPurchases.invalidatePurchaserInfoCache();
    }

    /** iOS only. Presents a code redemption sheet, useful for redeeming offer codes
     * Refer to https://docs.revenuecat.com/docs/ios-subscription-offers#offer-codes for more information on how
     * to configure and use offer codes 
     */
    public static presentCodeRedemptionSheet(): void {
        if (Platform.OS === "ios") {
            RNPurchases.presentCodeRedemptionSheet();
        }
    }

    /**
     * Subscriber attributes are useful for storing additional, structured information on a user.
     * Since attributes are writable using a public key they should not be used for
     * managing secure or sensitive information such as subscription status, coins, etc.
     *
     * Key names starting with "$" are reserved names used by RevenueCat. For a full list of key
     * restrictions refer to our guide: https://docs.revenuecat.com/docs/subscriber-attributes
     *
     * @param attributes Map of attributes by key. Set the value as an empty string to delete an attribute.
     */
    public static setAttributes(attributes: { [key: string]: string | null }): void {
        RNPurchases.setAttributes(attributes);
    }

    /**
     * Subscriber attribute associated with the email address for the user
     *
     * @param email Empty String or null will delete the subscriber attribute.
     */
    public static setEmail(email: string | null): void {
        RNPurchases.setEmail(email);
    }

    /**
     * Subscriber attribute associated with the phone number for the user
     *
     * @param phoneNumber Empty String or null will delete the subscriber attribute.
     */
    public static setPhoneNumber(phoneNumber: string | null): void {
        RNPurchases.setPhoneNumber(phoneNumber);
    }

    /**
     * Subscriber attribute associated with the display name for the user
     *
     * @param displayName Empty String or null will delete the subscriber attribute.
     */
    public static setDisplayName(displayName: string | null): void {
        RNPurchases.setDisplayName(displayName);
    }

    /**
     * Subscriber attribute associated with the push token for the user
     *
     * @param pushToken null will delete the subscriber attribute.
     */
    public static setPushToken(pushToken: string | null): void {
        RNPurchases.setPushToken(pushToken);
    }

    /**
     * Set this property to your proxy URL before configuring Purchases *only* if you've received a proxy key value from your RevenueCat contact.
     */
    public static setProxyURL(url: string): void {
        RNPurchases.setProxyURLString(url);
    }

    /**
     * Automatically collect subscriber attributes associated with the device identifiers. 
     * $idfa, $idfv, $ip on iOS
     * $gpsAdId, $androidId, $ip on Android
     */
    public static collectDeviceIdentifiers(): void {
        RNPurchases.collectDeviceIdentifiers();
    }

    /**
     * Subscriber attribute associated with the Adjust Id for the user
     * Required for the RevenueCat Adjust integration
     *
     * @param adjustID Empty String or null will delete the subscriber attribute.
     */
    public static setAdjustID(adjustID: string | null): void {
        RNPurchases.setAdjustID(adjustID);
    }

    /**
     * Subscriber attribute associated with the AppsFlyer Id for the user
     * Required for the RevenueCat AppsFlyer integration
     * @param appsflyerID Empty String or null will delete the subscriber attribute.
     */
    public static setAppsflyerID(appsflyerID: string | null): void {
        RNPurchases.setAppsflyerID(appsflyerID);
    }

    /**
     * Subscriber attribute associated with the Facebook SDK Anonymous Id for the user
     * Recommended for the RevenueCat Facebook integration
     *
     * @param fbAnonymousID Empty String or null will delete the subscriber attribute.
     */
    public static setFBAnonymousID(fbAnonymousID: string | null): void {
        RNPurchases.setFBAnonymousID(fbAnonymousID);
    }

    /**
     * Subscriber attribute associated with the mParticle Id for the user
     * Recommended for the RevenueCat mParticle integration
     *
     * @param mparticleID Empty String or null will delete the subscriber attribute.
     */
    public static setMparticleID(mparticleID: string | null): void {
        RNPurchases.setMparticleID(mparticleID);
    }

    /**
     * Subscriber attribute associated with the OneSignal Player Id for the user
     * Required for the RevenueCat OneSignal integration
     *
     * @param onesignalID Empty String or null will delete the subscriber attribute.
     */
    public static setOnesignalID(onesignalID: string | null): void {
        RNPurchases.setOnesignalID(onesignalID);
    }

    /**
     * Subscriber attribute associated with the install media source for the user
     *
     * @param mediaSource Empty String or null will delete the subscriber attribute.
     */
    public static setMediaSource(mediaSource: string | null): void {
        RNPurchases.setMediaSource(mediaSource);
    }

    /**
     * Subscriber attribute associated with the install campaign for the user
     *
     * @param campaign Empty String or null will delete the subscriber attribute.
     */
    public static setCampaign(campaign: string | null): void {
        RNPurchases.setCampaign(campaign);
    }

    /**
     * Subscriber attribute associated with the install ad group for the user
     *
     * @param adGroup Empty String or null will delete the subscriber attribute.
     */
    public static setAdGroup(adGroup: string | null): void {
        RNPurchases.setAdGroup(adGroup);
    }

    /**
     * Subscriber attribute associated with the install ad for the user
     *
     * @param ad Empty String or null will delete the subscriber attribute.
     */
    public static setAd(ad: string | null): void {
        RNPurchases.setAd(ad);
    }

    /**
     * Subscriber attribute associated with the install keyword for the user
     *
     * @param keyword Empty String or null will delete the subscriber attribute.
     */
    public static setKeyword(keyword: string | null): void {
        RNPurchases.setKeyword(keyword);
    }

    /**
     * Subscriber attribute associated with the install ad creative for the user
     *
     * @param creative Empty String or null will delete the subscriber attribute.
     */
    public static setCreative(creative: string | null): void {
        RNPurchases.setCreative(creative);
    }

}
