import {
  ENTITLEMENT_VERIFICATION_MODE,
  IN_APP_MESSAGE_TYPE,
  PurchasesError,
  PurchasesOffering,
  PurchasesVirtualCurrencies,
  Storefront,
  WebPurchaseRedemption,
  WebPurchaseRedemptionResult,
  WebPurchaseRedemptionResultType,
} from "@revenuecat/purchases-typescript-internal";
import {
  CustomerInfo,
  PurchasesEntitlementInfo,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesPromotionalOffer,
  PurchasesStoreProduct,
  UpgradeInfo,
  MakePurchaseResult,
  LOG_LEVEL,
  REFUND_REQUEST_STATUS,
  PURCHASE_TYPE,
  PurchasesStoreProductDiscount,
  BILLING_FEATURE,
  IntroEligibility,
  LogInResult,
  ShouldPurchasePromoProductListener,
  CustomerInfoUpdateListener,
  PurchasesAreCompletedBy,
  PurchasesAreCompletedByMyApp,
  PURCHASES_ARE_COMPLETED_BY_TYPE,
  STOREKIT_VERSION,
} from "../dist";

import Purchases from "../dist/purchases";
import { GoogleProductChangeInfo, SubscriptionOption } from "../src";

async function checkPurchases(purchases: Purchases) {
  const productIds: string[] = [];

  const offerings: PurchasesOfferings = await Purchases.getOfferings();
  const currentOfferingForPlacement: PurchasesOffering | null =
    await Purchases.getCurrentOfferingForPlacement("");
  const products: PurchasesStoreProduct[] = await Purchases.getProducts(
    productIds,
    PURCHASE_TYPE.INAPP
  );

  const newOfferings: PurchasesOfferings =
    await Purchases.syncAttributesAndOfferingsIfNeeded();

  const customerInfo: CustomerInfo = await Purchases.restorePurchases();

  await Purchases.presentCodeRedemptionSheet();
  await Purchases.invalidateCustomerInfoCache();
}

async function checkUsers(purchases: Purchases) {
  const userId: string = await Purchases.getAppUserID();
  const storefront: Storefront | null = await Purchases.getStorefront();

  const result: LogInResult = await Purchases.logIn(userId);
  const info1: CustomerInfo = await Purchases.logOut();
  const info2: CustomerInfo = await Purchases.getCustomerInfo();
  const anonymous: boolean = await Purchases.isAnonymous();
}

async function checkPurchasing(
  purchases: Purchases,
  product: PurchasesStoreProduct,
  discount: PurchasesStoreProductDiscount,
  paymentDiscount: PurchasesPromotionalOffer,
  pack: PurchasesPackage,
  subscriptionOption: SubscriptionOption,
  upgradeInfo: UpgradeInfo,
  googleProductChangeInfo: GoogleProductChangeInfo
) {
  const productId: string = "";
  const productIds: string[] = [productId];
  const features: BILLING_FEATURE[] = [];
  const messageTypes: IN_APP_MESSAGE_TYPE[] = [];
  const googleIsPersonalizedPrice: boolean = false;

  const paymentDiscount2: PurchasesPromotionalOffer | undefined =
    await Purchases.getPromotionalOffer(product, discount);

  const productResult1: MakePurchaseResult = await Purchases.purchaseProduct(
    productId,
    upgradeInfo,
    PURCHASE_TYPE.INAPP
  );

  const storeProductResult1: MakePurchaseResult =
    await Purchases.purchaseStoreProduct(product, googleProductChangeInfo);
  const storeProductResult2: MakePurchaseResult =
    await Purchases.purchaseStoreProduct(
      product,
      googleProductChangeInfo,
      googleIsPersonalizedPrice
    );

  const discountedProductResult1: MakePurchaseResult =
    await Purchases.purchaseDiscountedProduct(product, paymentDiscount);

  const packageResult1: MakePurchaseResult = await Purchases.purchasePackage(
    pack,
    upgradeInfo
  );
  const packageResult2: MakePurchaseResult = await Purchases.purchasePackage(
    pack,
    upgradeInfo,
    null,
    googleIsPersonalizedPrice
  );
  const packageResult3: MakePurchaseResult = await Purchases.purchasePackage(
    pack,
    null,
    googleProductChangeInfo,
    googleIsPersonalizedPrice
  );

  const discountedPackageResult1: MakePurchaseResult =
    await Purchases.purchaseDiscountedPackage(pack, paymentDiscount);

  const subscriptionOptionResult1: MakePurchaseResult =
    await Purchases.purchaseSubscriptionOption(
      subscriptionOption,
      googleProductChangeInfo
    );
  const subscriptionOptionResult2: MakePurchaseResult =
    await Purchases.purchaseSubscriptionOption(
      subscriptionOption,
      googleProductChangeInfo,
      googleIsPersonalizedPrice
    );

  const syncPurchases: void = await Purchases.syncPurchases();

  const canMakePayments1: boolean = await Purchases.canMakePayments();
  const canMakePayments2: boolean = await Purchases.canMakePayments(features);

  const introEligibilities: {
    [p: string]: IntroEligibility;
  } = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);

  await Purchases.showInAppMessages();
  await Purchases.showInAppMessages(messageTypes);

  const manageSubscriptions: void = await Purchases.showManageSubscriptions();
}

