// @ts-ignore
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const { RNPurchases } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPurchases);

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

export enum PRORATION_MODE {
  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY = 0,

  /**
   * Replacement takes effect immediately, and the remaining time will be
   * prorated and credited to the user. This is the current default behavior.
   */
  IMMEDIATE_WITH_TIME_PRORATION = 1,

  /**
   * Replacement takes effect immediately, and the billing cycle remains the
   * same. The price for the remaining period will be charged. This option is
   * only available for subscription upgrade.
   */
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,

  /**
   * Replacement takes effect immediately, and the new price will be charged on
   * next recurrence time. The billing cycle stays the same.
   */
  IMMEDIATE_WITHOUT_PRORATION = 3,

  /**
   * Replacement takes effect when the old plan expires, and the new price will
   * be charged at the same time.
   */
  DEFERRED = 4,
}

export enum PACKAGE_TYPE {

  /**
   * A package that was defined with a custom identifier.
   */
  UNKNOWN = "UNKNOWN",

  /**
   * A package that was defined with a custom identifier.
   */
  CUSTOM = "CUSTOM",

  /**
   * A package configured with the predefined lifetime identifier.
   */
  LIFETIME = "LIFETIME",

  /**
   * A package configured with the predefined annual identifier.
   */
  ANNUAL = "ANNUAL",

  /**
   * A package configured with the predefined six month identifier.
   */
  SIX_MONTH = "SIX_MONTH",

  /**
   * A package configured with the predefined three month identifier.
   */
  THREE_MONTH = "THREE_MONTH",

  /**
   * A package configured with the predefined two month identifier.
   */
  TWO_MONTH = "TWO_MONTH",

  /**
   * A package configured with the predefined monthly identifier.
   */
  MONTHLY = "MONTHLY",

  /**
   * A package configured with the predefined weekly identifier.
   */
  WEEKLY = "WEEKLY",
}

export enum INTRO_ELIGIBILITY_STATUS {
  /**
   * RevenueCat doesn't have enough information to determine eligibility.
   */
  INTRO_ELIGIBILITY_STATUS_UNKNOWN = 0,
  /**
   * The user is not eligible for a free trial or intro pricing for this product.
   */
  INTRO_ELIGIBILITY_STATUS_INELIGIBLE,
  /**
   * The user is eligible for a free trial or intro pricing for this product.
   */
  INTRO_ELIGIBILITY_STATUS_ELIGIBLE
}

/**
 * The EntitlementInfo object gives you access to all of the information about the status of a user entitlement.
 */
export interface PurchasesEntitlementInfo {
  /**
   * The entitlement identifier configured in the RevenueCat dashboard
   */
  readonly identifier: string;
  /**
   * True if the user has access to this entitlement
   */
  readonly isActive: boolean;
  /**
   * True if the underlying subscription is set to renew at the end of the billing period (expirationDate).
   * Will always be True if entitlement is for lifetime access.
   */
  readonly willRenew: boolean;
  /**
   * The last period type this entitlement was in. Either: NORMAL, INTRO, TRIAL.
   */
  readonly periodType: string;
  /**
   * The latest purchase or renewal date for the entitlement.
   */
  readonly latestPurchaseDate: string;
  /**
   * The first date this entitlement was purchased.
   */
  readonly originalPurchaseDate: string;
  /**
   * The expiration date for the entitlement, can be `null` for lifetime access. If the `periodType` is `trial`,
   * this is the trial expiration date.
   */
  readonly expirationDate: string | null;
  /**
   * The store where this entitlement was unlocked from. Either: appStore, macAppStore, playStore, stripe,
   * promotional, unknownStore
   */
  readonly store: string;
  /**
   * The product identifier that unlocked this entitlement
   */
  readonly productIdentifier: string;
  /**
   * False if this entitlement is unlocked via a production purchase
   */
  readonly isSandbox: boolean;
  /**
   * The date an unsubscribe was detected. Can be `null`.
   *
   * @note: Entitlement may still be active even if user has unsubscribed. Check the `isActive` property.
   */
  readonly unsubscribeDetectedAt: string | null;
  /**
   * The date a billing issue was detected. Can be `null` if there is no billing issue or an issue has been resolved
   *
   * @note: Entitlement may still be active even if there is a billing issue. Check the `isActive` property.
   */
  readonly billingIssueDetectedAt: string | null;
}

