import 'react-native-get-random-values'; // needed to generate random Ids in purchases-js in RN apps.
import {
  CustomerInfo,
  INTRO_ELIGIBILITY_STATUS,
  MakePurchaseResult,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesStoreTransaction
} from '@revenuecat/purchases-typescript-internal';
import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';
import { Alert } from 'react-native';
import { isExpoGo } from '../utils/environment';

/**
 * Helper function to ensure PurchasesCommon is configured before making API calls
 * @throws {Error} If PurchasesCommon is not configured
 */
function ensurePurchasesConfigured(): void {
  if (!PurchasesCommon.isConfigured()) {
    throw new Error('PurchasesCommon is not configured. Call setupPurchases first.');
  }
}

/**
 * Type guard function type - returns true if value matches type T
 */
type TypeGuard<T> = (value: any) => value is T;

/**
 * Type-safe transformation function that validates purchases-js output matches expected type
 * @param value - The value from purchases-js
 * @param typeGuard - Runtime type guard function that validates the structure
 * @param typeName - String description of expected type for logging
 * @returns The value cast to expected type T
 * @throws {Error} If type validation fails
 */
function validateAndTransform<T>(value: any, typeGuard: TypeGuard<T>, typeName: string): T {
  if (value === null || value === undefined) {
    if (typeName.includes('null')) {
      return value as T;
    }
    console.error(`Type validation failed: Expected ${typeName}, got ${value}`);
    throw new Error(`Type validation failed: Expected ${typeName}, got ${value}`);
  }

  if (typeGuard(value)) {
    return value;
  }

  console.error(`Type validation failed: Expected ${typeName}, got:`, value);
  throw new Error(`Type validation failed: Expected ${typeName}, received invalid structure`);
}

// Type guards for the interfaces we use
function isCustomerInfo(value: any): value is CustomerInfo {
  return value && typeof value === 'object' &&
         typeof value.originalAppUserId === 'string' &&
         typeof value.entitlements === 'object';
}

function isPurchasesOfferings(value: any): value is PurchasesOfferings {
  return value && typeof value === 'object' &&
         typeof value.all === 'object' &&
         (value.current === null || typeof value.current === 'object');
}

function isPurchasesOffering(value: any): value is PurchasesOffering {
  return value && typeof value === 'object' &&
         typeof value.identifier === 'string' &&
         typeof value.serverDescription === 'string' &&
         Array.isArray(value.availablePackages);
}


function isLogInResult(value: any): value is { customerInfo: CustomerInfo; created: boolean } {
  return value && typeof value === 'object' &&
         typeof value.customerInfo === 'object' &&
         typeof value.created === 'boolean' &&
         isCustomerInfo(value.customerInfo);
}

function methodNotSupportedOnWeb(methodName: string): void {
  throw new Error(`${methodName} is not supported on web platform.`);
}

/**
 * Common data for test purchases - used by both modal and alert
 */
interface TestPurchaseData {
  packageInfo: PurchasesPackage;
  offers: string[];
}

/**
 * Creates mock transaction for test purchases
 */
const createMockTransaction = (productId: string): PurchasesStoreTransaction => ({
  transactionIdentifier: `mock_${Date.now()}`,
  productIdentifier: productId,
  purchaseDate: new Date().toISOString(),
});

/**
 * Loads package data and formats offer information
 */
async function loadTestPurchaseData(packageIdentifier: string, offeringIdentifier: string): Promise<TestPurchaseData> {
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

  const packageInfo = targetPackage;

  // Build offers array
  const offers: string[] = [];
  if (packageInfo.product.introPrice) {
    offers.push(`Intro: ${packageInfo.product.introPrice.priceString} for ${packageInfo.product.introPrice.cycles} ${packageInfo.product.introPrice.periodUnit.toLowerCase()}(s)`);
  }
  if (packageInfo.product.discounts && packageInfo.product.discounts.length > 0) {
    packageInfo.product.discounts.forEach(discount => {
      offers.push(`Discount: ${discount.priceString} for ${discount.cycles} ${discount.periodUnit.toLowerCase()}(s)`);
    });
  }

  return { packageInfo, offers };
}

/**
 * Shows a test purchase alert for platforms that don't support DOM manipulation.
 */
