import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const { RNPurchases } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPurchases);

let purchaserInfoUpdateListeners = [];

export const isUTCDateStringFuture = dateString => {
  const date = new Date(dateString);
  const dateUtcMillis = date.valueOf();
  const now = new Date();
  const nowUtcMillis = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );
  return nowUtcMillis < dateUtcMillis;
};

eventEmitter.addListener("Purchases-PurchaserInfoUpdated", purchaserInfo => {
  purchaserInfoUpdateListeners.forEach(listener => listener(purchaserInfo));
});

export default class Purchases {
  /**
   * Sets up Purchases with your API key and an app user id.
   * @param {String} apiKey RevenueCat API Key. Needs to be a String
   * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
   * @param {Boolean} observerMode An optional boolean. Set this to TRUE if you have your own IAP implementation and want to use only RevenueCat's backend. Default is FALSE.
   * @returns {Promise<void>} Returns when setup completes
   */
  static setup(apiKey, appUserID, observerMode = false) {
    if (typeof appUserID !== "undefined" && typeof appUserID !== "string") {
      throw new Error("appUserID needs to be a string");
    }
    return RNPurchases.setupPurchases(apiKey, appUserID, observerMode);
  }

  /**
   * Set this to true if you are passing in an appUserID but it is anonymous, this is true by default if you didn't pass an appUserID
   * If a user tries to purchase a product that is active on the current app store account, we will treat it as a restore and alias
   * the new ID with the previous id.
   */
  static setAllowSharingStoreAccount(allowSharing) {
    RNPurchases.setAllowSharingStoreAccount(allowSharing);
  }

  /**
   * Set finishTransactions to false if you aren't using Purchases SDK to make the purchase
   */

  static setFinishTransactions(finishTransactions) {
    RNPurchases.setFinishTransactions(finishTransactions);
  }

  /**
   * Listener used on updated purchaser info
   * @callback PurchaserInfoUpdateListener
   * @param {Object} purchaserInfo Object containing info for the purchaser
   */

  /**
   * Sets a function to be called on updated purchaser info
   * @param {PurchaserInfoUpdateListener} purchaserInfoUpdateListener PurchaserInfo update listener
   */
  static addPurchaserInfoUpdateListener(purchaserInfoUpdateListener) {
    if (typeof purchaserInfoUpdateListener !== "function") {
      throw new Error("addPurchaserInfoUpdateListener needs a function");
    }
    purchaserInfoUpdateListeners.push(purchaserInfoUpdateListener);
  }

  /**
   * Removes a given PurchaserInfoUpdateListener
   * @param {PurchaserInfoListener} listenerToRemove PurchaserInfoListener reference of the listener to remove
   * @returns {Boolean} True if listener was removed, false otherwise
   */
  static removePurchaserInfoUpdateListener(listenerToRemove) {
    if (purchaserInfoUpdateListeners.includes(listenerToRemove)) {
      purchaserInfoUpdateListeners = purchaserInfoUpdateListeners.filter(
        listener => listenerToRemove !== listener
      );
      return true;
    }
    return false;
  }

  /**
   * Enum for attribution networks
   * @readonly
   * @enum {Number}
   */
  static ATTRIBUTION_NETWORKS = {
    APPLE_SEARCH_ADS: 0,
    ADJUST: 1,
    APPSFLYER: 2,
    BRANCH: 3,
    TENJIN: 4,
    FACEBOOK: 5
  };

  /**
   * Add a dict of attribution information
   * @param {Dict} data Attribution data from AppsFlyer, Adjust, or Branch
   * @param {ATTRIBUTION_NETWORKS} network Which network, see Purchases.ATTRIBUTION_NETWORKS
   * @param {String?} networkUserId An optional unique id for identifying the user. Needs to be a string.
   */
  static addAttributionData(data, network, networkUserId) {
    RNPurchases.addAttributionData(data, network, networkUserId);
  }

