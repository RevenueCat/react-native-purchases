import {
  PurchasesError,
  PURCHASES_ERROR_CODE,
  UninitializedPurchasesError,
  UnsupportedPlatformError,
  CustomerInfo,
  PurchasesEntitlementInfo,
  PRORATION_MODE,
  PACKAGE_TYPE,
  INTRO_ELIGIBILITY_STATUS,
  PurchasesOfferings,
  PurchasesStoreProduct,
  UpgradeInfo,
  PurchasesPromotionalOffer,
  PurchasesPackage,
  IntroEligibility,
  PurchasesStoreProductDiscount,
  SubscriptionOption,
  PRODUCT_CATEGORY,
  GoogleProductChangeInfo,
  PURCHASE_TYPE,
  BILLING_FEATURE,
  REFUND_REQUEST_STATUS,
  LOG_LEVEL,
  PurchasesConfiguration,
  CustomerInfoUpdateListener,
  ShouldPurchasePromoProductListener,
  MakePurchaseResult,
  LogHandler,
  LogInResult,
  IN_APP_MESSAGE_TYPE,
  ENTITLEMENT_VERIFICATION_MODE,
  VERIFICATION_RESULT,
  STOREKIT_VERSION,
  PurchasesStoreTransaction,
  PurchasesOffering,
  PURCHASES_ARE_COMPLETED_BY_TYPE,
  PurchasesAreCompletedBy,
  PurchasesAreCompletedByMyApp, // Ensure this is imported if used, or define a mock
  PurchasesWinBackOffer,
  WebPurchaseRedemption,
  WebPurchaseRedemptionResult,
  Storefront,
} from "@revenuecat/purchases-typescript-internal";

const mockCustomerInfo: CustomerInfo = {
  entitlements: { all: {}, active: {} },
  activeSubscriptions: [],
  allPurchasedProductIdentifiers: [],
  latestExpirationDate: null,
  firstSeen: "2023-01-01T00:00:00Z",
  originalAppUserId: "mock_user_id",
  requestDate: "2023-01-01T00:00:00Z",
  originalApplicationVersion: "1.0",
  originalPurchaseDate: null,
  managementURL: null,
  nonSubscriptionTransactions: [],
  verificationResult: VERIFICATION_RESULT.NOT_REQUESTED,
};

const mockMakePurchaseResult: MakePurchaseResult = {
  customerInfo: mockCustomerInfo,
  productIdentifier: "mock_product_id",
};

const mockLogInResult: LogInResult = {
  customerInfo: mockCustomerInfo,
  created: false,
};

export default class Purchases {
  public static PURCHASE_TYPE = PURCHASE_TYPE;
  public static PRODUCT_CATEGORY = PRODUCT_CATEGORY;
  public static BILLING_FEATURE = BILLING_FEATURE;
  public static REFUND_REQUEST_STATUS = REFUND_REQUEST_STATUS;
  public static PRORATION_MODE = PRORATION_MODE;
  public static PACKAGE_TYPE = PACKAGE_TYPE;
  public static INTRO_ELIGIBILITY_STATUS = INTRO_ELIGIBILITY_STATUS;
  public static PURCHASES_ERROR_CODE = PURCHASES_ERROR_CODE;
  public static LOG_LEVEL = LOG_LEVEL;
  public static IN_APP_MESSAGE_TYPE = IN_APP_MESSAGE_TYPE;
  public static ENTITLEMENT_VERIFICATION_MODE = ENTITLEMENT_VERIFICATION_MODE;
  public static VERIFICATION_RESULT = VERIFICATION_RESULT;
  public static STOREKIT_VERSION = STOREKIT_VERSION;
  public static PURCHASES_ARE_COMPLETED_BY_TYPE =
    PURCHASES_ARE_COMPLETED_BY_TYPE;

  public static UninitializedPurchasesError = UninitializedPurchasesError;
  public static UnsupportedPlatformError = UnsupportedPlatformError;

  private static customerInfoUpdateListeners: CustomerInfoUpdateListener[] = [];
  private static shouldPurchasePromoProductListeners: ShouldPurchasePromoProductListener[] =
    [];
  // @ts-ignore
  private static customLogHandler: LogHandler;

