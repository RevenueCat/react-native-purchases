import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPurchases } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPurchases);

var purchaseListener = undefined;
var purchaserInfoUpdateListener = undefined;
var restoreTransactionsListener = undefined;

eventEmitter.addListener('Purchases-PurchaseCompleted', ({product, purchaserInfo, error}) => {
  if (purchaseListener) {
    // Process the error
    purchaseListener(product, error);
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
    restoreTransactions(purchaserInfo, error);
  }
})

export default class Purchases {
  /** @callback PurchasesListener
      @param {String} productIdentifier for the purchase, null if just a purchaser info update
      @param {Object} purchaserInfo will be non-null if the purchases was successful
      @param {Object} error Will be non-null if purchase failed to complete for some reason
      @param {Boolean} isRestore Will be true if this call was triggered by a restoreTransactions call
  */

  /** Sets up Purchases with your API key and an app user id. If a user logs out and you have a new appUserId, call it again.
      @param {String} apiKey RevenueCat API Key
      @param {String?} appUserID A unique id for identifying the user
      @param {PurchasesListener} listener_ A function that is called on purchase or purchaser info update.

      @returns {Promise<void>} Returns when setup complete
  */
  static setup(apiKey, appUserID) {
    return RNPurchases.setupPurchases(apiKey, appUserID);
  }

  /** @callback PurchaseListener
      @param {Object} product An object containing information about the product
      @param {Object} error Error object
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
  static addPurchaserInfoUpdated(purchaserInfoUpdatedListener_) {
    purchaserInfoUpdatedListener = purchaserInfoUpdatedListener_;
  }

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
