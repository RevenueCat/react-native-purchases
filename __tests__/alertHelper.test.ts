import { PACKAGE_TYPE, PRODUCT_CATEGORY, PRODUCT_TYPE, PurchasesPackage } from '@revenuecat/purchases-typescript-internal';
import { showSimulatedPurchaseAlert } from '../src/browser/simulatedstore/alertHelper';
import { loadSimulatedPurchaseData, SimulatedPurchaseData } from '../src/browser/simulatedstore/offeringsLoader';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../src/browser/simulatedstore/offeringsLoader');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

const mockLoadSimulatedPurchaseData = loadSimulatedPurchaseData as jest.MockedFunction<typeof loadSimulatedPurchaseData>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

// Mock console.error to avoid noisy test output
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('alertHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const mockProduct = {
    identifier: 'test-product',
    title: 'Test Product',
    description: 'Test Description',
    price: 9.99,
    pricePerWeek: 1.4285714285714286,
    pricePerMonth: 42.857142857142854,
    pricePerYear: 514.2857142857142,
    pricePerWeekString: '$1.43',
    pricePerMonthString: '$42.86',
    pricePerYearString: '$514.29',
    currencyCode: 'USD',
    priceString: '$9.99',
    subscriptionPeriod: 'P1M',
    introPrice: {
      price: 0.99,
      period: 'P1M',
      periodNumberOfUnits: 1,
      priceString: '$0.99',
      cycles: 1,
      periodUnit: 'MONTH'
    },
    discounts: [],
    defaultOption: null,
    subscriptionOptions: [],
    presentedOfferingIdentifier: 'test-offering',
    presentedOfferingContext: {
      offeringIdentifier: 'test-offering',
      placementIdentifier: null,
      targetingContext: null,
    },
    productCategory: PRODUCT_CATEGORY.SUBSCRIPTION,
    productType: PRODUCT_TYPE.AUTO_RENEWABLE_SUBSCRIPTION,
  };

  const mockPackageInfo: PurchasesPackage = {
    identifier: 'test-package',
    packageType: PACKAGE_TYPE.MONTHLY,
    offeringIdentifier: 'test-offering',
    presentedOfferingContext: {
      offeringIdentifier: 'test-offering',
      placementIdentifier: null,
      targetingContext: null,
    },
    product: mockProduct,
  };

  const mockPurchaseData: SimulatedPurchaseData = {
    packageInfo: mockPackageInfo,
    offers: ['Intro: $0.99 for 1 month(s)', 'Discount: $4.99 for 2 week(s)']
  };

  describe('showSimulatedPurchaseAlert', () => {
    it('should show alert with package details and offers', async () => {
      mockLoadSimulatedPurchaseData.mockResolvedValue(mockPurchaseData);
      
      const onPurchase = jest.fn().mockResolvedValue(undefined);
      const onCancel = jest.fn();

      const alertPromise = showSimulatedPurchaseAlert('test-package', 'test-offering', onPurchase, onCancel);

      // Wait for async operations to complete
      await new Promise(setImmediate);

      expect(mockLoadSimulatedPurchaseData).toHaveBeenCalledWith('test-package', 'test-offering');

      expect(mockAlert).toHaveBeenCalledWith(
        'Test Purchase',
        expect.stringContaining('⚠️ This is a test purchase'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Test Purchase' })
        ]),
        { cancelable: true, onDismiss: expect.any(Function) }
      );

      // Check that the message includes package details
      const alertMessage = mockAlert.mock.calls[0][1];
      expect(alertMessage).toContain('Package ID: test-package');
      expect(alertMessage).toContain('Product ID: test-product');
      expect(alertMessage).toContain('Title: Test Product');
      expect(alertMessage).toContain('Price: $9.99');
      expect(alertMessage).toContain('Period: P1M');
      expect(alertMessage).toContain('• Intro: $0.99 for 1 month(s)');
      expect(alertMessage).toContain('• Discount: $4.99 for 2 week(s)');

      // Simulate user clicking Test Purchase
      const testPurchaseButton = mockAlert.mock.calls[0]!![2]!![1];
      await testPurchaseButton.onPress!!();

      expect(onPurchase).toHaveBeenCalledWith(mockPackageInfo);

      // Wait for the promise to resolve
      await alertPromise;
    });

    it('should handle package without subscription period and offers', async () => {
      const simplePackageData = {
        ...mockPurchaseData,
        packageInfo: {
          ...mockPackageInfo,
          product: {
            ...mockProduct,
            introPrice: null,
          },
        },
        offers: [],
      };

      mockLoadSimulatedPurchaseData.mockResolvedValue(simplePackageData);
      
      const onPurchase = jest.fn().mockResolvedValue(undefined);
      const onCancel = jest.fn();

      const alertPromise = showSimulatedPurchaseAlert('test-package', 'test-offering', onPurchase, onCancel);

      // Wait for async operations to complete
      await new Promise(setImmediate);

      expect(mockAlert).toHaveBeenCalled();
      const alertMessage = mockAlert.mock.calls[0][1];
      expect(alertMessage).not.toContain('Offers:');

      // Simulate user clicking Cancel to resolve the promise
      const cancelButton = mockAlert.mock.calls[0]!![2]!![0];
      cancelButton.onPress!!();

      await alertPromise;
    });

    it('should handle cancel button press', async () => {
      mockLoadSimulatedPurchaseData.mockResolvedValue(mockPurchaseData);
      
      const onPurchase = jest.fn();
      const onCancel = jest.fn();

      const alertPromise = showSimulatedPurchaseAlert('test-package', 'test-offering', onPurchase, onCancel);

      // Wait for async operations to complete
      await new Promise(setImmediate);

      // Simulate user clicking Cancel
      const cancelButton = mockAlert.mock.calls[0]!![2]!![0];
      cancelButton.onPress!!();

      expect(onCancel).toHaveBeenCalled();

      await alertPromise;
    });

    it('should handle alert dismiss', async () => {
      mockLoadSimulatedPurchaseData.mockResolvedValue(mockPurchaseData);
      
      const onPurchase = jest.fn();
      const onCancel = jest.fn();

      const alertPromise = showSimulatedPurchaseAlert('test-package', 'test-offering', onPurchase, onCancel);

      // Wait for async operations to complete
      await new Promise(setImmediate);

      // Simulate alert dismiss
      const alertOptions = mockAlert.mock.calls[0]!![3]!!;
      alertOptions.onDismiss!!();

      expect(onCancel).toHaveBeenCalled();

      await alertPromise;
    });

    it('should show error alert when loadSimulatedPurchaseData fails', async () => {
      const error = new Error('Test error');
      mockLoadSimulatedPurchaseData.mockRejectedValue(error);
      
      const onPurchase = jest.fn();
      const onCancel = jest.fn();

      const alertPromise = showSimulatedPurchaseAlert('test-package', 'test-offering', onPurchase, onCancel);

      // Wait for async operations to complete
      await new Promise(setImmediate);

      expect(mockAlert).toHaveBeenCalledWith(
        'Test Purchase Error',
        'Error loading package details: Test error',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Close' })
        ]),
        { cancelable: true, onDismiss: expect.any(Function) }
      );

      // Simulate clicking Close on error dialog
      const closeButton = mockAlert.mock.calls[0]!![2]!![0];
      closeButton.onPress!!();

      expect(onCancel).toHaveBeenCalled();

      await alertPromise;
    });

    it('should handle purchase function throwing error', async () => {
      const purchaseError = new Error('Purchase failed');
      
      mockLoadSimulatedPurchaseData.mockResolvedValue(mockPurchaseData);
      
      const onPurchase = jest.fn().mockRejectedValue(purchaseError);
      const onCancel = jest.fn();

      const alertPromise = showSimulatedPurchaseAlert('test-package', 'test-offering', onPurchase, onCancel);

      // Wait for async operations to complete
      await new Promise(setImmediate);

      // Simulate user clicking Test Purchase
      const testPurchaseButton = mockAlert.mock.calls[0]!![2]!![1];
      // Don't await this since it will reject
      testPurchaseButton.onPress!!();

      // The promise should reject when the purchase fails
      await expect(alertPromise).rejects.toThrow('Purchase failed');
    });

    it('should handle non-Error objects in catch block', async () => {
      const nonErrorObject = { message: 'Something went wrong' };
      mockLoadSimulatedPurchaseData.mockRejectedValue(nonErrorObject);
      
      const onPurchase = jest.fn();
      const onCancel = jest.fn();

      const alertPromise = showSimulatedPurchaseAlert('test-package', 'test-offering', onPurchase, onCancel);

      // Wait for async operations to complete
      await new Promise(setImmediate);

      expect(mockAlert).toHaveBeenCalled();
      const alertMessage = mockAlert.mock.calls[0][1];
      expect(alertMessage).toContain('Error loading package details: Unknown error');

      // Simulate clicking Close to resolve the promise
      const closeButton = mockAlert.mock.calls[0]!![2]!![0];
      closeButton.onPress!!();

      await alertPromise;
    });
  });
});