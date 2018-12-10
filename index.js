import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPurchases } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPurchases);

let purchaseListener = [];
let purchaserInfoUpdateListener = [];
let restoreTransactionsListener = [];

export const isUTCDateStringFuture = dateString => {
  const date = new Date(dateString);
  const dateUtcMillis = date.valueOf();
  const now = new Date;
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
}

eventEmitter.addListener('Purchases-PurchaseCompleted', ({productIdentifier, purchaserInfo, error}) => {
  if (error) {
    const {domain, code} = error;
    
    const userCancelledDomainCodes = {
      1: 'Play Billing',
      2: 'SKErrorDomain'
    };

    if (userCancelledDomainCodes[code] === domain) {
      error.userCancelled = true;
    }

  }

  purchaseListener.forEach(listener => listener(productIdentifier, purchaserInfo, error));
});

eventEmitter.addListener('Purchases-PurchaserInfoUpdated', ({purchaserInfo, error}) => {
  purchaserInfoUpdateListener.forEach(listener => listener(purchaserInfo, error));
});

eventEmitter.addListener('Purchases-RestoredTransactions', ({purchaserInfo, error}) => {
  restoreTransactionsListener.forEach(listener => listener(purchaserInfo, error));
})

export default class Purchases {
  /** Sets up Purchases with your API key and an app user id. If a user logs out and you have a new appUserId, call it again.
      @param {String} apiKey RevenueCat API Key
      @param {String?} appUserID A unique id for identifying the user
      @param {PurchasesListener} listener_ A function that is called on purchase or purchaser info update.

      @returns {Promise<void>} Returns when setup complete
  */
  static setup(apiKey, appUserID) {
    return RNPurchases.setupPurchases(apiKey, appUserID);
  }

  /** Set this to true if you are passing in an appUserID but it is anonymous, this is true by default if you didn't pass an appUserID
   If a user tries to purchase a product that is active on the current app store account, we will treat it as a restore and alias
   the new ID with the previous id.
  */
  static setAllowSharingStoreAccount(allowSharing) {
    RNPurchases.setAllowSharingStoreAccount(allowSharing);
  }

  /** @callback PurchaseListener
      @param {String} productIdentifier Product id of the purchased product
      @param {Object} purchaserInfo An object containing information about the product
      @param {Object} error Error object, if error.userCancelled is truthy, the user cancelled normally
  */

  /** Sets a function to be called on purchase complete or fail
      @param {PurchaseListener} restoreTransactionsListener_ Purchase listener 
  */
  static addPurchaseListener(purchaseListener_) {
    purchaseListener.push(purchaseListener_);
  }

  /** @callback RestoreTransactionsListener
      @param {Object} purchaserInfo Object containing info for the purchaser
      @param {Object} error Error object
  */
  
  /** Sets a function to be called on purchase complete or fail
      @param {RestoreTransactionsListener} restoreTransactionsListener_ Restore transactions listener 
  */
  static addRestoreTransactionsListener(restoreTransactionsListener_) {
    restoreTransactionsListener.push(restoreTransactionsListener_);
  }

  /** @callback PurchaserInfoListener
      @param {Object} purchaserInfo Object containing info for the purchaser
      @param {Object} error Error object
  */
  
  /** Sets a function to be called on updated purchaser info
      @param {PurchaserInfoListener} purchaserInfoUpdateListener_ PurchaserInfo update listener 
  */
  static addPurchaserInfoUpdateListener(purchaserInfoUpdateListener_) {
    purchaserInfoUpdateListener.push(purchaserInfoUpdateListener_);
  }

  static ATTRIBUTION_NETWORKS = {
    APPLE_SEARCH_ADS: 0,
    ADJUST: 1,
    APPSFLYER: 2,
    BRANCH: 3
  }

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
  static getProducts(productIdentifiers, type="subs") {
    return RNPurchases.getProductInfo(productIdentifiers, type);
  }

  /** Make a purchase
      @param {String} productIdentifier The product identifier of the product you want to purchase.
  */
  static makePurchase(productIdentifier, oldSKUs=[], type="subs") {
    RNPurchases.makePurchase(productIdentifier, oldSKUs, type);
  }

  /** Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases. 
    @returns {Promise<Object>} A promise of a purchaser info object
  */
  static restoreTransactions() {
    RNPurchases.restoreTransactions();
  }

  /** Get the appUserID
    @returns {Promise<String>} The app user id in a promise
  */
  static getAppUserID() {
    return RNPurchases.getAppUserID();
  }

  /** This function will alias two appUserIDs together.
   * @param alias The new appUserID that should be linked to the currently identified appUserID
   * */
  static createAlias(newAppUserID) {
    return RNPurchases.createAlias(newAppUserID);
  }

  /**
   * This function will identify the current user with an appUserID. Typically this would be used after a logout to identify a new user without calling configure
   * @param appUserID The appUserID that should be linked to the currently user
   */
  static identify(newAppUserID) {
    return RNPurchases.identify(newAppUserID);
  }

  /**
   * Resets the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
   */
  static reset() {
    return RNPurchases.reset();
  }

};