async function checkConfigure() {
  const apiKey: string = "";
  const appUserID: string | null = "";
  var purchasesAreCompletedBy: PurchasesAreCompletedBy =
    PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT;
  const storeKitVersion: STOREKIT_VERSION = STOREKIT_VERSION.DEFAULT;
  const useAmazon: boolean = true;
  const entitlementVerificationMode: ENTITLEMENT_VERIFICATION_MODE =
    Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL;
  const userDefaultsSuiteName: string = "";
  const shouldShowInAppMessagesAutomatically: boolean = true;
  const diagnosticsEnabled: boolean = true;
  const automaticDeviceIdentifierCollectionEnabled: boolean = true;

  // PurchasesAreCompletedBy == REVENUECAT
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    entitlementVerificationMode,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    entitlementVerificationMode,
    useAmazon,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    useAmazon,
    shouldShowInAppMessagesAutomatically,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    useAmazon,
    shouldShowInAppMessagesAutomatically,
    diagnosticsEnabled,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    useAmazon,
    shouldShowInAppMessagesAutomatically,
    diagnosticsEnabled,
    automaticDeviceIdentifierCollectionEnabled,
  });

  // PurchasesAreCompletedBy == MY_APP
  purchasesAreCompletedBy = {
    type: PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP,
    storeKitVersion: STOREKIT_VERSION.STOREKIT_1,
  };
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    entitlementVerificationMode,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    entitlementVerificationMode,
    useAmazon,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    useAmazon,
    shouldShowInAppMessagesAutomatically,
  });
  Purchases.configure({
    apiKey,
    appUserID,
    purchasesAreCompletedBy,
    userDefaultsSuiteName,
    storeKitVersion,
    useAmazon,
    shouldShowInAppMessagesAutomatically,
    diagnosticsEnabled,
    automaticDeviceIdentifierCollectionEnabled,
  });

  await Purchases.setProxyURL("");
  await Purchases.setDebugLogsEnabled(true);
  await Purchases.setSimulatesAskToBuyInSandbox(true);
  await Purchases.setAllowSharingStoreAccount(true);

  const configured: boolean = await Purchases.isConfigured();
}

async function checkRecordPurchase() {
  await Purchases.recordPurchase("productID");
}

async function checkLogLevel() {
  await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
}

async function checkLogLevelEnum(level: LOG_LEVEL) {
  switch (level) {
    case LOG_LEVEL.DEBUG:
    case LOG_LEVEL.VERBOSE:
    case LOG_LEVEL.INFO:
    case LOG_LEVEL.WARN:
    case LOG_LEVEL.ERROR:
  }
}

async function checkEntitlementVerificationModeEnum(
  mode: ENTITLEMENT_VERIFICATION_MODE
) {
  switch (mode) {
    case ENTITLEMENT_VERIFICATION_MODE.DISABLED:
    case ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL:
    // Add back when adding enforced support.
    // case ENTITLEMENT_VERIFICATION_MODE.ENFORCED:
  }
}

