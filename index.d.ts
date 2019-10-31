declare type PurchaserInfo = {
    [key: string]: any;
};
declare enum ATTRIBUTION_NETWORK {
    APPLE_SEARCH_ADS = 0,
    ADJUST = 1,
    APPSFLYER = 2,
    BRANCH = 3,
    TENJIN = 4,
    FACEBOOK = 5
}
/**
 * Listener used on updated purchaser info
 * @callback PurchaserInfoUpdateListener
 * @param {Object} purchaserInfo Object containing info for the purchaser
 */
declare type PurchaserInfoUpdateListener = (purchaserInfo: PurchaserInfo) => void;
export declare const isUTCDateStringFuture: (dateString: string) => boolean;
export default class Purchases {
    /**
     * Enum for attribution networks
     * @readonly
     * @enum {Number}
     */
    static ATTRIBUTION_NETWORKS: typeof ATTRIBUTION_NETWORK;
    /**
     * Sets up Purchases with your API key and an app user id.
     * @param {String} apiKey RevenueCat API Key. Needs to be a String
     * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
     * @param {Boolean?} observerMode An optional boolean. Set this to TRUE if you have your own IAP implementation and want to use only RevenueCat's backend. Default is FALSE.
     * @returns {Promise<void>} Returns when setup completes
     */
    static setup(apiKey: string, appUserID?: string | null, observerMode?: boolean): any;
    /**
     * @param {Boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous, this is true by default if you didn't pass an appUserID
     * If an user tries to purchase a product that is active on the current app store account, we will treat it as a restore and alias
     * the new ID with the previous id.
     */
    static setAllowSharingStoreAccount(allowSharing: boolean): void;
    /**
     * @param {Boolean} finishTransactions Set finishTransactions to false if you aren't using Purchases SDK to make the purchase
     */
    static setFinishTransactions(finishTransactions: boolean): void;
    /**
     * Sets a function to be called on updated purchaser info
     * @param {PurchaserInfoUpdateListener} purchaserInfoUpdateListener PurchaserInfo update listener
     */
    static addPurchaserInfoUpdateListener(purchaserInfoUpdateListener: PurchaserInfoUpdateListener): void;
    /**
     * Removes a given PurchaserInfoUpdateListener
     * @param {=PurchaserInfoUpdateListener} listenerToRemove =PurchaserInfoUpdateListener reference of the listener to remove
     * @returns {Boolean} True if listener was removed, false otherwise
     */
    static removePurchaserInfoUpdateListener(listenerToRemove: PurchaserInfoUpdateListener): boolean;
    /**
     * Add a dict of attribution information
     * @param {Dict} data Attribution data from AppsFlyer, Adjust, or Branch
     * @param {ATTRIBUTION_NETWORKS} network Which network, see Purchases.ATTRIBUTION_NETWORKS
     * @param {String?} networkUserId An optional unique id for identifying the user. Needs to be a string.
     */
    static addAttributionData(data: {
        [key: string]: any;
    }, network: ATTRIBUTION_NETWORK, networkUserId?: string): void;
    /**
     * Gets the map of entitlements -> offerings -> products
     * @returns {Promise<Map<String, Map<String, Product>>>} Promise of entitlements structure
     */
    static getEntitlements(): Promise<{
        [entitlement: string]: {
            [productId: string]: any;
        };
    }>;
    /**
     * Fetch the product info
     * @param {[String]} productIdentifiers Array of product identifiers
     * @param {String} type Optional type of products to fetch, can be inapp or subs. Subs by default
     * @returns {Promise<Array>} A promise containing an array of products. The promise will be rejected if the products are not properly
     * configured in RevenueCat or if there is another error retrieving them. Rejections return an error code, and a userInfo object with more information.
     */
    static getProducts(productIdentifiers: string[], type?: string): any;
    /**
     * Make a purchase
     * @param {String} productIdentifier The product identifier of the product you want to purchase
     * @param {String?} oldSKU Optional sku you wish to upgrade from.
     * @param {String} type Optional type of product, can be inapp or subs. Subs by default
     * @returns {Promise<Object>} A promise of an object containing a purchaser info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an userInfo object with more information.
     */
    static makePurchase(productIdentifier: string, oldSKU?: string | null, type?: string): any;
    /**
     * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
     * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    static restoreTransactions(): any;
    /**
     * Get the appUserID
     * @returns {Promise<String>} The app user id in a promise
     */
    static getAppUserID(): any;
    /**
     * This function will alias two appUserIDs together.
     * @param {String} newAppUserID The new appUserID that should be linked to the currently identified appUserID. Needs to be a string.
     * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    static createAlias(newAppUserID: string): any;
    /**
     * This function will identify the current user with an appUserID. Typically this would be used after a logout to identify a new user without calling configure
     * @param {String} newAppUserID The appUserID that should be linked to the currently user
     * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    static identify(newAppUserID: string): any;
    /**
     * Resets the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
     * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    static reset(): any;
    /**
     * Enables/Disables debugs logs
     * @param {Boolean} enabled Enable or not debug logs
     */
    static setDebugLogsEnabled(enabled: boolean): any;
    /**
     * Gets current purchaser info
     * @return {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
     */
    static getPurchaserInfo(): any;
    /**
     * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
     * for subscriptions anytime a sync is needed, like after a successful purchase.
     *
     * @warning This function should only be called if you're not calling makePurchase.
     */
    static syncPurchases(): void;
    /**
     * Enable automatic collection of Apple Search Ad attribution. Disabled by default
     * @param {Boolean} enabled Enable or not automatic apple search ads attribution collection
     */
    static setAutomaticAppleSearchAdsAttributionCollection(enabled: boolean): void;
}
export {};