  /**
   * Gets the map of entitlements -> offerings -> products
   * @returns {Promise<Map<String, Map<String, Product>>>} Promise of entitlements structure
   */
  static getEntitlements() {
    return RNPurchases.getEntitlements();
  }

  /**
   * Fetch the product info
   * @param {[String]} productIdentifiers Array of product identifiers
   * @param {String} type Optional type of products to fetch, can be inapp or subs. Subs by default
   * @returns {Promise<Array>} A promise containing an array of products. The promise will be rejected if the products are not properly
   * configured in RevenueCat or if there is another error retrieving them. Rejections return an error code, and a userInfo object with more information.
   */
  static getProducts(productIdentifiers, type = "subs") {
    return RNPurchases.getProductInfo(productIdentifiers, type);
  }

  /**
   * Make a purchase
   * @param {String} productIdentifier The product identifier of the product you want to purchase
   * @param {String?} oldSKU Optional sku you wish to upgrade from.
   * @param {String} type Optional type of product, can be inapp or subs. Subs by default
   * @returns {Promise<Object>} A promise of an object containing a purchaser info object and a product identifier. Rejections return an error code,
   * and a userInfo object with more information and a boolean indicating if the user cancelled the purchase.
   */
  static makePurchase(productIdentifier, oldSKU, type = "subs") {
    if (Array.isArray(oldSKU)) {
      throw new Error("Calling a deprecated method!");
    }
    return RNPurchases.makePurchase(productIdentifier, oldSKU, type).catch(
      error => {
        const newError = error;
        newError.userCancelled = error.code === "1";
        throw newError;
      }
    );
  }

  /**
   * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
   * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
   */
  static restoreTransactions() {
    return RNPurchases.restoreTransactions();
  }

  /**
   * Get the appUserID
   * @returns {Promise<String>} The app user id in a promise
   */
  static getAppUserID() {
    return RNPurchases.getAppUserID();
  }

  /**
   * This function will alias two appUserIDs together.
   * @param {String} newAppUserID The new appUserID that should be linked to the currently identified appUserID. Needs to be a string.
   * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
   */
  static createAlias(newAppUserID) {
    if (
      typeof newAppUserID === "undefined" ||
      typeof newAppUserID !== "string"
    ) {
      throw new Error("newAppUserID needs to be a string");
    }
    return RNPurchases.createAlias(newAppUserID);
  }

  /**
   * This function will identify the current user with an appUserID. Typically this would be used after a logout to identify a new user without calling configure
   * @param {String} newAppUserID The appUserID that should be linked to the currently user
   * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
   */
  static identify(newAppUserID) {
    if (
      typeof newAppUserID === "undefined" ||
      typeof newAppUserID !== "string"
    ) {
      throw new Error("newAppUserID needs to be a string");
    }
    return RNPurchases.identify(newAppUserID);
  }

  /**
   * Resets the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
   * @returns {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
   */
  static reset() {
    return RNPurchases.reset();
  }

  /**
   * Enables/Disables debugs logs
   * @param {Boolean} enabled Enable or not debug logs
   */
  static setDebugLogsEnabled(enabled) {
    return RNPurchases.setDebugLogsEnabled(enabled);
  }

  /**
   * Gets current purchaser info
   * @return {Promise<Object>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
   */
  static getPurchaserInfo() {
    return RNPurchases.getPurchaserInfo();
  }

  /**
   * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
   * for subscriptions anytime a sync is needed, like after a successful purchase.
   *
   * @warning This function should only be called if you're not calling makePurchase.
   */
  static syncPurchases() {
    if (Platform.OS === "android") {
      RNPurchases.syncPurchases();
    }
  }

  /**
   * Enable automatic collection of Apple Search Ad attribution. Disabled by default
   * @param {Boolean} enabled Enable or not automatic apple search ads attribution collection
   */
  static setAutomaticAppleSearchAdsAttributionCollection(enabled) {
    if (Platform.OS === "ios") {
      RNPurchases.setAutomaticAppleSearchAdsAttributionCollection(enabled);
    }
  }
}