function showTestPurchaseAlert(packageIdentifier: string, offeringIdentifier: string): Promise<MakePurchaseResult> {
  return new Promise((resolve, reject) => {
    const handleCancel = () => {
      reject({
        code: '1',
        userCancelled: true,
        message: 'User cancelled purchase.'
      });
    };

    const handlePurchase = async (data: TestPurchaseData) => {
      // TODO: Actually purchase the package.
      const customerInfo = validateAndTransform(await PurchasesCommon.getInstance().getCustomerInfo(), isCustomerInfo, 'CustomerInfo');
      resolve({
        productIdentifier: data.packageInfo.product.identifier,
        customerInfo: customerInfo,
        transaction: createMockTransaction(data.packageInfo.product.identifier), // TODO: get proper transaction data.
      });
    };

    loadTestPurchaseData(packageIdentifier, offeringIdentifier)
      .then((data) => {
        const { packageInfo, offers } = data;

        let message = `⚠️ This is a test purchase and should be tested with real products using an Apple/Google API key from RevenueCat.\n\n`;
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

/**
 * Shows the test purchase modal using DOM manipulation and returns a promise that resolves when the modal is dismissed
 */
function showTestPurchaseModal(packageIdentifier: string, offeringIdentifier: string): Promise<MakePurchaseResult> {
  return new Promise((resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    `;

    // Function to determine if device should use mobile layout
    const isMobileLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Use mobile layout for phones (width <= 768px) or when height is very constrained
      return width <= 768 || (width <= 1024 && height <= 600);
    };

    // Function to apply responsive styles to modal
    const applyModalStyles = () => {
      const mobile = isMobileLayout();
      modal.style.cssText = mobile ? `
        width: 100%;
        height: 100%;
        background-color: white;
        padding: 24px;
        padding-top: 60px;
        overflow-y: auto;
      ` : `
        max-width: 500px;
        width: 90%;
        max-height: 80%;
        background-color: white;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
      `;
    };

    // Create modal content
    const modal = document.createElement('div');
    applyModalStyles();

    // Add CSS animation for loading spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Initially show loading state
    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">Test Purchase</h2>
        <button id="closeBtn" style="width: 32px; height: 32px; border-radius: 16px; background-color: #f0f0f0; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #666;">×</button>
      </div>

      <div style="background-color: #fff3cd; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
        <div style="font-size: 16px; font-weight: bold; color: #856404; margin-bottom: 8px;">⚠️ Test Mode</div>
        <div style="font-size: 14px; color: #856404; line-height: 1.4;">
          This is a test purchase and should be tested with proper iOS and Apple RevenueCat API keys before uploading the app to the App Store/Play Store.
        </div>
      </div>

      <div style="flex: 1; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;"></div>
        <div style="font-size: 16px; color: #666; text-align: center;">Loading package details...</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="cancelBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: 1px solid #dee2e6; background-color: #f8f9fa; color: #6c757d; font-size: 16px; font-weight: 600; cursor: pointer;">
          Cancel
        </button>
        <button id="purchaseBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: none; background-color: #ccc; color: #999; font-size: 16px; font-weight: 600; cursor: not-allowed;" disabled>
          Loading...
        </button>
      </div>
    `;

    // Load offerings and update modal content
    let packageInfo: PurchasesPackage;

    const handleCancel = () => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      // For cancellation, we should reject the promise with a user cancellation error
      const error = new Error('User cancelled the purchase');
      (error as any).userCancelled = true;
      reject({
        code: '1',
        userCancelled: true,
        message: 'User cancelled purchase.'
      });
    };

    const handlePurchase = async () => {
      // TODO: Actually purchase the package.
      if (!packageInfo) {
        // If package info is not loaded yet, do nothing
        return;
      }
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      const customerInfo = validateAndTransform(await PurchasesCommon.getInstance().getCustomerInfo(), isCustomerInfo, 'CustomerInfo');
      resolve({
        productIdentifier: packageInfo.product.identifier,
        customerInfo: customerInfo,
        transaction: createMockTransaction(packageInfo.product.identifier),
      });
    };

    // Handle window resize for responsive behavior
    const handleResize = () => {
      applyModalStyles();
    };

    // Clean up resize listener when modal is closed
    const handleCancelWithCleanup = () => {
      window.removeEventListener('resize', handleResize);
      handleCancel();
    };

    const handlePurchaseWithCleanup = () => {
      window.removeEventListener('resize', handleResize);
      handlePurchase();
    };

    const attachEventListeners = () => {
      const closeBtn = modal.querySelector('#closeBtn');
      const cancelBtn = modal.querySelector('#cancelBtn');
      const purchaseBtn = modal.querySelector('#purchaseBtn');

      closeBtn?.addEventListener('click', handleCancelWithCleanup);
      cancelBtn?.addEventListener('click', handleCancelWithCleanup);
      purchaseBtn?.addEventListener('click', handlePurchaseWithCleanup);
    };

    // Attach initial event listeners
    attachEventListeners();

    (async () => {
      try {
        const data = await loadTestPurchaseData(packageIdentifier, offeringIdentifier);
        packageInfo = data.packageInfo;
        const offers = data.offers;

        // Update modal content with package details
        modal.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">Test Purchase</h2>
            <button id="closeBtn" style="width: 32px; height: 32px; border-radius: 16px; background-color: #f0f0f0; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #666;">×</button>
          </div>

          <div style="background-color: #fff3cd; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <div style="font-size: 16px; font-weight: bold; color: #856404; margin-bottom: 8px;">⚠️ Test Mode</div>
            <div style="font-size: 14px; color: #856404; line-height: 1.4;">
              This is a test purchase and should be tested with proper iOS and Apple RevenueCat API keys before uploading the app to the App Store/Play Store.
            </div>
          </div>

          <div style="flex: 1; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 12px;">Package Details</h3>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Package ID:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.identifier}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Product ID:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.product.identifier}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Title:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.product.title}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Price:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.product.priceString}</span>
            </div>

            ${packageInfo.product.subscriptionPeriod ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
                <span style="font-size: 14px; font-weight: 600; color: #666;">Period:</span>
                <span style="font-size: 14px; color: #333;">${packageInfo.product.subscriptionPeriod}</span>
              </div>
            ` : ''}

            ${offers.length > 0 ? `
              <div style="margin-top: 16px;">
                <h4 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 12px;">Offers</h4>
                ${offers.map(offer => `<div style="font-size: 14px; color: #666; margin-bottom: 4px; line-height: 1.3;">• ${offer}</div>`).join('')}
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="cancelBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: 1px solid #dee2e6; background-color: #f8f9fa; color: #6c757d; font-size: 16px; font-weight: 600; cursor: pointer;">
              Cancel
            </button>
            <button id="purchaseBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: none; background-color: #007bff; color: white; font-size: 16px; font-weight: 600; cursor: pointer;">
              Test Purchase
            </button>
          </div>
        `;

        // Re-attach event listeners after content update
        attachEventListeners();

      } catch (error) {
        console.error('Error loading package details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Show error state
        modal.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">Test Purchase</h2>
            <button id="closeBtn" style="width: 32px; height: 32px; border-radius: 16px; background-color: #f0f0f0; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #666;">×</button>
          </div>

          <div style="flex: 1; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
            <div style="font-size: 48px; color: #dc3545; margin-bottom: 16px;">⚠️</div>
            <div style="font-size: 16px; color: #dc3545; text-align: center; margin-bottom: 8px;">Error loading package details</div>
            <div style="font-size: 14px; color: #666; text-align: center;">${errorMessage}</div>
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="cancelBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: 1px solid #dee2e6; background-color: #f8f9fa; color: #6c757d; font-size: 16px; font-weight: 600; cursor: pointer;">
              Close
            </button>
          </div>
        `;

        // Re-attach event listeners for error state
        attachEventListeners();
      }
    })();

    // Close modal on overlay click (but not on modal content click)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        handleCancelWithCleanup();
      }
    });

    // Append to DOM
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add resize event listener after modal is in DOM
    window.addEventListener('resize', handleResize);
  });
}