  public static configure({
    apiKey,
    appUserID = null,
    purchasesAreCompletedBy = PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT,
    userDefaultsSuiteName,
    storeKitVersion = STOREKIT_VERSION.DEFAULT,
    useAmazon = false,
    shouldShowInAppMessagesAutomatically = true,
    entitlementVerificationMode = ENTITLEMENT_VERIFICATION_MODE.DISABLED,
  }: PurchasesConfiguration): void {
    // Mock: Does nothing, configuration is assumed to be successful
    if (apiKey === undefined || typeof apiKey !== "string") {
      console.error(
        'Invalid API key. It must be called with an Object: configure({apiKey: "key"})'
      );
      return;
    }
  }

  public static async setAllowSharingStoreAccount(
    allowSharing: boolean
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setSimulatesAskToBuyInSandbox(
    simulatesAskToBuyInSandbox: boolean
  ): Promise<void> {
    return Promise.resolve();
  }

  public static addCustomerInfoUpdateListener(
    customerInfoUpdateListener: CustomerInfoUpdateListener
  ): void {
    if (typeof customerInfoUpdateListener !== "function") {
      throw new Error("addCustomerInfoUpdateListener needs a function");
    }
    if (
      !Purchases.customerInfoUpdateListeners.includes(
        customerInfoUpdateListener
      )
    ) {
      Purchases.customerInfoUpdateListeners.push(customerInfoUpdateListener);
    }
  }

  public static removeCustomerInfoUpdateListener(
    listenerToRemove: CustomerInfoUpdateListener
  ): boolean {
    if (Purchases.customerInfoUpdateListeners.includes(listenerToRemove)) {
      Purchases.customerInfoUpdateListeners =
        Purchases.customerInfoUpdateListeners.filter(
          (listener) => listenerToRemove !== listener
        );
      return true;
    }
    return false;
  }

  public static addShouldPurchasePromoProductListener(
    shouldPurchasePromoProductListener: ShouldPurchasePromoProductListener
  ): void {
    if (typeof shouldPurchasePromoProductListener !== "function") {
      throw new Error("addShouldPurchasePromoProductListener needs a function");
    }
    if (
      !Purchases.shouldPurchasePromoProductListeners.includes(
        shouldPurchasePromoProductListener
      )
    ) {
      Purchases.shouldPurchasePromoProductListeners.push(
        shouldPurchasePromoProductListener
      );
    }
  }

  public static removeShouldPurchasePromoProductListener(
    listenerToRemove: ShouldPurchasePromoProductListener
  ): boolean {
    if (
      Purchases.shouldPurchasePromoProductListeners.includes(listenerToRemove)
    ) {
      Purchases.shouldPurchasePromoProductListeners =
        Purchases.shouldPurchasePromoProductListeners.filter(
          (listener) => listenerToRemove !== listener
        );
      return true;
    }
    return false;
  }

  public static async getOfferings(): Promise<PurchasesOfferings> {
    const mockOfferings: PurchasesOfferings = {
      current: null,
      all: {},
      // @ts-ignore
      offerings: {}, // offerings is deprecated but still part of the type
    };
    return Promise.resolve(mockOfferings);
  }

  public static async getCurrentOfferingForPlacement(
    placementIdentifier: string
  ): Promise<PurchasesOffering | null> {
    return Promise.resolve(null);
  }

  public static async syncAttributesAndOfferingsIfNeeded(): Promise<PurchasesOfferings> {
    const mockOfferings: PurchasesOfferings = {
      current: null,
      all: {},
      // @ts-ignore
      offerings: {},
    };
    return Promise.resolve(mockOfferings);
  }

  public static async getProducts(
    productIdentifiers: string[],
    type: PURCHASE_TYPE | PRODUCT_CATEGORY = PRODUCT_CATEGORY.SUBSCRIPTION
  ): Promise<PurchasesStoreProduct[]> {
    return Promise.resolve([]);
  }

  public static async purchaseProduct(
    productIdentifier: string,
    upgradeInfo?: UpgradeInfo | null,
    type: PURCHASE_TYPE = PURCHASE_TYPE.SUBS
  ): Promise<MakePurchaseResult> {
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async purchaseStoreProduct(
    product: PurchasesStoreProduct,
    googleProductChangeInfo?: GoogleProductChangeInfo | null,
    googleIsPersonalizedPrice?: boolean | null
  ): Promise<MakePurchaseResult> {
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async purchaseDiscountedProduct(
    product: PurchasesStoreProduct,
    discount: PurchasesPromotionalOffer
  ): Promise<MakePurchaseResult> {
    if (typeof discount === "undefined" || discount == null) {
      return Promise.reject(new Error("A discount is required"));
    }
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async purchasePackage(
    aPackage: PurchasesPackage,
    upgradeInfo?: UpgradeInfo | null,
    googleProductChangeInfo?: GoogleProductChangeInfo | null,
    googleIsPersonalizedPrice?: boolean | null
  ): Promise<MakePurchaseResult> {
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async purchaseSubscriptionOption(
    subscriptionOption: SubscriptionOption,
    googleProductChangeInfo?: GoogleProductChangeInfo,
    googleIsPersonalizedPrice?: boolean
  ): Promise<MakePurchaseResult> {
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async purchaseDiscountedPackage(
    aPackage: PurchasesPackage,
    discount: PurchasesPromotionalOffer
  ): Promise<MakePurchaseResult> {
    if (typeof discount === "undefined" || discount == null) {
      return Promise.reject(new Error("A discount is required"));
    }
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async restorePurchases(): Promise<CustomerInfo> {
    return Promise.resolve(mockCustomerInfo);
  }

  public static async getAppUserID(): Promise<string> {
    return Promise.resolve("mock_user_id");
  }

  public static async getStorefront(): Promise<Storefront | null> {
    const mockStorefront: Storefront = {
        identifier: "USA",
        countryCode: "US",
    }
    return Promise.resolve(mockStorefront);
  }

  public static async logIn(appUserID: string): Promise<LogInResult> {
    if (typeof appUserID !== "string") {
      return Promise.reject(new Error("appUserID needs to be a string"));
    }
    return Promise.resolve(mockLogInResult);
  }

  public static async logOut(): Promise<CustomerInfo> {
    return Promise.resolve(mockCustomerInfo);
  }

  public static async setDebugLogsEnabled(enabled: boolean): Promise<void> {
    // Mock: Does nothing
  }

  public static async setLogLevel(level: LOG_LEVEL): Promise<void> {
    // Mock: Does nothing
  }

  public static setLogHandler(logHandler: LogHandler): void {
    Purchases.customLogHandler = logHandler;
  }

  public static async getCustomerInfo(): Promise<CustomerInfo> {
    return Promise.resolve(mockCustomerInfo);
  }

  public static async syncPurchases(): Promise<void> {
    return Promise.resolve();
  }

  public static async syncAmazonPurchase(
    productID: string,
    receiptID: string,
    amazonUserID: string,
    isoCurrencyCode?: string | null,
    price?: number | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async syncObserverModeAmazonPurchase(
    productID: string,
    receiptID: string,
    amazonUserID: string,
    isoCurrencyCode?: string | null,
    price?: number | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async recordPurchase(
    productID: string
  ): Promise<PurchasesStoreTransaction> {
    const mockTransaction: PurchasesStoreTransaction = {
        transactionIdentifier: "mock_transaction_id_" + productID,
        productIdentifier: productID,
        purchaseDate: new Date().toISOString(),
    }
    return Promise.resolve(mockTransaction);
  }

  public static async enableAdServicesAttributionTokenCollection(): Promise<void> {
    return Promise.resolve();
  }

  public static async isAnonymous(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public static async checkTrialOrIntroductoryPriceEligibility(
    productIdentifiers: string[]
  ): Promise<{ [productId: string]: IntroEligibility }> {
    const mockEligibility: { [productId: string]: IntroEligibility } = {};
    productIdentifiers.forEach((id) => {
      mockEligibility[id] = {
        status: INTRO_ELIGIBILITY_STATUS.ELIGIBLE,
        description: "Mock eligibility",
      };
    });
    return Promise.resolve(mockEligibility);
  }

  public static async getPromotionalOffer(
    product: PurchasesStoreProduct,
    discount: PurchasesStoreProductDiscount
  ): Promise<PurchasesPromotionalOffer | undefined> {
    if (typeof discount === "undefined" || discount == null) {
        return Promise.reject(new Error("A discount is required"));
    }
    // Return undefined as per original behavior for Android or if no offer found
    return Promise.resolve(undefined);
  }

  public static async getEligibleWinBackOffersForProduct(
    product: PurchasesStoreProduct
  ): Promise<[PurchasesWinBackOffer] | undefined> {
    return Promise.resolve(undefined);
  }

  public static async getEligibleWinBackOffersForPackage(
    aPackage: PurchasesPackage
  ): Promise<[PurchasesWinBackOffer] | undefined> {
    return Promise.resolve(undefined);
  }

  public static async purchaseProductWithWinBackOffer(
    product: PurchasesStoreProduct,
    winBackOffer: PurchasesWinBackOffer
  ): Promise<MakePurchaseResult> {
    if (typeof winBackOffer === "undefined" || winBackOffer == null) {
      return Promise.reject(new Error("A win-back offer is required"));
    }
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async purchasePackageWithWinBackOffer(
    aPackage: PurchasesPackage,
    winBackOffer: PurchasesWinBackOffer
  ): Promise<MakePurchaseResult> {
    if (typeof winBackOffer === "undefined" || winBackOffer == null) {
      return Promise.reject(new Error("A win-back offer is required"));
    }
    return Promise.resolve(mockMakePurchaseResult);
  }

  public static async invalidateCustomerInfoCache(): Promise<void> {
    // Mock: Does nothing
  }

  public static async presentCodeRedemptionSheet(): Promise<void> {
    // Mock: Does nothing
  }

  public static async setAttributes(attributes: {
    [key: string]: string | null;
  }): Promise<void> {
    return Promise.resolve();
  }

  public static async setEmail(email: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async setPhoneNumber(
    phoneNumber: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setDisplayName(
    displayName: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setPushToken(pushToken: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async setProxyURL(url: string): Promise<void> {
    return Promise.resolve();
  }

  public static async collectDeviceIdentifiers(): Promise<void> {
    return Promise.resolve();
  }

  public static async setAdjustID(adjustID: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async setAppsflyerID(
    appsflyerID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setFBAnonymousID(
    fbAnonymousID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setMparticleID(
    mparticleID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setCleverTapID(
    cleverTapID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setMixpanelDistinctID(
    mixpanelDistinctID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setFirebaseAppInstanceID(
    firebaseAppInstanceID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

 public static async setTenjinAnalyticsInstallationID(
    tenjinAnalyticsInstallationID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setKochavaDeviceID(
    kochavaDeviceID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setOnesignalID(
    onesignalID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setAirshipChannelID(
    airshipChannelID: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setMediaSource(
    mediaSource: string | null
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async setCampaign(campaign: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async setAdGroup(adGroup: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async setAd(ad: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async setKeyword(keyword: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async setCreative(creative: string | null): Promise<void> {
    return Promise.resolve();
  }

  public static async canMakePayments(
    features: BILLING_FEATURE[] = []
  ): Promise<boolean> {
    return Promise.resolve(true);
  }

  public static async beginRefundRequestForActiveEntitlement(): Promise<REFUND_REQUEST_STATUS> {
    return Promise.resolve(REFUND_REQUEST_STATUS.SUCCESS);
  }

  public static async beginRefundRequestForEntitlement(
    entitlementInfo: PurchasesEntitlementInfo
  ): Promise<REFUND_REQUEST_STATUS> {
    return Promise.resolve(REFUND_REQUEST_STATUS.SUCCESS);
  }

  public static async beginRefundRequestForProduct(
    storeProduct: PurchasesStoreProduct
  ): Promise<REFUND_REQUEST_STATUS> {
    return Promise.resolve(REFUND_REQUEST_STATUS.SUCCESS);
  }

  public static async showManageSubscriptions(): Promise<void> {
    return Promise.resolve();
  }

  public static async showInAppMessages(
    messageTypes?: IN_APP_MESSAGE_TYPE[]
  ): Promise<void> {
    return Promise.resolve();
  }

  public static async parseAsWebPurchaseRedemption(
    urlString: string
  ): Promise<WebPurchaseRedemption | null> {
    // Basic mock: assume any string containing "redeem" is a valid link
    if (urlString.includes("redeem")) {
        return Promise.resolve({ redemptionLink: urlString });
    }
    return Promise.resolve(null);
  }

  public static async redeemWebPurchase(
    webPurchaseRedemption: WebPurchaseRedemption
  ): Promise<WebPurchaseRedemptionResult> {
    return Promise.resolve({
        customerInfo: mockCustomerInfo,
        created: false, // Or true, depending on what you want to mock
    });
  }

  public static isConfigured(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
