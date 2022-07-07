import {
  PurchaserInfo,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesPaymentDiscount,
  PurchasesProduct,
  UpgradeInfo,
  MakePurchaseResult,
  PURCHASE_TYPE, PurchasesDiscount, BILLING_FEATURE, IntroEligibility,
  LogInResult, ShouldPurchasePromoProductListener, PurchaserInfoUpdateListener
} from '../dist';

import Purchases from '../dist/purchases';

async function checkPurchases(purchases: Purchases) {
  const productIds: string[] = [];

  const offerings: PurchasesOfferings = await Purchases.getOfferings();
  const products: PurchasesProduct[] = await Purchases.getProducts(
    productIds,
    PURCHASE_TYPE.INAPP
  );

  const purchaserInfo: PurchaserInfo = await Purchases.restoreTransactions();
}

async function checkUsers(purchases: Purchases) {
  const userId: string = await Purchases.getAppUserID();

  const result: LogInResult = await Purchases.logIn(userId);
  const info1: PurchaserInfo = await Purchases.logOut();
  const info2: PurchaserInfo = await Purchases.getPurchaserInfo();
  const anonymous: boolean = await Purchases.isAnonymous();
}

async function checkPurchasing(purchases: Purchases,
                               product: PurchasesProduct,
                               discount: PurchasesDiscount,
                               paymentDiscount: PurchasesPaymentDiscount,
                               pack: PurchasesPackage) {
  const productId: string = ""
  const productIds: string[] = [productId];
  const upgradeInfo: UpgradeInfo | null = null;
  const features: BILLING_FEATURE[] = [];

  const paymentDiscount2: PurchasesPaymentDiscount | undefined = await Purchases.getPaymentDiscount(
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
  const userDefaultsSuiteName: string = "";

  Purchases.setup(
    aString,
    userID,
    observerMode
  );
  Purchases.setup(
    aString,
    userID,
    observerMode,
    userDefaultsSuiteName
  );

  await Purchases.setProxyURL(aString);
  await Purchases.setDebugLogsEnabled(true);
  await Purchases.setSimulatesAskToBuyInSandbox(true);
  await Purchases.setFinishTransactions(true);

  const configured: boolean = await Purchases.isConfigured();
}

function checkListeners() {
  const purchaserInfoUpdateListener: PurchaserInfoUpdateListener = purchaserInfo => {};
  const shouldPurchaseListener: ShouldPurchasePromoProductListener = deferredPurchase => {};

  Purchases.addPurchaserInfoUpdateListener(purchaserInfoUpdateListener);
  Purchases.removePurchaserInfoUpdateListener(purchaserInfoUpdateListener);

  Purchases.addShouldPurchasePromoProductListener(shouldPurchaseListener);
  Purchases.removeShouldPurchasePromoProductListener(shouldPurchaseListener);
}
