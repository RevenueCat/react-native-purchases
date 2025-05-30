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
  setupPurchases: async () => {
    return null;
  },
  setAllowSharingStoreAccount: async () => {
    return null;
  },
  setSimulatesAskToBuyInSandbox: async () => {
    return null;
  },
  getOfferings: async () => {
    return previewOfferings;
  },
  getCurrentOfferingForPlacement: async () => {
    return previewOffering;
  },
  syncAttributesAndOfferingsIfNeeded: async () => {
    return previewOfferings;
  },
  getProductInfo: async () => {
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
  setDebugLogsEnabled: async () => {
    return null;
  },
  setLogLevel: async () => {
    return null;
  },
  setLogHandler: async () => {
    return null;
  },
  getCustomerInfo: async () => {
    return previewCustomerInfo;
  },
  logIn: async () => {
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
  syncAmazonPurchase: async () => {
  },
  syncObserverModeAmazonPurchase: async () => {
  },
  recordPurchaseForProductID: async () => {
    return previewPurchaseStoreTransaction
  },
  enableAdServicesAttributionTokenCollection: async () => {
  },
  purchaseProduct: async () => {
    return previewMakePurchaseResult;
  },
  purchasePackage: async () => {
    return previewMakePurchaseResult;
  },
  purchaseSubscriptionOption: async () => {
  },
  isAnonymous: async () => {
    return true;
  },
  makeDeferredPurchase: async () => {
    return null;
  },
  checkTrialOrIntroductoryPriceEligibility: async () => {
    return ({
      'preview-product-id': INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE
    });
  },
  getPromotionalOffer: async () => {
    return undefined;
  },
  eligibleWinBackOffersForProductIdentifier: async () => {
    return [];
  },
  purchaseProductWithWinBackOffer: async () => {
    return previewMakePurchaseResult;
  },
  purchasePackageWithWinBackOffer: async () => {
    return previewMakePurchaseResult;
  },
  invalidateCustomerInfoCache: async () => {
  },
  presentCodeRedemptionSheet: async () => {
  },
  setAttributes: async () => {
  },
  setEmail: async () => {
  },
  setPhoneNumber: async () => {
  },
  setDisplayName: async () => {
  },
  setPushToken: async () => {
  },
  setProxyURLString: async () => {
  },
  collectDeviceIdentifiers: async () => {
  },
  setAdjustID: async () => {
  },
  setAppsflyerID: async () => {
  },
  setFBAnonymousID: async () => {
  },
  setMparticleID: async () => {
  },
  setCleverTapID: async () => {
  },
  setMixpanelDistinctID: async () => {
  },
  setFirebaseAppInstanceID: async () => {
  },
  setTenjinAnalyticsInstallationID: async () => {
  },
  setKochavaDeviceID: async () => {
  },
  setOnesignalID: async () => {
  },
  setAirshipChannelID: async () => {
  },
  setMediaSource: async () => {
  },
  setMediaCampaign: async () => {
  },
  setCampaign: async () => {
  },
  setAdGroup: async () => {
  },
  setAd: async () => {
  },
  setKeyword: async () => {
  },
  setCreative: async () => {
  },
  canMakePayments: async () => {
    return false;
  },
  beginRefundRequestForActiveEntitlement: async () => {
    return 0;
  },
  beginRefundRequestForEntitlementId: async () => {
    return 0;
  },
  beginRefundRequestForProductId: async () => {
    return 0;
  },
  showManageSubscriptions: async () => {
  },
  showInAppMessages: async () => {
  },
  isWebPurchaseRedemptionURL: async () => {
    return null;
  },
  isConfigured: async () => {
    return true;
  },
  redeemWebPurchase: async () => {
    return {
      result: WebPurchaseRedemptionResultType.SUCCESS,
      customerInfo: previewCustomerInfo
    };
  },
}; 