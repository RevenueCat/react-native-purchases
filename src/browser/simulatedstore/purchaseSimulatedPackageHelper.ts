import { MakePurchaseResult, PurchasesPackage } from "@revenuecat/purchases-typescript-internal";
import { showSimulatedPurchaseAlert } from './showSimulatedPurchaseAlert';

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

    const handleCancel = () => {
      reject({
        code: '1',
        userCancelled: true,
        message: 'User cancelled purchase.'
      });
    };

    showSimulatedPurchaseAlert(packageIdentifier, offeringIdentifier, handlePurchase, handleCancel)
        .catch(reject);
  });
}