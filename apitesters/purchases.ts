import {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesPromotionalOffer,
  PurchasesStoreProduct,
  UpgradeInfo,
  MakePurchaseResult,
  PURCHASE_TYPE, PurchasesStoreProductDiscount, BILLING_FEATURE, IntroEligibility,
  LogInResult, ShouldPurchasePromoProductListener, CustomerInfoUpdateListener
} from '../dist';

import Purchases from '../dist/purchases';

async function checkPurchases(purchases: Purchases) {
  const productIds: string[] = [];

  const offerings: PurchasesOfferings = await Purchases.getOfferings();
  const products: PurchasesStoreProduct[] = await Purchases.getProducts(
    productIds,
    PURCHASE_TYPE.INAPP
  );

  const customerInfo: CustomerInfo = await Purchases.restoreTransactions();
}

async function checkUsers(purchases: Purchases) {
  const userId: string = await Purchases.getAppUserID();

  const result: LogInResult = await Purchases.logIn(userId);
  const info1: CustomerInfo = await Purchases.logOut();
  const info2: CustomerInfo = await Purchases.getCustomerInfo();
  const anonymous: boolean = await Purchases.isAnonymous();
}

async function checkPurchasing(purchases: Purchases,
                               product: PurchasesStoreProduct,
                               discount: PurchasesStoreProductDiscount,
                               paymentDiscount: PurchasesPromotionalOffer,
                               pack: PurchasesPackage) {
  const productId: string = ""
  const productIds: string[] = [productId];
  const upgradeInfo: UpgradeInfo | null = null;
  const features: BILLING_FEATURE[] = [];

  const paymentDiscount2: PurchasesPromotionalOffer | undefined = await Purchases.getPromotionalOffer(
    product,
    discount,
  );

  const result1: MakePurchaseResult = await Purchases.purchaseProduct(
    productId,
    upgradeInfo,
    PURCHASE_TYPE.INAPP
  );

  const result2: MakePurchaseResult = await Purchases.purchaseDiscountedProduct(
    product,
    paymentDiscount
  );

  const result3: MakePurchaseResult = await Purchases.purchasePackage(
    pack,
    upgradeInfo
  );

  const result4: MakePurchaseResult = await Purchases.purchaseDiscountedPackage(
    pack,
    paymentDiscount
  );

  const syncPurchases: void = await Purchases.syncPurchases();

  const canMakePayments1: boolean = await Purchases.canMakePayments();
  const canMakePayments2: boolean = await Purchases.canMakePayments(features);

  const introEligibilities: { [p: string]: IntroEligibility } = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);
}

async function checkSetup() {
  const aString: string = "";
  const userID: string | null = "";
  const observerMode: boolean = false;
  const usesStoreKit2IfAvailable: boolean = true;
  const userDefaultsSuiteName: string = "";

  Purchases.configure(
    aString,
    userID,
    observerMode
  );
  Purchases.configure(
    aString,
    userID,
    observerMode,
    userDefaultsSuiteName
  );
  Purchases.configure(
    aString,
    userID,
    observerMode,
    userDefaultsSuiteName,
    usesStoreKit2IfAvailable
  );

  await Purchases.setProxyURL(aString);
  await Purchases.setDebugLogsEnabled(true);
  await Purchases.setSimulatesAskToBuyInSandbox(true);
  await Purchases.setFinishTransactions(true);

  const configured: boolean = await Purchases.isConfigured();
}

function checkListeners() {
  const customerInfoUpdateListener: CustomerInfoUpdateListener = customerInfo => {};
  const shouldPurchaseListener: ShouldPurchasePromoProductListener = deferredPurchase => {};

  Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);
  Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);

  Purchases.addShouldPurchasePromoProductListener(shouldPurchaseListener);
  Purchases.removeShouldPurchasePromoProductListener(shouldPurchaseListener);
}
