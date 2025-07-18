import { CustomerInfo, INTRO_ELIGIBILITY_STATUS, MakePurchaseResult, PurchasesStoreTransaction, VERIFICATION_RESULT, WebPurchaseRedemptionResultType, PurchasesPackage, PurchasesStoreProduct, PACKAGE_TYPE, PRODUCT_CATEGORY, PRODUCT_TYPE, PurchasesOffering, PurchasesOfferings } from '@revenuecat/purchases-typescript-internal';

const previewCustomerInfo: CustomerInfo = {
  activeSubscriptions: [],
  allExpirationDates: {},
  allPurchaseDates: {},
  allPurchasedProductIdentifiers: [],
  entitlements: {
    active: {},
    all: {},
    verification: VERIFICATION_RESULT.NOT_REQUESTED
  },
  firstSeen: new Date().toISOString(),
  latestExpirationDate: null,
  originalAppUserId: 'preview-user-id',
  originalApplicationVersion: null,
  requestDate: new Date().toISOString(),
  managementURL: null,
  originalPurchaseDate: new Date().toISOString(),
  nonSubscriptionTransactions: [],
  subscriptionsByProductIdentifier: {}
};

const previewPurchaseStoreTransaction: PurchasesStoreTransaction = {
  transactionIdentifier: 'preview-transaction-id',
  productIdentifier: 'preview-product-id',
  purchaseDate: new Date().toISOString()
};

const previewMakePurchaseResult: MakePurchaseResult = {
  productIdentifier: 'preview-product-id',
  customerInfo: previewCustomerInfo,
  transaction: previewPurchaseStoreTransaction
};

const previewStoreProduct: PurchasesStoreProduct = {
  identifier: 'preview-product-id',
  description: 'Preview product description',
  title: 'Preview Product',
  price: 9.99,
  priceString: '$9.99',
  pricePerWeek: 2.50,
  pricePerMonth: 9.99,
  pricePerYear: 99.99,
  pricePerWeekString: '$2.50',
  pricePerMonthString: '$9.99',
  pricePerYearString: '$99.99',
  currencyCode: 'USD',
  introPrice: null,
  discounts: null,
  subscriptionPeriod: 'P1M',
  productCategory: PRODUCT_CATEGORY.SUBSCRIPTION,
  productType: PRODUCT_TYPE.AUTO_RENEWABLE_SUBSCRIPTION,
  defaultOption: null,
  subscriptionOptions: null,
  presentedOfferingIdentifier: 'preview-offering',
  presentedOfferingContext: {
    offeringIdentifier: 'preview-offering',
    placementIdentifier: 'preview-placement',
    targetingContext: null
  }
};

const previewPackage: PurchasesPackage = {
  identifier: 'preview-package-id',
  packageType: PACKAGE_TYPE.MONTHLY,
  product: previewStoreProduct,
  offeringIdentifier: 'preview-offering',
  presentedOfferingContext: {
    offeringIdentifier: 'preview-offering',
    placementIdentifier: 'preview-placement',
    targetingContext: null
  }
};

const previewOffering: PurchasesOffering = {
  identifier: 'preview-offering',
  serverDescription: 'Preview offering for testing',
  metadata: {},
  availablePackages: [previewPackage],
  lifetime: null,
  annual: null,
  sixMonth: null,
  threeMonth: null,
  twoMonth: null,
  monthly: previewPackage,
  weekly: null
};

const previewOfferings: PurchasesOfferings = {
  all: {
    'preview-offering': previewOffering
  },
  current: previewOffering
};

/**
 * Preview implementation of the native module for Preview API mode, i.e. for environments where native modules are not available
 * (like Expo Go).
 */
