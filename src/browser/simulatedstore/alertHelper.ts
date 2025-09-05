import { Alert } from "react-native";
import { PurchasesPackage } from "@revenuecat/purchases-typescript-internal";
import { loadSimulatedPurchaseData, SimulatedPurchaseData } from "./offeringsLoader";

/**
 * Shows a simulated purchase alert for platforms that don't support DOM manipulation.
 */
export function showSimulatedPurchaseAlert(
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