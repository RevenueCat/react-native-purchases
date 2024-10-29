import { PURCHASES_ERROR_CODE, UninitializedPurchasesError, UnsupportedPlatformError, CustomerInfo, PurchasesEntitlementInfo, PRORATION_MODE, PACKAGE_TYPE, INTRO_ELIGIBILITY_STATUS, PurchasesOfferings, PurchasesStoreProduct, UpgradeInfo, PurchasesPromotionalOffer, PurchasesPackage, IntroEligibility, PurchasesStoreProductDiscount, SubscriptionOption, PRODUCT_CATEGORY, GoogleProductChangeInfo, PURCHASE_TYPE, BILLING_FEATURE, REFUND_REQUEST_STATUS, LOG_LEVEL, PurchasesConfiguration, CustomerInfoUpdateListener, ShouldPurchasePromoProductListener, MakePurchaseResult, LogHandler, LogInResult, IN_APP_MESSAGE_TYPE, ENTITLEMENT_VERIFICATION_MODE, VERIFICATION_RESULT, STOREKIT_VERSION, PurchasesStoreTransaction, PurchasesOffering, PURCHASES_ARE_COMPLETED_BY_TYPE } from "@revenuecat/purchases-typescript-internal";
export { PURCHASE_TYPE, PurchasesAreCompletedBy, PurchasesAreCompletedByMyApp, PURCHASES_ARE_COMPLETED_BY_TYPE, BILLING_FEATURE, REFUND_REQUEST_STATUS, LOG_LEVEL, STOREKIT_VERSION, PurchasesConfiguration, CustomerInfoUpdateListener, ShouldPurchasePromoProductListener, MakePurchaseResult, LogHandler, LogInResult, } from "@revenuecat/purchases-typescript-internal";
export default class Purchases {
    /**
     * Supported SKU types.
     * @readonly
     * @enum {string}
     * @deprecated, use PRODUCT_CATEGORY
     */
    static PURCHASE_TYPE: typeof PURCHASE_TYPE;
    /**
     * Supported product categories.
     * @readonly
     * @enum {string}
     */
    static PRODUCT_CATEGORY: typeof PRODUCT_CATEGORY;
    /**
     * Enum for billing features.
     * Currently, these are only relevant for Google Play Android users:
     * https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
     * @readonly
     * @enum {string}
     */
    static BILLING_FEATURE: typeof BILLING_FEATURE;
    /**
     * Enum with possible return states for beginning refund request.
     * @readonly
     * @enum {string}
     */
    static REFUND_REQUEST_STATUS: typeof REFUND_REQUEST_STATUS;
    /**
     * Replace SKU's ProrationMode.
     * @readonly
     * @enum {number}
     */
    static PRORATION_MODE: typeof PRORATION_MODE;
    /**
     * Enumeration of all possible Package types.
     * @readonly
     * @enum {string}
     */
    static PACKAGE_TYPE: typeof PACKAGE_TYPE;
    /**
     * Enum of different possible states for intro price eligibility status.
     * @readonly
     * @enum {number}
     */
    static INTRO_ELIGIBILITY_STATUS: typeof INTRO_ELIGIBILITY_STATUS;
    /**
     * Enum of all error codes the SDK produces.
     * @readonly
     * @enum {string}
     */
    static PURCHASES_ERROR_CODE: typeof PURCHASES_ERROR_CODE;
    /**
     * List of valid log levels.
     * @readonly
     * @enum {string}
     */
    static LOG_LEVEL: typeof LOG_LEVEL;
    /**
     * List of valid in app message types.
     * @readonly
     * @enum {number}
     */
    static IN_APP_MESSAGE_TYPE: typeof IN_APP_MESSAGE_TYPE;
    /**
     * Enum of entitlement verification modes.
     * @readonly
     * @enum {string}
     */
    static ENTITLEMENT_VERIFICATION_MODE: typeof ENTITLEMENT_VERIFICATION_MODE;
    /**
     * The result of the verification process.
     * @readonly
     * @enum {string}
     */
    static VERIFICATION_RESULT: typeof VERIFICATION_RESULT;
    /**
     * Enum of StoreKit version.
     * @readonly
     * @enum {string}
     */
    static STOREKIT_VERSION: typeof STOREKIT_VERSION;
    /**
     * Enum of PurchasesAreCompletedByType.
     * @readonly
     * @enum {string}
     */
    static PURCHASES_ARE_COMPLETED_BY_TYPE: typeof PURCHASES_ARE_COMPLETED_BY_TYPE;
    /**
     * @internal
     */
    static UninitializedPurchasesError: typeof UninitializedPurchasesError;
    /**
     * @internal
     */
    static UnsupportedPlatformError: typeof UnsupportedPlatformError;
    /**
     * Sets up Purchases with your API key and an app user id.
     * @param {String} apiKey RevenueCat API Key. Needs to be a String
     * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
     * @param {PurchasesAreCompletedBy} [purchasesAreCompletedBy=PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT] Set this to an instance of PurchasesAreCompletedByMyApp if you have your own IAP implementation and want to use only RevenueCat's backend. Default is PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT.
     * @param {STOREKIT_VERSION} [storeKitVersion=DEFAULT] iOS-only. Defaults to STOREKIT_2. StoreKit 2 is only available on iOS 16+. StoreKit 1 will be used for previous iOS versions regardless of this setting.
     * @param {ENTITLEMENT_VERIFICATION_MODE} [entitlementVerificationMode=ENTITLEMENT_VERIFICATION_MODE.DISABLED] Sets the entitlement verifciation mode to use. For more details, check https://rev.cat/trusted-entitlements
     * @param {boolean} [useAmazon=false] An optional boolean. Android-only. Set this to TRUE to enable Amazon on compatible devices.
     * @param {String?} userDefaultsSuiteName An optional string. iOS-only, will be ignored for Android.
     * Set this if you would like the RevenueCat SDK to store its preferences in a different NSUserDefaults suite, otherwise it will use standardUserDefaults.
     * Default is null, which will make the SDK use standardUserDefaults.
     * @param {boolean} [pendingTransactionsForPrepaidPlansEnabled=false] An optional boolean. Android-only. Set this to TRUE to enable pending transactions for prepaid subscriptions in Google Play.
     *
     * @warning If you use purchasesAreCompletedBy=PurchasesAreCompletedByMyApp, you must also provide a value for storeKitVersion.
     */
    static configure({ apiKey, appUserID, purchasesAreCompletedBy, userDefaultsSuiteName, storeKitVersion, useAmazon, shouldShowInAppMessagesAutomatically, entitlementVerificationMode, pendingTransactionsForPrepaidPlansEnabled, }: PurchasesConfiguration): void;
    /**
     * @deprecated, configure behavior through the RevenueCat dashboard (app.revenuecat.com) instead.
     * If an user tries to purchase a product that is active on the current app store account,
     * we will treat it as a restore and alias the new ID with the previous id.
     * If you have configured the Legacy restore behavior in the RevenueCat dashboard
     * and are currently setting this to true, keep this setting active.
     * @param {boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous,
     * this is true by default if you didn't pass an appUserID
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    static setAllowSharingStoreAccount(allowSharing: boolean): Promise<void>;
    /**
     * iOS only.
     * @param {boolean} simulatesAskToBuyInSandbox Set this property to true *only* when testing the ask-to-buy / SCA
     * purchases flow. More information: http://errors.rev.cat/ask-to-buy
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    static setSimulatesAskToBuyInSandbox(simulatesAskToBuyInSandbox: boolean): Promise<void>;
    /**
     * Sets a function to be called on updated customer info
     * @param {CustomerInfoUpdateListener} customerInfoUpdateListener CustomerInfo update listener
     */
    static addCustomerInfoUpdateListener(customerInfoUpdateListener: CustomerInfoUpdateListener): void;
    /**
     * Removes a given CustomerInfoUpdateListener
     * @param {CustomerInfoUpdateListener} listenerToRemove CustomerInfoUpdateListener reference of the listener to remove
     * @returns {boolean} True if listener was removed, false otherwise
     */
    static removeCustomerInfoUpdateListener(listenerToRemove: CustomerInfoUpdateListener): boolean;
    /**
     * Sets a function to be called on purchases initiated on the Apple App Store. This is only used in iOS.
     * @param {ShouldPurchasePromoProductListener} shouldPurchasePromoProductListener Called when a user initiates a
     * promotional in-app purchase from the App Store. If your app is able to handle a purchase at the current time, run
     * the deferredPurchase function. If the app is not in a state to make a purchase: cache the deferredPurchase, then
     * call the deferredPurchase when the app is ready to make the promotional purchase.
     * If the purchase should never be made, you don't need to ever call the deferredPurchase and the app will not
     * proceed with promotional purchases.
     */
    static addShouldPurchasePromoProductListener(shouldPurchasePromoProductListener: ShouldPurchasePromoProductListener): void;
    /**
     * Removes a given ShouldPurchasePromoProductListener
     * @param {ShouldPurchasePromoProductListener} listenerToRemove ShouldPurchasePromoProductListener reference of
     * the listener to remove
     * @returns {boolean} True if listener was removed, false otherwise
     */
    static removeShouldPurchasePromoProductListener(listenerToRemove: ShouldPurchasePromoProductListener): boolean;
    /**
     * Gets the map of entitlements -> offerings -> products
     * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure. The promise will be rejected if configure
     * has not been called yet.
     */
    static getOfferings(): Promise<PurchasesOfferings>;
    /**
     * Retrieves a current offering for a placement identifier, use this to access offerings defined by targeting
     * placements configured in the RevenueCat dashboard.
     * @param {String} placementIdentifier The placement identifier to fetch a current offeringn for
     * @returns {Promise<PurchasesOffering | null>} Promise of an optional offering. The promise will be rejected if configure
     * has not been called yet.
     */
    static getCurrentOfferingForPlacement(placementIdentifier: string): Promise<PurchasesOffering | null>;
    /**
     * Syncs subscriber attributes and then fetches the configured offerings for this user. This method is intended to
     * be called when using Targeting Rules with Custom Attributes. Any subscriber attributes should be set before
     * calling this method to ensure the returned offerings are applied with the latest subscriber attributes.
     * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure. The promise will be rejected if configure
     * has not been called yet.
     */
    static syncAttributesAndOfferingsIfNeeded(): Promise<PurchasesOfferings>;
    /**
     * Fetch the product info
     * @param {String[]} productIdentifiers Array of product identifiers
     * @param {String} type Optional type of products to fetch, can be SUBSCRIPTION or NON_SUBSCRIPTION. SUBSCRIPTION by default
     * @returns {Promise<PurchasesStoreProduct[]>} A promise containing an array of products. The promise will be rejected
     * if the products are not properly configured in RevenueCat or if there is another error retrieving them.
     * Rejections return an error code, and a userInfo object with more information. The promise will also be rejected
     * if configure has not been called yet.
     */
    static getProducts(productIdentifiers: string[], type?: PURCHASE_TYPE | PRODUCT_CATEGORY): Promise<PurchasesStoreProduct[]>;
    /**
     * Make a purchase
     *
     * @param {String} productIdentifier The product identifier of the product you want to purchase
     * @param {UpgradeInfo} upgradeInfo Android only. Optional UpgradeInfo you wish to upgrade from containing the oldSKU
     * and the optional prorationMode.
     * @param {String} type Optional type of product, can be inapp or subs. Subs by default
     * @deprecated, use purchaseStoreProduct instead
     */
    static purchaseProduct(productIdentifier: string, upgradeInfo?: UpgradeInfo | null, type?: PURCHASE_TYPE): Promise<MakePurchaseResult>;
    /**
     * Make a purchase
     *
     * @param {PurchasesStoreProduct} product The product you want to purchase
     * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
     * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo:CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will
     * also be rejected if configure has not been called yet.
     */
    static purchaseStoreProduct(product: PurchasesStoreProduct, googleProductChangeInfo?: GoogleProductChangeInfo | null, googleIsPersonalizedPrice?: boolean | null): Promise<MakePurchaseResult>;
    /**
     * iOS only. Purchase a product applying a given discount.
     *
     * @param {PurchasesStoreProduct} product The product you want to purchase
     * @param {PurchasesPromotionalOffer} discount Discount to apply to this package. Retrieve this discount using getPromotionalOffer.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo:CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code,
     * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will be
     * rejected if configure has not been called yet.
     */
    static purchaseDiscountedProduct(product: PurchasesStoreProduct, discount: PurchasesPromotionalOffer): Promise<MakePurchaseResult>;
    /**
     * Make a purchase
     *
     * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
     * @param {UpgradeInfo} upgradeInfo DEPRECATED. Use googleProductChangeInfo.
     * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
     * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
     * has not been called yet.
     */
    static purchasePackage(aPackage: PurchasesPackage, upgradeInfo?: UpgradeInfo | null, googleProductChangeInfo?: GoogleProductChangeInfo | null, googleIsPersonalizedPrice?: boolean | null): Promise<MakePurchaseResult>;
    /**
     * Google only. Make a purchase of a subscriptionOption
     *
     * @param {SubscriptionOption} subscriptionOption The SubscriptionOption you wish to purchase. You can get the SubscriptionOption from StoreProducts by calling getOfferings
     * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
     * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
     * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
     * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
     * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
     * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
     * has not been called yet.
     */
    static purchaseSubscriptionOption(subscriptionOption: SubscriptionOption, googleProductChangeInfo?: GoogleProductChangeInfo, googleIsPersonalizedPrice?: boolean): Promise<MakePurchaseResult>;
    /**
     * iOS only. Purchase a package applying a given discount.
     *
     * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
     * @param {PurchasesPromotionalOffer} discount Discount to apply to this package. Retrieve this discount using getPromotionalOffer.
     * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
     * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
     * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
     * has not been called yet.
     */
    static purchaseDiscountedPackage(aPackage: PurchasesPackage, discount: PurchasesPromotionalOffer): Promise<MakePurchaseResult>;
    /**
     * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
     * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be also be rejected if configure has not been called yet.
     */
    static restorePurchases(): Promise<CustomerInfo>;
    /**
     * Get the appUserID
     * @returns {Promise<string>} The app user id in a promise
     */
    static getAppUserID(): Promise<string>;
    /**
     * This function will logIn the current user with an appUserID. Typically this would be used after a log in
     * to identify a user without calling configure.
     * @param {String} appUserID The appUserID that should be linked to the currently user
     * @returns {Promise<LogInResult>} A promise of an object that contains the customerInfo after logging in, as well
     * as a boolean indicating whether the user has just been created for the first time in the RevenueCat backend. The
     * promise will be rejected if configure has not been called yet or if there's an issue logging in.
     */
    static logIn(appUserID: string): Promise<LogInResult>;
    /**
     * Logs out the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
     * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code,
     * and a userInfo object with more information. The promise will be rejected if configure has not been called yet or if
     * there's an issue logging out.
     */
    static logOut(): Promise<CustomerInfo>;
    /**
     * Enables/Disables debugs logs
     * @param {boolean} enabled Enable or not debug logs
     * @deprecated, use setLogLevel instead
     */
    static setDebugLogsEnabled(enabled: boolean): Promise<void>;
    /**
     * Used to set the log level. Useful for debugging issues with the lovely team @RevenueCat.
     * The default is {LOG_LEVEL.INFO} in release builds and {LOG_LEVEL.DEBUG} in debug builds.
     * @param {LOG_LEVEL} level
     */
    static setLogLevel(level: LOG_LEVEL): Promise<void>;
    /**
     * Set a custom log handler for redirecting logs to your own logging system.
     * By default, this sends info, warning, and error messages.
     * If you wish to receive Debug level messages, see [setLogLevel].
     * @param {LogHandler} logHandler It will get called for each log event.
     * Use this function to redirect the log to your own logging system
     */
    static setLogHandler(logHandler: LogHandler): void;
    /**
     * Gets current customer info
     * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code, and an
     * userInfo object with more information. The promise will be rejected if configure has not been called yet or if
     * there's an issue getting the customer information.
     */
    static getCustomerInfo(): Promise<CustomerInfo>;
    /**
     * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
     * for subscriptions anytime a sync is needed, like after a successful purchase.
     *
     * @warning This function should only be called if you're not calling purchaseProduct/purchaseStoreProduct/purchasePackage/purchaseSubscriptionOption.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * syncing purchases.
     */
    static syncPurchases(): Promise<void>;
    /**
     * This method will send a purchase to the RevenueCat backend. This function should only be called if you are
     * in Amazon observer mode or performing a client side migration of your current users to RevenueCat.
     *
     * The receipt IDs are cached if successfully posted so they are not posted more than once.
     *
     * @param {string} productID Product ID associated to the purchase.
     * @param {string} receiptID ReceiptId that represents the Amazon purchase.
     * @param {string} amazonUserID Amazon's userID. This parameter will be ignored when syncing a Google purchase.
     * @param {(string|null|undefined)} isoCurrencyCode Product's currency code in ISO 4217 format.
     * @param {(number|null|undefined)} price Product's price.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * syncing purchases.
     */
    static syncAmazonPurchase(productID: string, receiptID: string, amazonUserID: string, isoCurrencyCode?: string | null, price?: number | null): Promise<void>;
    /**
     * @deprecated, use syncAmazonPurchase instead.
     *
     * This method will send a purchase to the RevenueCat backend. This function should only be called if you are
     * in Amazon observer mode or performing a client side migration of your current users to RevenueCat.
     *
     * The receipt IDs are cached if successfully posted so they are not posted more than once.
     *
     * @param {string} productID Product ID associated to the purchase.
     * @param {string} receiptID ReceiptId that represents the Amazon purchase.
     * @param {string} amazonUserID Amazon's userID. This parameter will be ignored when syncing a Google purchase.
     * @param {(string|null|undefined)} isoCurrencyCode Product's currency code in ISO 4217 format.
     * @param {(number|null|undefined)} price Product's price.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * syncing purchases.
     */
    static syncObserverModeAmazonPurchase(productID: string, receiptID: string, amazonUserID: string, isoCurrencyCode?: string | null, price?: number | null): Promise<void>;
    /**
     * iOS only. Always returns an error on iOS < 15.
     *
     * Use this method only if you already have your own IAP implementation using StoreKit 2 and want to use
     * RevenueCat's backend. If you are using StoreKit 1 for your implementation, you do not need this method.
     *
     * You only need to use this method with *new* purchases. Subscription updates are observed automatically.
     *
     * Important: This should only be used if you have set PurchasesAreCompletedBy to MY_APP during SDK configuration.
     *
     * @warning You need to finish the transaction yourself after calling this method.
     *
     * @param {string} productID Product ID that was just purchased
     * @returns {Promise<PurchasesStoreTransaction>} If there was a transacton found and handled for the provided product ID.
     */
    static recordPurchase(productID: string): Promise<PurchasesStoreTransaction>;
    /**
     * Enable automatic collection of Apple Search Ad attribution on iOS. Disabled by default
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    static enableAdServicesAttributionTokenCollection(): Promise<void>;
    /**
     * @returns { Promise<boolean> } If the `appUserID` has been generated by RevenueCat or not.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    static isAnonymous(): Promise<boolean>;
    /**
     * iOS only. Computes whether or not a user is eligible for the introductory pricing period of a given product.
     * You should use this method to determine whether or not you show the user the normal product price or the
     * introductory price. This also applies to trials (trials are considered a type of introductory pricing).
     *
     * @note Subscription groups are automatically collected for determining eligibility. If RevenueCat can't
     * definitively compute the eligibility, most likely because of missing group information, it will return
     * `INTRO_ELIGIBILITY_STATUS_UNKNOWN`. The best course of action on unknown status is to display the non-intro
     * pricing, to not create a misleading situation. To avoid this, make sure you are testing with the latest version of
     * iOS so that the subscription group can be collected by the SDK. Android always returns INTRO_ELIGIBILITY_STATUS_UNKNOWN.
     *
     * @param productIdentifiers Array of product identifiers for which you want to compute eligibility
     * @returns { Promise<[productId: string]: IntroEligibility> } A map of IntroEligility per productId. The promise
     * will be rejected if configure has not been called yet or if there's in an error checking eligibility.
     */
    static checkTrialOrIntroductoryPriceEligibility(productIdentifiers: string[]): Promise<{
        [productId: string]: IntroEligibility;
    }>;
    /**
     * iOS only. Use this function to retrieve the `PurchasesPromotionalOffer` for a given `PurchasesPackage`.
     *
     * @param product The `PurchasesStoreProduct` the user intends to purchase.
     * @param discount The `PurchasesStoreProductDiscount` to apply to the product.
     * @returns { Promise<PurchasesPromotionalOffer> } Returns when the `PurchasesPaymentDiscount` is returned.
     * Null is returned for Android and incompatible iOS versions. The promise will be rejected if configure has not been
     * called yet or if there's an error getting the payment discount.
     */
    static getPromotionalOffer(product: PurchasesStoreProduct, discount: PurchasesStoreProductDiscount): Promise<PurchasesPromotionalOffer | undefined>;
    /**
     * Invalidates the cache for customer information.
     *
     * Most apps will not need to use this method; invalidating the cache can leave your app in an invalid state.
     * Refer to https://docs.revenuecat.com/docs/customer-info#section-get-user-information for more information on
     * using the cache properly.
     *
     * This is useful for cases where customer information might have been updated outside of the app, like if a
     * promotional subscription is granted through the RevenueCat dashboard.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
     * invalidating the customer info cache.
     */
    static invalidateCustomerInfoCache(): Promise<void>;
    /** iOS only. Presents a code redemption sheet, useful for redeeming offer codes
     * Refer to https://docs.revenuecat.com/docs/ios-subscription-offers#offer-codes for more information on how
     * to configure and use offer codes
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
     * presenting the code redemption sheet.
     */
    static presentCodeRedemptionSheet(): Promise<void>;
    /**
     * Subscriber attributes are useful for storing additional, structured information on a user.
     * Since attributes are writable using a public key they should not be used for
     * managing secure or sensitive information such as subscription status, coins, etc.
     *
     * Key names starting with "$" are reserved names used by RevenueCat. For a full list of key
     * restrictions refer to our guide: https://docs.revenuecat.com/docs/subscriber-attributes
     *
     * @param attributes Map of attributes by key. Set the value as an empty string to delete an attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
     * setting the subscriber attributes.
     */
    static setAttributes(attributes: {
        [key: string]: string | null;
    }): Promise<void>;
    /**
     * Subscriber attribute associated with the email address for the user
     *
     * @param email Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the email.
     */
    static setEmail(email: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the phone number for the user
     *
     * @param phoneNumber Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the phone number.
     */
    static setPhoneNumber(phoneNumber: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the display name for the user
     *
     * @param displayName Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the display name.
     */
    static setDisplayName(displayName: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the push token for the user
     *
     * @param pushToken null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the push token.
     */
    static setPushToken(pushToken: string | null): Promise<void>;
    /**
     * Set this property to your proxy URL before configuring Purchases *only* if you've received a proxy key value
     * from your RevenueCat contact.
     * @returns {Promise<void>} The promise to be returned after setting the proxy has been completed.
     */
    static setProxyURL(url: string): Promise<void>;
    /**
     * Automatically collect subscriber attributes associated with the device identifiers.
     * $idfa, $idfv, $ip on iOS
     * $gpsAdId, $androidId, $ip on Android
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting collecting the device identifiers.
     */
    static collectDeviceIdentifiers(): Promise<void>;
    /**
     * Subscriber attribute associated with the Adjust Id for the user
     * Required for the RevenueCat Adjust integration
     *
     * @param adjustID Adjust ID to use in Adjust integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting Adjust ID.
     */
    static setAdjustID(adjustID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the AppsFlyer Id for the user
     * Required for the RevenueCat AppsFlyer integration
     * @param appsflyerID Appsflyer ID to use in Appsflyer integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Appsflyer ID.
     */
    static setAppsflyerID(appsflyerID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the Facebook SDK Anonymous Id for the user
     * Recommended for the RevenueCat Facebook integration
     *
     * @param fbAnonymousID Facebook Anonymous ID to use in Mparticle integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Facebook Anonymous ID.
     */
    static setFBAnonymousID(fbAnonymousID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the mParticle Id for the user
     * Recommended for the RevenueCat mParticle integration
     *
     * @param mparticleID Mparticle ID to use in Mparticle integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Mparticle ID.
     */
    static setMparticleID(mparticleID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the CleverTap Id for the user
     * Required for the RevenueCat CleverTap integration
     *
     * @param cleverTapID CleverTap user ID to use in CleverTap integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the CleverTap ID.
     */
    static setCleverTapID(cleverTapID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the Mixpanel Distinct Id for the user
     * Required for the RevenueCat Mixpanel integration
     *
     * @param mixpanelDistinctID Mixpanel Distinct ID to use in Mixpanel integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Mixpanel Distinct ID.
     */
    static setMixpanelDistinctID(mixpanelDistinctID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the Firebase App Instance ID for the user
     * Required for the RevenueCat Firebase integration
     *
     * @param firebaseAppInstanceID Firebase App Instance ID to use in Firebase integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Firebase App Instance ID.
     */
    static setFirebaseAppInstanceID(firebaseAppInstanceID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the OneSignal Player Id for the user
     * Required for the RevenueCat OneSignal integration
     *
     * @param onesignalID OneSignal Player ID to use in OneSignal integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the OneSignal ID.
     */
    static setOnesignalID(onesignalID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the Airship Channel Id for the user
     * Required for the RevenueCat Airship integration
     *
     * @param airshipChannelID Airship Channel ID to use in Airship integration. Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the Airship Channel ID.
     */
    static setAirshipChannelID(airshipChannelID: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the install media source for the user
     *
     * @param mediaSource Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the media source.
     */
    static setMediaSource(mediaSource: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the install campaign for the user
     *
     * @param campaign Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the campaign.
     */
    static setCampaign(campaign: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the install ad group for the user
     *
     * @param adGroup Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting ad group.
     */
    static setAdGroup(adGroup: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the install ad for the user
     *
     * @param ad Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the ad subscriber attribute.
     */
    static setAd(ad: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the install keyword for the user
     *
     * @param keyword Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the keyword.
     */
    static setKeyword(keyword: string | null): Promise<void>;
    /**
     * Subscriber attribute associated with the install ad creative for the user
     *
     * @param creative Empty String or null will delete the subscriber attribute.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
     * setting the creative subscriber attribute.
     */
    static setCreative(creative: string | null): Promise<void>;
    /**
     * Check if billing is supported for the current user (meaning IN-APP purchases are supported)
     * and optionally, whether a list of specified feature types are supported.
     *
     * Note: Billing features are only relevant to Google Play Android users.
     * For other stores and platforms, billing features won't be checked.
     *
     * @param features An array of feature types to check for support. Feature types must be one of
     *       [BILLING_FEATURE]. By default, is an empty list and no specific feature support will be checked.
     * @returns {Promise<boolean>} promise with boolean response. True if billing is supported, false otherwise.
     */
    static canMakePayments(features?: BILLING_FEATURE[]): Promise<boolean>;
    /**
     * iOS 15+ only. Presents a refund request sheet in the current window scene for
     * the latest transaction associated with the active entitlement.
     *
     * If the request was unsuccessful, no active entitlements could be found for
     * the user, or multiple active entitlements were found for the user,
     * the promise will return an error.
     * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
     *
     * Important: This method should only be used if your user can only have a single active entitlement at a given time.
     * If a user could have more than one entitlement at a time, use `beginRefundRequestForEntitlement` instead.
     *
     * @returns {Promise<REFUND_REQUEST_STATUS>} Returns REFUND_REQUEST_STATUS: The status of the
     *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
     */
    static beginRefundRequestForActiveEntitlement(): Promise<REFUND_REQUEST_STATUS>;
    /**
     * iOS 15+ only. Presents a refund request sheet in the current window scene for
     * the latest transaction associated with the `entitlement`.
     *
     * If the request was unsuccessful, the promise will return an error.
     * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
     *
     * @param entitlementInfo The entitlement to begin a refund request for.
     * @returns {Promise<REFUND_REQUEST_STATUS>} Returns REFUND_REQUEST_STATUS: The status of the
     *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
     */
    static beginRefundRequestForEntitlement(entitlementInfo: PurchasesEntitlementInfo): Promise<REFUND_REQUEST_STATUS>;
    /**
     * iOS 15+ only. Presents a refund request sheet in the current window scene for
     * the latest transaction associated with the `product`.
     *
     * If the request was unsuccessful, the promise will return an error.
     * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
     *
     * @param storeProduct The StoreProduct to begin a refund request for.
     * @returns {Promise<REFUND_REQUEST_STATUS>} Returns a REFUND_REQUEST_STATUS: The status of the
     *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
     */
    static beginRefundRequestForProduct(storeProduct: PurchasesStoreProduct): Promise<REFUND_REQUEST_STATUS>;
    /**
     * Shows in-app messages available from the App Store or Google Play. You need to disable messages from showing
     * automatically using [PurchasesConfiguration.shouldShowInAppMessagesAutomatically].
     *
     * Note: In iOS, this requires version 16+. In older versions the promise will be resolved successfully
     * immediately.
     *
     * @param messageTypes An array of message types that the stores can display inside your app. Must be one of
     *       [IN_APP_MESSAGE_TYPE]. By default, is undefined and all message types will be shown.
     * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
     */
    static showInAppMessages(messageTypes?: IN_APP_MESSAGE_TYPE[]): Promise<void>;
    /**
     * Check if configure has finished and Purchases has been configured.
     *
     * @returns {Promise<Boolean>} promise with boolean response
     */
    static isConfigured(): Promise<boolean>;
    private static throwIfNotConfigured;
    private static throwIfAndroidPlatform;
    private static throwIfIOSPlatform;
    private static isPurchasesAreCompletedByMyApp;
    private static convertIntToRefundRequestStatus;
}