function checkListeners() {
  const customerInfoUpdateListener: CustomerInfoUpdateListener = (
    customerInfo
  ) => {};
  const shouldPurchaseListener: ShouldPurchasePromoProductListener = (
    deferredPurchase
  ) => {};

  Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);
  Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);

  Purchases.addShouldPurchasePromoProductListener(shouldPurchaseListener);
  Purchases.removeShouldPurchasePromoProductListener(shouldPurchaseListener);
}

async function checkBeginRefundRequest(
  entitlementInfo: PurchasesEntitlementInfo,
  storeProduct: PurchasesStoreProduct
) {
  const refundStatus1: REFUND_REQUEST_STATUS =
    await Purchases.beginRefundRequestForActiveEntitlement();
  const refundStatus2: REFUND_REQUEST_STATUS =
    await Purchases.beginRefundRequestForEntitlement(entitlementInfo);
  const refundStatus3: REFUND_REQUEST_STATUS =
    await Purchases.beginRefundRequestForProduct(storeProduct);
}

async function checkSyncAmazonPurchase(
  productID: string,
  receiptID: string,
  amazonUserID: string,
  isoCurrencyCode?: string | null,
  price?: number | null
): Promise<void> {
  return Purchases.syncAmazonPurchase(
    productID,
    receiptID,
    amazonUserID,
    isoCurrencyCode,
    price
  );
}

async function checkSyncObserverModeAmazonPurchase(
  productID: string,
  receiptID: string,
  amazonUserID: string,
  isoCurrencyCode?: string | null,
  price?: number | null
): Promise<void> {
  return Purchases.syncObserverModeAmazonPurchase(
    productID,
    receiptID,
    amazonUserID,
    isoCurrencyCode,
    price
  );
}

async function checkFetchAndPurchaseWinBackOffersForProduct(
  product: PurchasesStoreProduct
): Promise<MakePurchaseResult> {
  const offers = await Purchases.getEligibleWinBackOffersForProduct(product);

  if (!offers || offers.length < 1) {
    throw new Error("No eligible win-back offers available for the product.");
  }
  return await Purchases.purchaseProductWithWinBackOffer(product, offers[0]);
}

async function checkFetchAndPurchaseWinBackOffersForPackage(
  aPackage: PurchasesPackage
): Promise<MakePurchaseResult> {
  const offers = await Purchases.getEligibleWinBackOffersForPackage(aPackage);

  if (!offers || offers.length < 1) {
    throw new Error("No eligible win-back offers available for the package.");
  }
  return await Purchases.purchasePackageWithWinBackOffer(aPackage, offers[0]);
}

async function checkWebRedemption() {
  const webPurchaseRedemption: WebPurchaseRedemption | null = await Purchases.parseAsWebPurchaseRedemption("");
  const result: WebPurchaseRedemptionResult = await Purchases.redeemWebPurchase(webPurchaseRedemption!);
  const webPurchaseRedemptionResultType: WebPurchaseRedemptionResultType = result.result;
  switch (result.result) {
    case WebPurchaseRedemptionResultType.SUCCESS:
      const customerInfo: CustomerInfo = result.customerInfo;
      break;
    case WebPurchaseRedemptionResultType.ERROR:
      const error: PurchasesError = result.error;
      break;
    case WebPurchaseRedemptionResultType.PURCHASE_BELONGS_TO_OTHER_USER:
    case WebPurchaseRedemptionResultType.INVALID_TOKEN:
      break;
    case WebPurchaseRedemptionResultType.EXPIRED:
      const obfuscatedEmail: string = result.obfuscatedEmail;
      break;
  }
}

async function checkGetVirtualCurrencies() {
  const virtualCurrencies: PurchasesVirtualCurrencies = await Purchases.getVirtualCurrencies();
}

async function checkInvalidateVirtualCurrenciesCache() {
  await Purchases.invalidateVirtualCurrenciesCache();
}

async function checkGetCachedVirtualCurrencies() {
  const cachedVirtualCurrencies: PurchasesVirtualCurrencies | null = await Purchases.getCachedVirtualCurrencies();
}
