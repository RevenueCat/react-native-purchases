import { NativeEventEmitter, NativeModules } from "react-native";

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

eventEmitter.addListener(
  "Purchases-PurchaserInfoUpdated",
  ({ purchaserInfo, error }) => {
    purchaserInfoUpdateListeners.forEach(listener =>
      listener(purchaserInfo, error)
    );
  }
);

export default class Purchases {
  /** Sets up Purchases with your API key and an app user id. If a user logs out and you have a new appUserId, call it again.
      @param {String} apiKey RevenueCat API Key
      @param {String?} appUserID A unique id for identifying the user

      @returns {Promise<void>} Returns when setup complete
  */
  static setup(apiKey, appUserID) {
    if (typeof appUserID === "undefined" || typeof appUserID !== "string") {
      throw new Error("appUserID needs to be a string");
    }
    return RNPurchases.setupPurchases(apiKey, appUserID);
  }

  /** Set this to true if you are passing in an appUserID but it is anonymous, this is true by default if you didn't pass an appUserID
   If a user tries to purchase a product that is active on the current app store account, we will treat it as a restore and alias
   the new ID with the previous id.
  */
  static setAllowSharingStoreAccount(allowSharing) {
    RNPurchases.setAllowSharingStoreAccount(allowSharing);
  }

  /** @callback PurchaserInfoListener
      @param {Object} purchaserInfo Object containing info for the purchaser
      @param {Object} error Error object
  */

  /** Sets a function to be called on updated purchaser info
      @param {PurchaserInfoListener} purchaserInfoUpdateListener PurchaserInfo update listener 
  */
  static addPurchaserInfoUpdateListener(purchaserInfoUpdateListener) {
    if (typeof purchaserInfoUpdateListener !== "function") {
      throw new Error("addPurchaserInfoUpdateListener needs a function");
    }
    purchaserInfoUpdateListeners.push(purchaserInfoUpdateListener);
  }

  /** Removes a given PurchaserInfoUpdateListener
      @param {PurchaserInfoListener} listenerToRemove PurchaserInfoListener reference of the listener to remove
      @returns {Boolean} True if listener was removed, false otherwise
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

  static ATTRIBUTION_NETWORKS = {
    APPLE_SEARCH_ADS: 0,
    ADJUST: 1,
    APPSFLYER: 2,
    BRANCH: 3,
    TENJIN: 4
  };

  /** 
    Add a dict of attribution information
    @param data Attribution data from AppsFlyer, Adjust, or Branch
    @param network Which network, see Purchases.ATTRIBUTION_NETWORKS
  */
  static addAttributionData(data, network) {
    RNPurchases.addAttributionData(data, network);
  }

  /** Gets the map of entitlements -> offerings -> products
    @returns {Promise<Map<String, Map<String, Product>>>} Promise of entitlements structure
  */
  static getEntitlements() {
    return RNPurchases.getEntitlements();
  }

  /** Fetch the product info.
      @param {[String]} productIdentifiers Array of product identifiers
      @returns {Promise<Array>} A promise of product arrays
  */
  static getProducts(productIdentifiers, type = "subs") {
    return RNPurchases.getProductInfo(productIdentifiers, type);
  }

  /** Make a purchase
      @param {String} productIdentifier The product identifier of the product you want to purchase.
      @param {Array<String>} oldSKUs Optional array of skus you wish to upgrade from. 
      @param {String} type Optional type of product, can be inapp or subs. Subs by default
      @returns {Promise<Object>} A promise of purchaser info object and a boolean indicating if user cancelled
  */
  static makePurchase(productIdentifier, oldSKUs = [], type = "subs") {
    return new Promise((resolve, reject) => {
      eventEmitter.addListener(
        "Purchases-PurchaseCompleted",
        ({ productIdentifier, purchaserInfo, error }) => {
          if (error) {
            const { code, domain, message } = error;
            const userCancelledDomainCodes = {
              1: "Play Billing",
              2: "SKErrorDomain"
            };
            reject({
              code,
              domain,
              message,
              userCancelled: userCancelledDomainCodes[code] === domain
            });
          } else {
            resolve({
              productIdentifier,
              purchaserInfo
            });
          }
        }
      );
      RNPurchases.makePurchase(productIdentifier, oldSKUs, type);
    })
  }

  /** Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases. 
      @returns {Promise<Object>} A promise of a purchaser info object
  */
  static restoreTransactions() {
    return RNPurchases.restoreTransactions();
  }

  /** Get the appUserID
    @returns {Promise<String>} The app user id in a promise
  */
  static getAppUserID() {
    return RNPurchases.getAppUserID();
  }

  /** This function will alias two appUserIDs together.
      @param {String} newAppUserID The new appUserID that should be linked to the currently identified appUserID
      @returns {Promise<Object>} A promise of a purchaser info object
   * */
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
   */
  static reset() {
    return RNPurchases.reset();
  }

  /**
   * Enables/Disables debugs logs
   * @param {Boolean} enabled Enable or not debug logs
   */
  static debugLogsEnabled(enabled) {
    return RNPurchases.setDebugLogsEnabled(enabled);
  }

  /**
   * Gets purchaser info
   * @param {Promise<Object>} A promise of a purchaser info object
   */
  static getPurchaserInfo() {
    return RNPurchases.getPurchaserInfo();
  }
}