const packageVersion = '8.11.8';

/**
 * Browser implementation of the native module. This will be used in the browser and Expo Go.
 */
export const browserNativeModuleRNPurchases = {
  setupPurchases: async (
    apiKey: string,
    appUserID: string | null,
    _purchasesAreCompletedBy: string | null,
    _userDefaultsSuiteName: string | null,
    _storeKitVersion: string | null,
    _useAmazon: boolean,
    _shouldShowInAppMessagesAutomatically: boolean,
    _entitlementVerificationMode: string | null,
    _pendingTransactionsForPrepaidPlansEnabled: boolean,
    _diagnosticsEnabled: boolean
  ) => {
    try {
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
  setLogHandler: async (_handler: (message: string) => void) => {
    // WIP: Implement this
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
  ) => {
    ensurePurchasesConfigured();

    const offeringIdentifier = presentedOfferingContext?.offeringIdentifier;
    if (!offeringIdentifier) {
      throw new Error('No offering identifier provided in presentedOfferingContext');
    }

    if (isExpoGo()) {
      return await showTestPurchaseAlert(packageIdentifier, offeringIdentifier);
    } else {
      return await showTestPurchaseModal(packageIdentifier, offeringIdentifier);
    }
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
  setAttributes: async (_attributes: any) => {
    methodNotSupportedOnWeb('setAttributes');
  },
  setEmail: async (_email: string) => {
    methodNotSupportedOnWeb('setEmail');
  },
  setPhoneNumber: async (_phoneNumber: string) => {
    methodNotSupportedOnWeb('setPhoneNumber');
  },
  setDisplayName: async (_displayName: string) => {
    methodNotSupportedOnWeb('setDisplayName');
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
};
