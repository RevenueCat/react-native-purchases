import {PurchasesOfferings, PurchasesProduct, UpgradeInfo} from '../dist';
import Purchases from '../dist/purchases';
import {PURCHASE_TYPE} from '../src';

async function checkPurchases(purchases: Purchases) {
  const productId: string = ""
  const productIds: string[] = [productId];
  const upgradeInfo: UpgradeInfo | null = null;

  const offerings: PurchasesOfferings = await Purchases.getOfferings();
  const products: PurchasesProduct[] = await Purchases.getProducts(
    productIds,
    PURCHASE_TYPE.INAPP
  );

  await Purchases.purchaseProduct(
    productId,
    upgradeInfo,
    PURCHASE_TYPE.INAPP
  );
}