/**
 * Contains all the entitlements associated to the user.
 */
export interface PurchasesEntitlementInfos {
  /**
   * Map of all EntitlementInfo (`PurchasesEntitlementInfo`) objects (active and inactive) keyed by entitlement identifier.
   */
  readonly all: { [key: string]: PurchasesEntitlementInfo };
  /**
   * Map of active EntitlementInfo (`PurchasesEntitlementInfo`) objects keyed by entitlement identifier.
   */
  readonly active: { [key: string]: PurchasesEntitlementInfo };
}

export interface PurchaserInfo {
  /**
   * Entitlements attached to this purchaser info
   */
  readonly entitlements: PurchasesEntitlementInfos;
  /**
   * Set of active subscription skus
   */
  readonly activeSubscriptions: string[];
  /**
   * Set of purchased skus, active and inactive
   */
  readonly allPurchasedProductIdentifiers: string[];
  /**
   * The latest expiration date of all purchased skus
   */
  readonly latestExpirationDate: string | null;
  /**
   * The date this user was first seen in RevenueCat.
   */
  readonly firstSeen: string;
  /**
   * The original App User Id recorded for this user.
   */
  readonly originalAppUserId: string;
  /**
   * Date when this info was requested
   */
  readonly requestDate: string;
  /**
   * Map of skus to expiration dates
   */
  readonly allExpirationDates: { [key: string]: string | null };
  /**
   * Map of skus to purchase dates
   */
  readonly allPurchaseDates: { [key: string]: string | null };
  /**
   * Returns the version number for the version of the application when the
   * user bought the app. Use this for grandfathering users when migrating
   * to subscriptions.
   *
   * This corresponds to the value of CFBundleVersion (in iOS) in the
   * Info.plist file when the purchase was originally made. This is always null
   * in Android
   */
  readonly originalApplicationVersion: string | null;
}

export interface PurchasesProduct {
  /**
   * Product Id.
   */
  readonly identifier: string;
  /**
   * Description of the product.
   */
  readonly description: string;
  /**
   * Title of the product.
   */
  readonly title: string;
  /**
   * Price of the product in the local currency.
   */
  readonly price: number;
  /**
   * Formatted price of the item, including its currency sign.
   */
  readonly price_string: string;
  /**
   * Currency code for price and original price.
   */
  readonly currency_code: string;
  /**
   * Introductory price of a subscription in the local currency.
   */
  readonly intro_price: number | null;
  /**
   * Formatted introductory price of a subscription, including its currency sign, such as €3.99.
   */
  readonly intro_price_string: string | null;
  /**
   * Billing period of the introductory price, specified in ISO 8601 format.
   */
  readonly intro_price_period: string | null;
  /**
   * Number of subscription billing periods for which the user will be given the introductory price, such as 3.
   */
  readonly intro_price_cycles: number | null;
  /**
   * Unit for the billing period of the introductory price, can be DAY, WEEK, MONTH or YEAR.
   */
  readonly intro_price_period_unit: string | null;
  /**
   * Number of units for the billing period of the introductory price.
   */
  readonly intro_price_period_number_of_units: number | null;
}

/**
 * Contains information about the product available for the user to purchase.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesPackage {
  /**
   * Unique identifier for this package. Can be one a predefined package type or a custom one.
   */
  readonly identifier: string;
  /**
   * Package type for the product. Will be one of [PACKAGE_TYPE].
   */
  readonly packageType: PACKAGE_TYPE;
  /**
   * Product assigned to this package.
   */
  readonly product: PurchasesProduct;
  /**
   * Offering this package belongs to.
   */
  readonly offeringIdentifier: string;
}

