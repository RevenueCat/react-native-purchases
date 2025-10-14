import {
  INTRO_ELIGIBILITY_STATUS,
  MakePurchaseResult,
} from '@revenuecat/purchases-typescript-internal';
import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';
import { validateAndTransform, isCustomerInfo, isPurchasesOfferings, isPurchasesOffering, isLogInResult, isMakePurchaseResult, isPurchasesVirtualCurrencies } from './typeGuards';
import { isExpoGo, isRorkSandbox } from '../utils/environment';
import { ensurePurchasesConfigured, methodNotSupportedOnWeb } from './utils';
import { purchaseSimulatedPackage } from './simulatedstore/purchaseSimulatedPackageHelper';


const packageVersion = '9.1.0';

/**
 * Browser implementation of the native module. This will be used in the browser and Expo Go.
 */
export const browserNativeModuleRNPurchases = {
  setupPurchases: (
    apiKey: string,
    appUserID: string | null,
    _purchasesAreCompletedBy: string | null,
    _userDefaultsSuiteName: string | null,
    _storeKitVersion: string | null,
    _useAmazon: boolean,
    _shouldShowInAppMessagesAutomatically: boolean,
    _entitlementVerificationMode: string | null,
    _pendingTransactionsForPrepaidPlansEnabled: boolean,
    _diagnosticsEnabled: boolean,
    _automaticDeviceIdentifierCollectionEnabled: boolean,
    _preferredUILocaleOverride: string | null
  ) => {
    try {
      // Make sure that when running in Expo Go or Rork sandbox a web-compatible API key is used, because the underlying purchases-js error message isn't super clear when a non-compatible API key type is used in this case
      const webPlatformCompatibleApiKeyPrefixList = ['test_', 'rcb_'];
      const isWebPlatformCompatibleApiKey = webPlatformCompatibleApiKeyPrefixList.some(prefix => apiKey.startsWith(prefix));
      if (!isWebPlatformCompatibleApiKey && (isExpoGo() || isRorkSandbox())) {
        const platform = isRorkSandbox() ? 'Rork sandbox' : 'Expo Go';
        throw new Error(
          `Invalid API key. The native store is not available when running inside ${platform}, please use your Test Store API Key or create a development build in order to use native features. See https://rev.cat/sdk-test-store on how to use the Test Store.`
        );
      }
      
      PurchasesCommon.configure({
        apiKey,
        appUserId: appUserID || undefined,
        flavor: 'react-native',
        flavorVersion: packageVersion,
      });
    } catch (error) {
      console.error('Error configuring Purchases:', error);
      throw error;
    }
  },
  setAllowSharingStoreAccount: async (_allowSharing: boolean) => {
    methodNotSupportedOnWeb('setAllowSharingStoreAccount');
  },
  setSimulatesAskToBuyInSandbox: async (_simulatesAskToBuyInSandbox: boolean) => {
    methodNotSupportedOnWeb('setSimulatesAskToBuyInSandbox');
  },
  getOfferings: async () => {
    ensurePurchasesConfigured();
    const offerings = await PurchasesCommon.getInstance().getOfferings();
    return validateAndTransform(offerings, isPurchasesOfferings, 'PurchasesOfferings');
  },
  getCurrentOfferingForPlacement: async (placementIdentifier: string) => {
    ensurePurchasesConfigured();
    const offering = await PurchasesCommon.getInstance().getCurrentOfferingForPlacement(placementIdentifier);
    return offering ? validateAndTransform(offering, isPurchasesOffering, 'PurchasesOffering') : null;
  },
  syncAttributesAndOfferingsIfNeeded: async () => {
    ensurePurchasesConfigured();
    const offerings = await PurchasesCommon.getInstance().getOfferings();
    return validateAndTransform(offerings, isPurchasesOfferings, 'PurchasesOfferings');
  },
  getProductInfo: async (_productIdentifiers: string[], _type: string) => {
    methodNotSupportedOnWeb('getProductInfo');
  },
  restorePurchases: async () => {
    ensurePurchasesConfigured();
    // For web, restoring purchases just returns current customer info
    const customerInfo = await PurchasesCommon.getInstance().getCustomerInfo();
    return validateAndTransform(customerInfo, isCustomerInfo, 'CustomerInfo');
  },
  getAppUserID: async () => {
    ensurePurchasesConfigured();
    return PurchasesCommon.getInstance().getAppUserId();
  },
  getStorefront: async () => {
    methodNotSupportedOnWeb('getStorefront');
  },
  setDebugLogsEnabled: async (_enabled: boolean) => {
    methodNotSupportedOnWeb('setDebugLogsEnabled');
  },
  setLogLevel: async (level: string) => {
    PurchasesCommon.setLogLevel(level);
  },
  setLogHandler: async (handler: (level: string, message: string) => void) => {
    PurchasesCommon.setLogHandler(handler);
  },
  getCustomerInfo: async () => {
    ensurePurchasesConfigured();
    const customerInfo = await PurchasesCommon.getInstance().getCustomerInfo();
    return validateAndTransform(customerInfo, isCustomerInfo, 'CustomerInfo');
  },
  logIn: async (appUserID: string) => {
    ensurePurchasesConfigured();
    const result = await PurchasesCommon.getInstance().logIn(appUserID);
    return validateAndTransform(result, isLogInResult, 'LogInResult');
  },
  logOut: async () => {
    ensurePurchasesConfigured();
    const customerInfo = await PurchasesCommon.getInstance().logOut();
    return validateAndTransform(customerInfo, isCustomerInfo, 'CustomerInfo');
  },
  syncPurchases: async () => {
    methodNotSupportedOnWeb('syncPurchases');
  },
  syncAmazonPurchase: async (
    _productID: string,
    _receiptID: string,
    _amazonUserID: string,
    _isoCurrencyCode: string | null,
    _price: number | null
  ) => {
    methodNotSupportedOnWeb('syncAmazonPurchase');
  },
  syncObserverModeAmazonPurchase: async (
    _productID: string,
    _receiptID: string,
    _amazonUserID: string,
    _isoCurrencyCode: string | null,
    _price: number | null
  ) => {
    methodNotSupportedOnWeb('syncObserverModeAmazonPurchase');
  },
  recordPurchaseForProductID: async (_productID: string) => {
    methodNotSupportedOnWeb('recordPurchaseForProductID');
  },
  enableAdServicesAttributionTokenCollection: async () => {
    methodNotSupportedOnWeb('enableAdServicesAttributionTokenCollection');
  },
  purchaseProduct: async (
    _productIdentifier: string,
    _googleProductChangeInfo: any,
    _type: string,
    _discountTimestamp: string | null,
    _googleInfo: any,
    _presentedOfferingContext: any
  ) => {
    methodNotSupportedOnWeb('purchaseProduct');
  },
  purchasePackage: async (
    packageIdentifier: string,
    presentedOfferingContext: any,
    _googleProductChangeInfo: any,
    _discountTimestamp: string | null,
    _googleInfo: any
  ): Promise<MakePurchaseResult> => {
    ensurePurchasesConfigured();

    if (isExpoGo() || isRorkSandbox()) {
      return await purchaseSimulatedPackage(packageIdentifier, presentedOfferingContext);
    }

    const purchaseResult = await PurchasesCommon.getInstance().purchasePackage(
      {
        packageIdentifier: packageIdentifier,
        presentedOfferingContext: presentedOfferingContext,
      }
    );
    return validateAndTransform(purchaseResult, isMakePurchaseResult, 'MakePurchaseResult');
  },
  purchaseSubscriptionOption: async (
    _productIdentifier: string,
    _optionIdentifier: string,
    _upgradeInfo: any,
    _discountTimestamp: string | null,
    _googleInfo: any,
    _presentedOfferingContext: any
  ) => {
    methodNotSupportedOnWeb('purchaseSubscriptionOption');
  },
  isAnonymous: async () => {
    ensurePurchasesConfigured();
    return PurchasesCommon.getInstance().isAnonymous();
  },
  makeDeferredPurchase: async (_callbackID: number) => {
    methodNotSupportedOnWeb('makeDeferredPurchase');
  },
  checkTrialOrIntroductoryPriceEligibility: async (productIDs: string[]) => {
    const result: { [productId: string]: any } = {};
    productIDs.forEach(productId => {
      result[productId] = INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN;
    });
    return result;
  },
  getPromotionalOffer: async (_productIdentifier: string, _discount: any) => {
    methodNotSupportedOnWeb('getPromotionalOffer');
  },
  eligibleWinBackOffersForProductIdentifier: async (_productID: string) => {
    methodNotSupportedOnWeb('eligibleWinBackOffersForProductIdentifier');
  },
  purchaseProductWithWinBackOffer: async (_productID: string, _winBackOfferID: string) => {
    methodNotSupportedOnWeb('purchaseProductWithWinBackOffer');
  },
  purchasePackageWithWinBackOffer: async (_packageID: string, _winBackOfferID: string) => {
    methodNotSupportedOnWeb('purchasePackageWithWinBackOffer');
  },
  invalidateCustomerInfoCache: async () => {
    methodNotSupportedOnWeb('invalidateCustomerInfoCache');
  },
  presentCodeRedemptionSheet: async () => {
    methodNotSupportedOnWeb('presentCodeRedemptionSheet');
  },
  setAttributes: async (attributes: { [key: string]: string | null }) => {
    await PurchasesCommon.getInstance().setAttributes(attributes);
  },
  setEmail: async (email: string) => {
    await PurchasesCommon.getInstance().setEmail(email);
  },
  setPhoneNumber: async (phoneNumber: string) => {
    await PurchasesCommon.getInstance().setPhoneNumber(phoneNumber);
  },
  setDisplayName: async (displayName: string) => {
    await PurchasesCommon.getInstance().setDisplayName(displayName);
  },
  setPushToken: async (_pushToken: string) => {
    methodNotSupportedOnWeb('setPushToken');
  },
  setProxyURLString: async (proxyURLString: string) => {
    PurchasesCommon.setProxyUrl(proxyURLString);
  },
  collectDeviceIdentifiers: async () => {
    methodNotSupportedOnWeb('collectDeviceIdentifiers');
  },
  setAdjustID: async (_adjustID: string) => {
    methodNotSupportedOnWeb('setAdjustID');
  },
  setAppsflyerID: async (_appsflyerID: string) => {
    methodNotSupportedOnWeb('setAppsflyerID');
  },
  setFBAnonymousID: async (_fbAnonymousID: string) => {
    methodNotSupportedOnWeb('setFBAnonymousID');
  },
  setMparticleID: async (_mparticleID: string) => {
    methodNotSupportedOnWeb('setMparticleID');
  },
  setCleverTapID: async (_cleverTapID: string) => {
    methodNotSupportedOnWeb('setCleverTapID');
  },
  setMixpanelDistinctID: async (_mixpanelDistinctID: string) => {
    methodNotSupportedOnWeb('setMixpanelDistinctID');
  },
  setFirebaseAppInstanceID: async (_firebaseAppInstanceID: string) => {
    methodNotSupportedOnWeb('setFirebaseAppInstanceID');
  },
  setTenjinAnalyticsInstallationID: async (_tenjinAnalyticsInstallationID: string) => {
    methodNotSupportedOnWeb('setTenjinAnalyticsInstallationID');
  },
  setKochavaDeviceID: async (_kochavaDeviceID: string) => {
    methodNotSupportedOnWeb('setKochavaDeviceID');
  },
  setOnesignalID: async (_onesignalID: string) => {
    methodNotSupportedOnWeb('setOnesignalID');
  },
  setAirshipChannelID: async (_airshipChannelID: string) => {
    methodNotSupportedOnWeb('setAirshipChannelID');
  },
  setMediaSource: async (_mediaSource: string) => {
    methodNotSupportedOnWeb('setMediaSource');
  },
  setMediaCampaign: async () => {
    methodNotSupportedOnWeb('setMediaCampaign');
  },
  setCampaign: async (_campaign: string) => {
    methodNotSupportedOnWeb('setCampaign');
  },
  setAdGroup: async (_adGroup: string) => {
    methodNotSupportedOnWeb('setAdGroup');
  },
  setAd: async (_ad: string) => {
    methodNotSupportedOnWeb('setAd');
  },
  setKeyword: async (_keyword: string) => {
    methodNotSupportedOnWeb('setKeyword');
  },
  setCreative: async (_creative: string) => {
    methodNotSupportedOnWeb('setCreative');
  },
  overridePreferredLocale: async (_locale: string | null) => {
    methodNotSupportedOnWeb('overridePreferredLocale');
  },
  canMakePayments: async (_features: any[]) => {
    return true;
  },
  beginRefundRequestForActiveEntitlement: async () => {
    methodNotSupportedOnWeb('beginRefundRequestForActiveEntitlement');
  },
  beginRefundRequestForEntitlementId: async (_entitlementIdentifier: string) => {
    methodNotSupportedOnWeb('beginRefundRequestForEntitlementId');
  },
  beginRefundRequestForProductId: async (_productIdentifier: string) => {
    methodNotSupportedOnWeb('beginRefundRequestForProductId');
  },
  showManageSubscriptions: async () => {
    methodNotSupportedOnWeb('showManageSubscriptions');
  },
  showInAppMessages: async (_messageTypes: any[]) => {
    methodNotSupportedOnWeb('showInAppMessages');
  },
  isWebPurchaseRedemptionURL: async (_urlString: string) => {
    methodNotSupportedOnWeb('isWebPurchaseRedemptionURL');
  },
  isConfigured: async () => {
    return PurchasesCommon.isConfigured();
  },
  redeemWebPurchase: async (_urlString: string) => {
    methodNotSupportedOnWeb('redeemWebPurchase');
  },
  getVirtualCurrencies: async () => {
    ensurePurchasesConfigured();
    const virtualCurrencies = await PurchasesCommon.getInstance().getVirtualCurrencies();
    return validateAndTransform(virtualCurrencies, isPurchasesVirtualCurrencies, 'PurchasesVirtualCurrencies');
  },
  invalidateVirtualCurrenciesCache: async () => {
    ensurePurchasesConfigured();
    PurchasesCommon.getInstance().invalidateVirtualCurrenciesCache();
  },
  getCachedVirtualCurrencies: async () => {
    ensurePurchasesConfigured();
    const cachedVirtualCurrencies = PurchasesCommon.getInstance().getCachedVirtualCurrencies();
    return cachedVirtualCurrencies ? validateAndTransform(cachedVirtualCurrencies, isPurchasesVirtualCurrencies, 'PurchasesVirtualCurrencies') : null;
  },
};
