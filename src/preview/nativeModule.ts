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
 * Preview implementation of the native module for Compatibility API mode, i.e. for environments where native modules are not available
 * (like Expo Go).
 */
export const previewNativeModuleRNPurchases = {
  setupPurchases: async () => {
    console.warn('RevenueCat: Running in preview mode');
    return null;
  },
  setAllowSharingStoreAccount: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return null;
  },
  setSimulatesAskToBuyInSandbox: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return null;
  },
  getOfferings: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewOfferings;
  },
  getCurrentOfferingForPlacement: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewOffering;
  },
  syncAttributesAndOfferingsIfNeeded: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewOfferings;
  },
  getProductInfo: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return [previewStoreProduct];
  },
  restorePurchases: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewCustomerInfo;
  },
  getAppUserID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return 'preview-user-id';
  },
  getStorefront: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return 'preview-storefront';
  },
  setDebugLogsEnabled: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return null;
  },
  setLogLevel: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return null;
  },
  setLogHandler: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return null;
  },
  getCustomerInfo: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewCustomerInfo;
  },
  logIn: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return {
      customerInfo: previewCustomerInfo,
      created: false
    };
  },
  logOut: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewCustomerInfo;
  },
  syncPurchases: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  syncAmazonPurchase: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  syncObserverModeAmazonPurchase: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  recordPurchaseForProductID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewPurchaseStoreTransaction
  },
  enableAdServicesAttributionTokenCollection: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  purchaseProduct: async () => {
    console.warn('RevenueCat: Purchases are not available in preview mode');
    return previewMakePurchaseResult;
  },
  purchasePackage: async () => {
    console.warn('RevenueCat: Purchases are not available in preview mode');
    return previewMakePurchaseResult;
  },
  purchaseSubscriptionOption: async () => {
    console.warn('RevenueCat: Purchases are not available in preview mode');
  },
  isAnonymous: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return true;
  },
  makeDeferredPurchase: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return null;
  },
  checkTrialOrIntroductoryPriceEligibility: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return ({
      'preview-product-id': INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE
    });
  },
  getPromotionalOffer: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return undefined;
  },
  eligibleWinBackOffersForProductIdentifier: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return [];
  },
  purchaseProductWithWinBackOffer: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewMakePurchaseResult;
  },
  purchasePackageWithWinBackOffer: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return previewMakePurchaseResult;
  },
  invalidateCustomerInfoCache: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  presentCodeRedemptionSheet: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setAttributes: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setEmail: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setPhoneNumber: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setDisplayName: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setPushToken: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setProxyURLString: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  collectDeviceIdentifiers: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setAdjustID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setAppsflyerID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setFBAnonymousID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setMparticleID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setCleverTapID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setMixpanelDistinctID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setFirebaseAppInstanceID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setTenjinAnalyticsInstallationID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setKochavaDeviceID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setOnesignalID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setAirshipChannelID: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setMediaSource: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setMediaCampaign: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setCampaign: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setAdGroup: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setAd: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setKeyword: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  setCreative: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  canMakePayments: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return false;
  },
  beginRefundRequestForActiveEntitlement: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return 0;
  },
  beginRefundRequestForEntitlementId: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return 0;
  },
  beginRefundRequestForProductId: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return 0;
  },
  showManageSubscriptions: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  showInAppMessages: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
  },
  isWebPurchaseRedemptionURL: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return null;
  },
  isConfigured: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return true;
  },
  redeemWebPurchase: async () => {
    console.warn('RevenueCat: In Compatibility API Mode, this method is available but has no effect');
    return {
      result: WebPurchaseRedemptionResultType.SUCCESS,
      customerInfo: previewCustomerInfo
    };
  },
}; 