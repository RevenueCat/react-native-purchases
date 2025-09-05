import { MakePurchaseResult, PurchasesPackage } from "@revenuecat/purchases-typescript-internal";
import { PurchasesCommon } from "@revenuecat/purchases-js-hybrid-mappings";
import { isPurchasesOfferings, validateAndTransform } from "../typeGuards";
import { Alert } from "react-native";

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

interface SimulatedPurchaseData {
  packageInfo: PurchasesPackage;
  offers: string[];
}

/**
 * Loads package data and formats offer information
 */
async function loadSimulatedPurchaseData(packageIdentifier: string, offeringIdentifier: string): Promise<SimulatedPurchaseData> {
  const offeringsResult = await PurchasesCommon.getInstance().getOfferings();
  const offerings = validateAndTransform(offeringsResult, isPurchasesOfferings, 'PurchasesOfferings');

  const targetOffering = offerings.all[offeringIdentifier];
  if (!targetOffering) {
    throw new Error(`Offering with identifier ${offeringIdentifier} not found`);
  }

  const targetPackage = targetOffering.availablePackages.find(
    (pkg: PurchasesPackage) => pkg.identifier === packageIdentifier
  );

  if (!targetPackage) {
    throw new Error(`Package with identifier ${packageIdentifier} not found in offering ${offeringIdentifier}`);
  }

  // Build offers array
  const offers: string[] = [];
  if (targetPackage.product.introPrice) {
    offers.push(`Intro: ${targetPackage.product.introPrice.priceString} for ${targetPackage.product.introPrice.cycles} ${targetPackage.product.introPrice.periodUnit.toLowerCase()}(s)`);
  }
  if (targetPackage.product.discounts && targetPackage.product.discounts.length > 0) {
    targetPackage.product.discounts.forEach(discount => {
      offers.push(`Discount: ${discount.priceString} for ${discount.cycles} ${discount.periodUnit.toLowerCase()}(s)`);
    });
  }

  return { packageInfo: targetPackage, offers };
}

/**
 * Shows a simulated purchase alert for platforms that don't support DOM manipulation.
 */
function showSimulatedPurchaseAlert(
  packageIdentifier: string, 
  offeringIdentifier: string,
  onPurchase: (packageInfo: PurchasesPackage) => Promise<void>,
  onCancel: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const handleCancel = () => {
      onCancel();
      resolve();
    };

    const handlePurchase = async (data: SimulatedPurchaseData) => {
      try {
        await onPurchase(data.packageInfo);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    loadSimulatedPurchaseData(packageIdentifier, offeringIdentifier)
      .then((data) => {
        const { packageInfo, offers } = data;

        let message = `⚠️ This is a test purchase and should only be used during development. In production, use an Apple/Google API key from RevenueCat.\n\n`;
        message += `Package ID: ${packageInfo.identifier}\n`;
        message += `Product ID: ${packageInfo.product.identifier}\n`;
        message += `Title: ${packageInfo.product.title}\n`;
        message += `Price: ${packageInfo.product.priceString}\n`;

        if (packageInfo.product.subscriptionPeriod) {
          message += `Period: ${packageInfo.product.subscriptionPeriod}\n`;
        }

        if (offers.length > 0) {
          message += `\nOffers:\n${offers.map(offer => `• ${offer}`).join('\n')}`;
        }

        Alert.alert(
          'Test Purchase',
          message,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: handleCancel,
            },
            {
              text: 'Test Purchase',
              onPress: () => handlePurchase(data),
            },
          ],
          { cancelable: true, onDismiss: handleCancel }
        );
      })
      .catch((error) => {
        console.error('Error loading package details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        Alert.alert(
          'Test Purchase Error',
          `Error loading package details: ${errorMessage}`,
          [
            {
              text: 'Close',
              onPress: handleCancel,
            },
          ],
          { cancelable: true, onDismiss: handleCancel }
        );
      });
  });
}