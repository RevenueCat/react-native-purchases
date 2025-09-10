import { MakePurchaseResult, PURCHASES_ERROR_CODE, PurchasesPackage } from "@revenuecat/purchases-typescript-internal";
import { PurchasesCommon } from "@revenuecat/purchases-js-hybrid-mappings";
import { showSimulatedPurchaseAlert } from "./alertHelper";

// This will allow only to purchase simulated products in Expo Go since 
// neither StoreKit, Play Store, nor Web Billing store are available.
export async function purchaseSimulatedPackage(packageIdentifier: string, presentedOfferingContext: any): Promise<MakePurchaseResult> {
  const offeringIdentifier = presentedOfferingContext?.offeringIdentifier;
  if (!offeringIdentifier) {
    throw new Error('No offering identifier provided in presentedOfferingContext');
  }

  return new Promise((resolve, reject) => {
    const handlePurchase = async (_: PurchasesPackage) => {
      try {
        // @ts-expect-error Using internal method
        const purchaseResult: MakePurchaseResult = await PurchasesCommon.getInstance()._purchaseSimulatedStorePackage(
          {
            packageIdentifier: packageIdentifier,
            presentedOfferingContext: presentedOfferingContext,
          },
        );
        resolve(purchaseResult as MakePurchaseResult);
      } catch (error) {
        reject(error);
      }
    };

    const handleFailedPurchase = () => {
      reject({
        code: PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR,
        userCancelled: false,
        message: 'Test purchase failure: no real transaction occurred'
      });
    };

    const handleCancel = () => {
      reject({
        code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
        userCancelled: true,
        message: 'User cancelled purchase.'
      });
    };

    showSimulatedPurchaseAlert(
      packageIdentifier,
      offeringIdentifier,
      handlePurchase,
      handleFailedPurchase,
      handleCancel
    ).catch(reject);
  });
}

