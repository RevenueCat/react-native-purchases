import { CustomerInfo, MakePurchaseResult, PurchasesStoreTransaction, VERIFICATION_RESULT, WebPurchaseRedemptionResultType } from '@revenuecat/purchases-typescript-internal';

const mockCustomerInfo: CustomerInfo = {
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
  originalAppUserId: 'mock-user-id',
  originalApplicationVersion: null,
  requestDate: new Date().toISOString(),
  managementURL: null,
  originalPurchaseDate: new Date().toISOString(),
  nonSubscriptionTransactions: [],
  subscriptionsByProductIdentifier: {}
};

const mockPurchaseStoreTransaction: PurchasesStoreTransaction = {
  transactionIdentifier: 'mock-transaction-id',
  productIdentifier: 'mock-product-id',
  purchaseDate: new Date().toISOString()
};

const mockMakePurchaseResult: MakePurchaseResult = {
  productIdentifier: 'mock-product-id',
  customerInfo: mockCustomerInfo,
  transaction: mockPurchaseStoreTransaction
};

/**
 * Mock implementation of the native module for Compatibility API mode, i.e. for environments where native modules are not available
 * (like Expo Go).
 */
export const mockNativeModuleRNPurchases = {
  setupPurchases: async () => {
    console.warn('RevenueCat: Running in mock mode');
    return null;
  },
  setAllowSharingStoreAccount: async () => null,
  setSimulatesAskToBuyInSandbox: async () => null,
  getOfferings: async () => ({
    all: {},
    current: null
  }),
  getCurrentOfferingForPlacement: async () => null,
  syncAttributesAndOfferingsIfNeeded: async () => null,
  getProductInfo: async () => [],
  restorePurchases: async () => mockCustomerInfo,
  getAppUserID: async () => 'mock-user-id',
  getStorefront: async () => 'mock-storefront',
  setDebugLogsEnabled: async () => null,
  setLogLevel: async () => null,
  setLogHandler: async () => null,
  getCustomerInfo: async () => mockCustomerInfo,
  logIn: async () => ({
    customerInfo: mockCustomerInfo,
    created: false
  }),
  logOut: async () => mockCustomerInfo,
  syncPurchases: async () => null,
  syncAmazonPurchase: async () => null,
  syncObserverModeAmazonPurchase: async () => null,
  recordPurchaseForProductID: async () => null,
  enableAdServicesAttributionTokenCollection: async () => null,
  purchaseProduct: async () => {
    console.warn('RevenueCat: Purchases are not available in mock mode');
  },
  purchasePackage: async () => {
    console.warn('RevenueCat: Purchases are not available in mock mode');
  },
  purchaseSubscriptionOption: async () => {
    console.warn('RevenueCat: Purchases are not available in mock mode');
  },
  isAnonymous: async () => true,
  makeDeferredPurchase: async () => null,
  checkTrialOrIntroductoryPriceEligibility: async () => ({}),
  getPromotionalOffer: async () => null,
  eligibleWinBackOffersForProductIdentifier: async () => [],
  purchaseProductWithWinBackOffer: async () => mockMakePurchaseResult,
  purchasePackageWithWinBackOffer: async () => mockMakePurchaseResult,
  invalidateCustomerInfoCache: async () => null,
  presentCodeRedemptionSheet: async () => null,
  setAttributes: async () => null, 
  setEmail: async () => null,
  setPhoneNumber: async () => null,
  setDisplayName: async () => null,
  setPushToken: async () => null,
  setProxyURLString: async () => null,
  collectDeviceIdentifiers: async () => null,
  setAdjustID: async () => null,
  setAppsflyerID: async () => null,
  setFBAnonymousID: async () => null,
  setMparticleID: async () => null,
  setCleverTapID: async () => null,
  setMixpanelDistinctID: async () => null,
  setFirebaseAppInstanceID: async () => null,
  setTenjinAnalyticsInstallationID: async () => null,
  setKochavaDeviceID: async () => null,
  setOnesignalID: async () => null,
  setAirshipChannelID: async () => null,
  setMediaSource: async () => null,
  setMediaCampaign: async () => null,
  setAd: async () => null,
  setKeyword: async () => null,
  setCreative: async () => null,
  canMakePayments: async () => false,
  beginRefundRequestForActiveEntitlement: async () => 0,
  beginRefundRequestForEntitlementId: async () => 0,
  beginRefundRequestForProductId: async () => 0,
  showManageSubscriptions: async () => null,
  showInAppMessages: async () => null,
  isWebPurchaseRedemptionURL: async () => null,
  isConfigured: async () => true,
  redeemWebPurchase: async () => ({
    result: WebPurchaseRedemptionResultType.SUCCESS,
    customerInfo: mockCustomerInfo
  }),
}; 