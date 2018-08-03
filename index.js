import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPurchases } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPurchases);

var purchaseListener = undefined;
var purchaserInfoUpdateListener = undefined;
var restoreTransactionsListener = undefined;

eventEmitter.addListener('Purchases-PurchaseCompleted', ({productIdentifier, purchaserInfo, error}) => {
  if (purchaseListener) {
    // Process the error
    if (error) {
      let {domain, code} = error;
      if ((domain == "SKErrorDomain" && code == 2) || 
          (domain == "Play Billing" && code == 1)) {
        error.userCancelled = true
      }
    }

    purchaseListener(productIdentifier, purchaserInfo, error);
  }
});

eventEmitter.addListener('Purchases-PurchaserInfoUpdated', ({purchaserInfo, error}) => {
  if (purchaserInfoUpdateListener) {
    // Process the error
    purchaserInfoUpdateListener(purchaserInfo, error);
  }
});

eventEmitter.addListener('Purchases-RestoredTransactions', ({purchaserInfo, error}) => {
  if (restoreTransactionsListener) {
    restoreTransactionsListener(purchaserInfo, error);
  }
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
  static setIsUsingAnonymousID(isUsingAnonymousID) {
    RNPurchases.setIsUsingAnonymousID(isUsingAnonymousID);
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
    purchaseListener = purchaseListener_;
  }

  /** @callback RestoreTransactionsListener
      @param {Object} purchaserInfo Object containing info for the purchaser
      @param {Object} error Error object
  */
  
  /** Sets a function to be called on purchase complete or fail
      @param {RestoreTransactionsListener} restoreTransactionsListener_ Restore transactions listener 
  */
  static addRestoreTransactionsListener(restoreTransactionsListener_) {
    restoreTransactionsListener = restoreTransactionsListener_;
  }

  /** @callback PurchaserInfoListener
      @param {Object} purchaserInfo Object containing info for the purchaser
      @param {Object} error Error object
  */
  
  /** Sets a function to be called on updated purchaser info
      @param {PurchaserInfoListener} purchaserInfoUpdatedListener_ PurchaserInfo update listener 
  */
  static addPurchaserInfoUpdatedListener(purchaserInfoUpdatedListener_) {
    purchaserInfoUpdatedListener = purchaserInfoUpdatedListener_;
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
};