export const previewNativeModuleRNPurchases = {
  setupPurchases: async (
    apiKey: string,
    _appUserID: string | null,
    _purchasesAreCompletedBy: string | null,
    _userDefaultsSuiteName: string | null,
    _storeKitVersion: string | null,
    _useAmazon: boolean,
    _shouldShowInAppMessagesAutomatically: boolean,
    _entitlementVerificationMode: string | null,
    _pendingTransactionsForPrepaidPlansEnabled: boolean,
    _diagnosticsEnabled: boolean
  ) => {
    console.log('[RevenueCat] Preview mode: setupPurchases called with apiKey:', apiKey);
    return null;
  },
  setAllowSharingStoreAccount: async (_allowSharing: boolean) => {
    // In preview mode, do nothing
  },
  setSimulatesAskToBuyInSandbox: async (_simulatesAskToBuyInSandbox: boolean) => {
    // In preview mode, do nothing
  },
  getOfferings: async () => {
    return previewOfferings;
  },
  getCurrentOfferingForPlacement: async (_placementIdentifier: string) => {
    return previewOffering;
  },
  syncAttributesAndOfferingsIfNeeded: async () => {
    return previewOfferings;
  },
  getProductInfo: async (_productIdentifiers: string[], _type: string) => {
    // In preview mode, return the preview product for any requested product identifiers
    return [previewStoreProduct];
  },
  restorePurchases: async () => {
    return previewCustomerInfo;
  },
  getAppUserID: async () => {
    return 'preview-user-id';
  },
  getStorefront: async () => {
    return 'preview-storefront';
  },
  setDebugLogsEnabled: async (_enabled: boolean) => {
    // In preview mode, do nothing
  },
  setLogLevel: async (_level: string) => {
    // In preview mode, do nothing
  },
  setLogHandler: async () => {
    return null;
  },
  getCustomerInfo: async () => {
    return previewCustomerInfo;
  },
  logIn: async (_appUserID: string) => {
    return {
      customerInfo: previewCustomerInfo,
      created: false
    };
  },
  logOut: async () => {
    return previewCustomerInfo;
  },
  syncPurchases: async () => {
  },
  syncAmazonPurchase: async (
    _productID: string,
    _receiptID: string,
    _amazonUserID: string,
    _isoCurrencyCode: string | null,
    _price: number | null
  ) => {
    // In preview mode, do nothing
  },
  syncObserverModeAmazonPurchase: async (
    _productID: string,
    _receiptID: string,
    _amazonUserID: string,
    _isoCurrencyCode: string | null,
    _price: number | null
  ) => {
    // In preview mode, do nothing
  },
  recordPurchaseForProductID: async (_productID: string) => {
    return previewPurchaseStoreTransaction;
  },
  enableAdServicesAttributionTokenCollection: async () => {
  },
  purchaseProduct: async (
    _productIdentifier: string,
    _googleProductChangeInfo: any,
    _type: string,
    _discountTimestamp: string | null,
    _googleInfo: any,
    _presentedOfferingContext: any
  ) => {
    // In preview mode, return a successful purchase result
    return previewMakePurchaseResult;
  },
  purchasePackage: async (
    _packageIdentifier: string,
    _presentedOfferingContext: any,
    _googleProductChangeInfo: any,
    _discountTimestamp: string | null,
    _googleInfo: any
  ) => {
    // In preview mode, return a successful purchase result
    return previewMakePurchaseResult;
  },
  purchaseSubscriptionOption: async (
    _productIdentifier: string,
    _optionIdentifier: string,
    _upgradeInfo: any,
    _discountTimestamp: string | null,
    _googleInfo: any,
    _presentedOfferingContext: any
  ) => {
    // In preview mode, return a successful purchase result
    return previewMakePurchaseResult;
  },
  isAnonymous: async () => {
    return true;
  },
  makeDeferredPurchase: async (_callbackID: number) => {
    // In preview mode, do nothing
  },
  checkTrialOrIntroductoryPriceEligibility: async (productIDs: string[]) => {
    // In preview mode, return eligible for all products
    const result: { [productId: string]: any } = {};
    productIDs.forEach(productId => {
      result[productId] = INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
    });
    return result;
  },
  getPromotionalOffer: async (_productIdentifier: string, _discount: any) => {
    return undefined;
  },
  eligibleWinBackOffersForProductIdentifier: async (_productID: string) => {
    return [];
  },
  purchaseProductWithWinBackOffer: async (_productID: string, _winBackOfferID: string) => {
    return previewMakePurchaseResult;
  },
  purchasePackageWithWinBackOffer: async (_packageID: string, _winBackOfferID: string) => {
    return previewMakePurchaseResult;
  },
  invalidateCustomerInfoCache: async () => {
  },
  presentCodeRedemptionSheet: async () => {
  },
  setAttributes: async (_attributes: any) => {
    // In preview mode, do nothing
  },
  setEmail: async (_email: string) => {
    // In preview mode, do nothing
  },
  setPhoneNumber: async (_phoneNumber: string) => {
    // In preview mode, do nothing
  },
  setDisplayName: async (_displayName: string) => {
    // In preview mode, do nothing
  },
  setPushToken: async (_pushToken: string) => {
    // In preview mode, do nothing
  },
  setProxyURLString: async (_proxyURLString: string) => {
    // In preview mode, do nothing
  },
  collectDeviceIdentifiers: async () => {
  },
  setAdjustID: async (_adjustID: string) => {
    // In preview mode, do nothing
  },
  setAppsflyerID: async (_appsflyerID: string) => {
    // In preview mode, do nothing
  },
  setFBAnonymousID: async (_fbAnonymousID: string) => {
    // In preview mode, do nothing
  },
  setMparticleID: async (_mparticleID: string) => {
    // In preview mode, do nothing
  },
  setCleverTapID: async (_cleverTapID: string) => {
    // In preview mode, do nothing
  },
  setMixpanelDistinctID: async (_mixpanelDistinctID: string) => {
    // In preview mode, do nothing
  },
  setFirebaseAppInstanceID: async (_firebaseAppInstanceID: string) => {
    // In preview mode, do nothing
  },
  setTenjinAnalyticsInstallationID: async (_tenjinAnalyticsInstallationID: string) => {
    // In preview mode, do nothing
  },
  setKochavaDeviceID: async (_kochavaDeviceID: string) => {
    // In preview mode, do nothing
  },
  setOnesignalID: async (_onesignalID: string) => {
    // In preview mode, do nothing
  },
  setAirshipChannelID: async (_airshipChannelID: string) => {
    // In preview mode, do nothing
  },
  setMediaSource: async (_mediaSource: string) => {
    // In preview mode, do nothing
  },
  setMediaCampaign: async () => {
  },
  setCampaign: async (_campaign: string) => {
    // In preview mode, do nothing
  },
  setAdGroup: async (_adGroup: string) => {
    // In preview mode, do nothing
  },
  setAd: async (_ad: string) => {
    // In preview mode, do nothing
  },
  setKeyword: async (_keyword: string) => {
    // In preview mode, do nothing
  },
  setCreative: async (_creative: string) => {
    // In preview mode, do nothing
  },
  canMakePayments: async (_features: any[]) => {
    // In preview mode, return false (no payments can be made)
    return false;
  },
  beginRefundRequestForActiveEntitlement: async () => {
    return 0;
  },
  beginRefundRequestForEntitlementId: async (_entitlementIdentifier: string) => {
    return 0;
  },
  beginRefundRequestForProductId: async (_productIdentifier: string) => {
    return 0;
  },
  showManageSubscriptions: async () => {
  },
  showInAppMessages: async (_messageTypes: any[]) => {
    // In preview mode, do nothing
  },
  isWebPurchaseRedemptionURL: async (_urlString: string) => {
    // In preview mode, we'll return false for any URL
    return false;
  },
  isConfigured: async () => {
    return true;
  },
  redeemWebPurchase: async (_urlString: string) => {
    return {
      result: WebPurchaseRedemptionResultType.SUCCESS,
      customerInfo: previewCustomerInfo
    };
  },
  getVirtualCurrencies: async () => {
    // In preview mode, return empty virtual currencies
    return {
      all: {}
    };
  },
}; 