/**
 * An offering is a collection of Packages (`PurchasesPackage`) available for the user to purchase.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesOffering {
  /**
   * Unique identifier defined in RevenueCat dashboard.
   */
  readonly identifier: string;
  /**
   * Offering description defined in RevenueCat dashboard.
   */
  readonly serverDescription: string;
  /**
   * Array of `Package` objects available for purchase.
   */
  readonly availablePackages: PurchasesPackage[];
  /**
   * Lifetime package type configured in the RevenueCat dashboard, if available.
   */
  readonly lifetime: PurchasesPackage | null;
  /**
   * Annual package type configured in the RevenueCat dashboard, if available.
   */
  readonly annual: PurchasesPackage | null;
  /**
   * Six month package type configured in the RevenueCat dashboard, if available.
   */
  readonly sixMonth: PurchasesPackage | null;
  /**
   * Three month package type configured in the RevenueCat dashboard, if available.
   */
  readonly threeMonth: PurchasesPackage | null;
  /**
   * Two month package type configured in the RevenueCat dashboard, if available.
   */
  readonly twoMonth: PurchasesPackage | null;
  /**
   * Monthly package type configured in the RevenueCat dashboard, if available.
   */
  readonly monthly: PurchasesPackage | null;
  /**
   * Weekly package type configured in the RevenueCat dashboard, if available.
   */
  readonly weekly: PurchasesPackage | null;
}

/**
 * Contains all the offerings configured in RevenueCat dashboard.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesOfferings {
  /**
   * Map of all Offerings [PurchasesOffering] objects keyed by their identifier.
   */
  readonly all: { [key: string]: PurchasesOffering };
  /**
   * Current offering configured in the RevenueCat dashboard.
   */
  readonly current: PurchasesOffering | null;
}

export interface PurchasesError {
  code: number;
  message: string;
  readableErrorCode: string;
  underlyingErrorMessage: string;
}

/**
 * Holds the information used when upgrading from another sku. For Android use only.
 */
export interface UpgradeInfo {
  /**
   * The oldSKU to upgrade from.
   */
  readonly oldSKU: string;
  /**
   * The [PRORATION_MODE] to use when upgrading the given oldSKU.
   */
  readonly prorationMode?: PRORATION_MODE;
}

/**
 * Holds the introductory price status
 */
export interface IntroEligibility {
  /**
   * The introductory price eligibility status
   */
  readonly status: INTRO_ELIGIBILITY_STATUS;
  /**
   * Description of the status
   */
  readonly description: string;
}

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

