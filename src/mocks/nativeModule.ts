import { CustomerInfo, VERIFICATION_RESULT } from '@revenuecat/purchases-typescript-internal';

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

/**
 * Mock implementation of the native module for Compatibility API mode, i.e. for environments where native modules are not available
 * (like Expo Go).
 */
export const mockNativeModuleRNPurchases = {
  setupPurchases: async () => {
    console.warn('RevenueCat: Running in mock mode - native module not available');
    return null;
  },
  setAllowSharingStoreAccount: async () => null,
  addAttributionData: async () => null,
  getOfferings: async () => ({
    all: {},
    current: null
  }),
  getCurrentOfferingForPlacement: async () => null,
  syncAttributesAndOfferingsIfNeeded: async () => null,
  getProductInfo: async () => [],
  makePurchase: async () => {
    throw new Error('Purchases are not available in mock mode');
  },
  restorePurchases: async () => {
    throw new Error('Restore purchases is not available in mock mode');
  },
  getAppUserID: async () => 'mock-user-id',
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
  purchaseProduct: async () => {
    throw new Error('Purchases are not available in mock mode');
  },
  purchasePackage: async () => {
    throw new Error('Purchases are not available in mock mode');
  },
  purchaseSubscriptionOption: async () => {
    throw new Error('Purchases are not available in mock mode');
  },
  isAnonymous: async () => true,
  makeDeferredPurchase: async () => {
    throw new Error('Purchases are not available in mock mode');
  },
  checkTrialOrIntroductoryPriceEligibility: async () => ({}),
  purchaseDiscountedPackage: async () => {
    throw new Error('Purchases are not available in mock mode');
  },
  purchaseDiscountedProduct: async () => {
    throw new Error('Purchases are not available in mock mode');
  },
  getPromotionalOffer: async () => null,
  invalidateCustomerInfoCache: async () => null,
  setAttributes: async () => null,
  setEmail: async () => null,
  setPhoneNumber: async () => null,
  setDisplayName: async () => null,
  setPushToken: async () => null,
  setCleverTapID: async () => null,
  setMixpanelDistinctID: async () => null,
  setFirebaseAppInstanceID: async () => null,
  setTenjinAnalyticsInstallationID: async () => null,
  setKochavaDeviceID: async () => null,
  canMakePayments: async () => false,
  beginRefundRequestForActiveEntitlement: async () => {
    throw new Error('Refunds are not available in mock mode');
  },
  beginRefundRequestForEntitlementId: async () => {
    throw new Error('Refunds are not available in mock mode');
  },
  beginRefundRequestForProductId: async () => {
    throw new Error('Refunds are not available in mock mode');
  },
  showInAppMessages: async () => null,
  isConfigured: async () => true,
  parseAsWebPurchaseRedemption: async () => null,
  redeemWebPurchase: async () => null
}; 