import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPurchases } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPurchases);

var listener = () => {}

eventEmitter.addListener('Purchases-PurchaseCompleted', ({productIdentifier, purchaserInfo, error}) => {
  if (listener) {

    if (error) {
      console.log(error);
      error.userCancelled = (error.domain == "SKErrorDomain" && error.code == 2)
    }

    listener(productIdentifier, purchaserInfo, error);
  } else {
    console.log("Purchase completed but no listener set.");
  }
});

eventEmitter.addListener('Purchases-PurchaserInfoUpdated', ({purchaserInfo}) => {
  if (listener) {
    listener(null, purchaserInfo, null);
  } else {
    console.log("Purchaser info received but no listener set.");
  }
});

export default class Purchases {
  /** @callback PurchasesListener
      @param {String} productIdentifier for the purchase, null if just an info update
      @param {Object} purchaserInfo will be non-null if the purchases was successful
      @param {Object} error Will be non-null if purchase failed to complete for some reason.
  */

  /** Sets up Purchases with your API key and an app user id. If a user logs out and you have a new appUserId, call it again.
      @param {String} apiKey RevenueCat API Key
      @param {String?} appUserID A unique id for identifying the user
  */
  static setup(apiKey, appUserID, listener_) {
    listener = listener_;
    RNPurchases.setupPurchases(apiKey, appUserID);
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
  static makePurchase(productIdentifier, type="subs") {
    RNPurchases.makePurchase(productIdentifier, type);
  }

  /** Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases. 
    @returns {Promise<Object>} A promise of a purchaser info object
  */
  static restoreTransactionsForAppStoreAccount() {
    return RNPurchases.restoreTransactionsForAppStoreAccount();
  }

  static getUpdatedPurchaserInfo() {
    return RNPurchases.getUpdatedPurchaserInfo();
  }
};