export const isUTCDateStringFuture = (dateString: string) => {
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
   * Sets up Purchases with your API key and an app user id.
   * @param {string} apiKey RevenueCat API Key. Needs to be a String
   * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
   * @param {Boolean?} observerMode An optional boolean. Set this to TRUE if you have your own IAP implementation and want to use only RevenueCat's backend. Default is FALSE.
   * @returns {Promise<void>} Returns when setup completes
   */
  public static setup(
    apiKey: string,
    appUserID?: string | null,
    observerMode: boolean = false
  ) {
    if (typeof appUserID !== "undefined" && typeof appUserID !== "string") {
      throw new Error("appUserID needs to be a string");
    }
    return RNPurchases.setupPurchases(apiKey, appUserID, observerMode);
  }

  /**
   * @param {Boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous, this is true by default if you didn't pass an appUserID
   * If an user tries to purchase a product that is active on the current app store account, we will treat it as a restore and alias
   * the new ID with the previous id.
   */
  public static setAllowSharingStoreAccount(allowSharing: boolean) {
    RNPurchases.setAllowSharingStoreAccount(allowSharing);
  }

  /**
   * @param {Boolean} finishTransactions Set finishTransactions to false if you aren't using Purchases SDK to make the purchase
   */
  public static setFinishTransactions(finishTransactions: boolean) {
    RNPurchases.setFinishTransactions(finishTransactions);
  }

  /**
   * Sets a function to be called on updated purchaser info
   * @param {PurchaserInfoUpdateListener} purchaserInfoUpdateListener PurchaserInfo update listener
   */
  public static addPurchaserInfoUpdateListener(
    purchaserInfoUpdateListener: PurchaserInfoUpdateListener
  ) {
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
  ) {
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
  ) {
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
  ) {
    if (shouldPurchasePromoProductListeners.includes(listenerToRemove)) {
      shouldPurchasePromoProductListeners = shouldPurchasePromoProductListeners.filter(
        listener => listenerToRemove !== listener
      );
      return true;
    }
    return false;
  }

  /**
   * Add a dict of attribution information
   * @param {Dict} data Attribution data from AppsFlyer, Adjust, or Branch
   * @param {ATTRIBUTION_NETWORKS} network Which network, see Purchases.ATTRIBUTION_NETWORKS
   * @param {String?} networkUserId An optional unique id for identifying the user. Needs to be a string.
   */
  public static addAttributionData(
    data: { [key: string]: any },
    network: ATTRIBUTION_NETWORK,
    networkUserId?: string
  ) {
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
   * @deprecated Use purchaseProduct instead.
   *
   * @param {String} productIdentifier The product identifier of the product you want to purchase
   * @param {String?} oldSKU Optional sku you wish to upgrade from.
   * @param {String} type Optional type of product, can be inapp or subs. Subs by default
   * @returns {Promise<{ productIdentifier: String, purchaserInfo: PurchaserInfo }>} A promise of an object containing
   * a purchaser info object and a product identifier. Rejections return an error code,
   * a boolean indicating if the user cancelled the purchase, and an object with more information.
   */
  public static makePurchase(
    productIdentifier: string,
    oldSKU?: string | null,
    type: PURCHASE_TYPE = PURCHASE_TYPE.SUBS
  ): MakePurchasePromise {
    if (Array.isArray(oldSKU)) {
      throw new Error("Calling a deprecated method!");
    }
    if (oldSKU !== undefined && oldSKU !== null) {
      return Purchases.purchaseProduct(productIdentifier, { oldSKU }, type).catch(
        (error: any) => {
          error.userCancelled = error.code === "1";
          throw error;
        }
      );
    } else {
      return Purchases.purchaseProduct(productIdentifier, null, type).catch(
        (error: any) => {
          error.userCancelled = error.code === "1";
          throw error;
        }
      );
    }
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
      type
    ).catch((error: any) => {
      error.userCancelled = error.code === "1";
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
      upgradeInfo
    ).catch((error: any) => {
      error.userCancelled = error.code === "1";
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
   * @returns {Promise<string>} The app user id in a promise
   */
  public static getAppUserID(): Promise<string> {
    return RNPurchases.getAppUserID();
  }

  /**
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
   * Resets the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
   * @returns {Promise<PurchaserInfo>} A promise of a purchaser info object. Rejections return an error code, and a userInfo object with more information.
   */
  public static reset(): Promise<PurchaserInfo> {
    return RNPurchases.reset();
  }

  /**
   * Enables/Disables debugs logs
   * @param {Boolean} enabled Enable or not debug logs
   */
  public static setDebugLogsEnabled(enabled: boolean): Promise<void> {
    return RNPurchases.setDebugLogsEnabled(enabled);
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
  public static syncPurchases() {
    if (Platform.OS === "android") {
      RNPurchases.syncPurchases();
    }
  }

  /**
   * Enable automatic collection of Apple Search Ad attribution. Disabled by default
   * @param {Boolean} enabled Enable or not automatic apple search ads attribution collection
   */
  public static setAutomaticAppleSearchAdsAttributionCollection(
    enabled: boolean
  ) {
    if (Platform.OS === "ios") {
      RNPurchases.setAutomaticAppleSearchAdsAttributionCollection(enabled);
    }
  }

  /**
   * @returns {Promise<boolean>} If the `appUserID` has been generated by RevenueCat or not.
   */
  public static isAnonymous(): Promise<boolean> {
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
   *  @returns { [productId: string]: IntroEligibility } A map of IntroEligility per productId
   */
  public static checkTrialOrIntroductoryPriceEligibility(
    productIdentifiers: string[]
  ): Promise<{ [productId: string]: IntroEligibility }> {
    return RNPurchases.checkTrialOrIntroductoryPriceEligibility(productIdentifiers);
  }
}
