import { purchaseSimulatedPackage } from '../src/browser/simulatedstore/purchaseSimulatedPackageHelper';
import { showSimulatedPurchaseAlert } from '../src/browser/simulatedstore/alertHelper';
import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';
import { PURCHASES_ERROR_CODE } from '@revenuecat/purchases-typescript-internal';

// Mock dependencies
jest.mock('../src/browser/simulatedstore/alertHelper');
jest.mock('@revenuecat/purchases-js-hybrid-mappings');

const mockShowSimulatedPurchaseAlert = showSimulatedPurchaseAlert as jest.MockedFunction<typeof showSimulatedPurchaseAlert>;
const mockPurchasesCommon = PurchasesCommon as jest.Mocked<typeof PurchasesCommon>;

describe('purchaseSimulatedPackageHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('purchaseSimulatedPackage', () => {
    const mockPresentedOfferingContext = {
      offeringIdentifier: 'test-offering'
    };

    const mockMakePurchaseResult = {
      purchasedProductIdentifier: 'test-product',
      customerInfo: {
        activeSubscriptions: ['test-subscription']
      }
    };

    it('should throw error when no offering identifier is provided', async () => {
      await expect(purchaseSimulatedPackage('test-package', null))
        .rejects.toThrow('No offering identifier provided in presentedOfferingContext');

      await expect(purchaseSimulatedPackage('test-package', {}))
        .rejects.toThrow('No offering identifier provided in presentedOfferingContext');
    });

    it('should successfully complete purchase flow', async () => {
      // Mock the alert to call onPurchase callback immediately
      mockShowSimulatedPurchaseAlert.mockImplementation(
        async (packageId, _offeringId, onPurchase, _onFailedPurchase, _onCancel) => {
          const mockPackageInfo = {
            identifier: packageId,
            product: { identifier: 'test-product' }
          };
          await onPurchase(mockPackageInfo as any);
          return Promise.resolve();
        }
      );

      // Mock the internal purchase method
      const mockInstance = {
        _purchaseSimulatedStorePackage: jest.fn().mockResolvedValue(mockMakePurchaseResult)
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      const result = await purchaseSimulatedPackage('test-package', mockPresentedOfferingContext);

      expect(result).toEqual(mockMakePurchaseResult);
      expect(mockShowSimulatedPurchaseAlert).toHaveBeenCalledWith(
        'test-package',
        'test-offering',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
      expect(mockInstance._purchaseSimulatedStorePackage).toHaveBeenCalledWith({
        packageIdentifier: 'test-package',
        presentedOfferingContext: mockPresentedOfferingContext
      });
    });

    it('should handle user cancellation', async () => {
      // Mock the alert to call onCancel callback
      mockShowSimulatedPurchaseAlert.mockImplementation(
        async (_packageId, _offeringId, _onPurchase, _onFailedPurchase, onCancel) => {
          onCancel();
          return Promise.resolve();
        }
      );

      const mockInstance = {
        _purchaseSimulatedStorePackage: jest.fn()
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      await expect(purchaseSimulatedPackage('test-package', mockPresentedOfferingContext))
        .rejects.toEqual({
          code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
          userCancelled: true,
          message: 'User cancelled purchase.'
        });

      expect(mockInstance._purchaseSimulatedStorePackage).not.toHaveBeenCalled();
    });

    it('should handle purchase failure', async () => {
      const purchaseError = new Error('Purchase failed');

      // Mock the alert to call onPurchase callback
      mockShowSimulatedPurchaseAlert.mockImplementation(
        async (packageId, _offeringId, onPurchase, _onFailedPurchase, _onCancel) => {
          const mockPackageInfo = {
            identifier: packageId,
            product: { identifier: 'test-product' }
          };
          await onPurchase(mockPackageInfo as any);
          return Promise.resolve();
        }
      );

      // Mock the internal purchase method to fail
      const mockInstance = {
        _purchaseSimulatedStorePackage: jest.fn().mockRejectedValue(purchaseError)
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      await expect(purchaseSimulatedPackage('test-package', mockPresentedOfferingContext))
        .rejects.toThrow('Purchase failed');

      expect(mockInstance._purchaseSimulatedStorePackage).toHaveBeenCalledWith({
        packageIdentifier: 'test-package',
        presentedOfferingContext: mockPresentedOfferingContext
      });
    });

    it('should handle alert helper errors', async () => {
      const alertError = new Error('Alert failed');
      mockShowSimulatedPurchaseAlert.mockRejectedValue(alertError);

      const mockInstance = {
        _purchaseSimulatedStorePackage: jest.fn()
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      await expect(purchaseSimulatedPackage('test-package', mockPresentedOfferingContext))
        .rejects.toThrow('Alert failed');

      expect(mockInstance._purchaseSimulatedStorePackage).not.toHaveBeenCalled();
    });

    it('should pass correct parameters to alert helper', async () => {
      // Mock to immediately resolve without calling callbacks
      mockShowSimulatedPurchaseAlert.mockResolvedValue();

      const mockInstance = {
        _purchaseSimulatedStorePackage: jest.fn()
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      // This will hang waiting for a purchase callback, but we can check the params
      purchaseSimulatedPackage('my-package', { offeringIdentifier: 'my-offering' });

      // Give it a moment to call the alert helper
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockShowSimulatedPurchaseAlert).toHaveBeenCalledWith(
        'my-package',
        'my-offering',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    }, 1000);

    it('should handle undefined presentedOfferingContext properties gracefully', async () => {
      const contextWithUndefinedOffering = {
        offeringIdentifier: undefined
      };

      await expect(purchaseSimulatedPackage('test-package', contextWithUndefinedOffering))
        .rejects.toThrow('No offering identifier provided in presentedOfferingContext');
    });

    it('should handle failed purchase button press', async () => {
      // Mock the alert to call onFailedPurchase callback
      mockShowSimulatedPurchaseAlert.mockImplementation(
        async (_packageId, _offeringId, _onPurchase, onFailedPurchase, _onCancel) => {
          onFailedPurchase();
          return Promise.resolve();
        }
      );

      const mockInstance = {
        _purchaseSimulatedStorePackage: jest.fn()
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      await expect(purchaseSimulatedPackage('test-package', mockPresentedOfferingContext))
        .rejects.toEqual({
          code: PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR,
          userCancelled: false,
          message: 'Test purchase failure: no real transaction occurred'
        });

      expect(mockInstance._purchaseSimulatedStorePackage).not.toHaveBeenCalled();
    });
  });
});