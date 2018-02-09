import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPurchases } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPurchases);

var handlers = {
  purchaseHandler: null,
  restoreHandler: null,
  purchaseInfoHandler: null
}

eventEmitter.addListener('Purchases-PurchaseCompleted', ({productIdentifier, purchaserInfo, error}) => {
  if (handlers.purchaseHandler) {
    handlers.purchaseHandler(productIdentifier, purchaserInfo, error);
  } else {
    console.log("Purchase completed but no handler set.");
  }
});

eventEmitter.addListener('Purchases-RestoreCompleted', ({productIdentifier, purchaserInfo, error}) => {
  if (handlers.restoreHandler) {
    handlers.restoreHandler(productIdentifier, purchaserInfo, error);
  } else {
    console.log("Restore completed but no handler set.");
  }
});

eventEmitter.addListener('Purchases-PurchaserInfoUpdated', ({purchaserInfo}) => {
  if (handlers.purchaserInfoHandler) {
    handlers.purchaserInfoHandler(purchaserInfo);
  } else {
    console.log("Purchaser info received but no handler set.");
  }
});

export default class Purchases {
  /** Sets up Purchases with your API key and an app user id. If a user logs out and you have a new appUserId, call it again.
      @param {String} apiKey RevenueCat API Key
      @param {String} appUserID A unique id for identifying the user
  */
  static setup(apiKey, appUserID) {
    RNPurchases.setupPurchases(apiKey, appUserID);
  }

  /** Fetch the product info.
      @param {[String]} productIdentifiers Array of product identifiers
      @returns {Promise<Array>} A promise of product arrays
  */
  static getProducts(productIdentifiers) {
    return RNPurchases.getProductInfo(productIdentifiers);
  }

  /** Make a purchase
      @param {String} productIdentifier The product identifier of the product you want to purchase.
  */
  static makePurchase(productIdentifier) {
    RNPurchases.makePurchase(productIdentifier);
  }

  /** Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases. */
  static restoreTransactions() {
    RNPurchases.restoreTransactions();
  }

  /** @callback PurchaseHandler
      @param {String} productIdentifier for the purchase
      @param {Object} purchaserInfo will be non-null if the purchases was successful
      @param {Object} error Will be non-null if purchase failed to complete for some reason.
  */

  /** Set the purchase handler
    @param {PurchaseHandler} purchaseHandler Method to be called when a purchase completes or fails
  */
  static setPurchaseHandler(purchaseHandler) {
    handlers.purchaseHandler = purchaseHandler;
  }

  /** @callback RestoreHandler
      @param {Object} error Will be non-null if restore failed
  */

  /** Set the restore handler
      @param {RestoreHandler} restoreHandler Called when a restore completes or fails
  */
  static setRestoreHandler(restoreHandler) {
    handlers.restoreHandler = restoreHandler;
  }

  /** @callback PurchaserInfoHandler
      @param {Object} purchaseInfo All the subscription info for a user
  */

  /** Set purchaser info handler. Called when new purchaser info is available.
      @param {PurchaserInfoHandler} handler 
  */
  static setPurchaserInfoHandler(purchaserInfoHandler) {
    handlers.purchaserInfoHandler = purchaserInfoHandler;
  }
};
