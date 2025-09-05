import { loadSimulatedPurchaseData } from '../src/browser/simulatedstore/offeringsLoader';
import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';
import * as typeGuards from '../src/browser/typeGuards';

// Mock dependencies
jest.mock('@revenuecat/purchases-js-hybrid-mappings');
jest.mock('../src/browser/typeGuards');

const mockPurchasesCommon = PurchasesCommon as jest.Mocked<typeof PurchasesCommon>;
const mockTypeGuards = typeGuards as jest.Mocked<typeof typeGuards>;

describe('offeringsLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadSimulatedPurchaseData', () => {
    const mockOfferings = {
      all: {
        'test-offering': {
          availablePackages: [
            {
              identifier: 'test-package',
              product: {
                identifier: 'test-product',
                title: 'Test Product',
                priceString: '$9.99',
                introPrice: {
                  priceString: '$0.99',
                  cycles: 1,
                  periodUnit: 'MONTH'
                },
                discounts: [
                  {
                    priceString: '$4.99',
                    cycles: 2,
                    periodUnit: 'WEEK'
                  }
                ]
              }
            }
          ]
        }
      }
    };

    beforeEach(() => {
      const mockInstance = {
        getOfferings: jest.fn().mockResolvedValue(mockOfferings)
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);
      mockTypeGuards.validateAndTransform.mockReturnValue(mockOfferings);
    });

    it('should successfully load package data with intro price and discounts', async () => {
      const result = await loadSimulatedPurchaseData('test-package', 'test-offering');

      expect(result.packageInfo.identifier).toBe('test-package');
      expect(result.packageInfo.product.identifier).toBe('test-product');
      expect(result.offers).toHaveLength(2);
      expect(result.offers[0]).toBe('Intro: $0.99 for 1 month(s)');
      expect(result.offers[1]).toBe('Discount: $4.99 for 2 week(s)');
    });

    it('should handle package without intro price or discounts', async () => {
      const offeringsWithoutExtras = {
        all: {
          'test-offering': {
            availablePackages: [
              {
                identifier: 'test-package',
                product: {
                  identifier: 'test-product',
                  title: 'Test Product',
                  priceString: '$9.99',
                  introPrice: null,
                  discounts: null
                }
              }
            ]
          }
        }
      };

      mockTypeGuards.validateAndTransform.mockReturnValue(offeringsWithoutExtras);
      const mockInstance = {
        getOfferings: jest.fn().mockResolvedValue(offeringsWithoutExtras)
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      const result = await loadSimulatedPurchaseData('test-package', 'test-offering');

      expect(result.packageInfo.identifier).toBe('test-package');
      expect(result.offers).toHaveLength(0);
    });

    it('should throw error when offering is not found', async () => {
      await expect(loadSimulatedPurchaseData('test-package', 'non-existent-offering'))
        .rejects.toThrow('Offering with identifier non-existent-offering not found');
    });

    it('should throw error when package is not found', async () => {
      await expect(loadSimulatedPurchaseData('non-existent-package', 'test-offering'))
        .rejects.toThrow('Package with identifier non-existent-package not found in offering test-offering');
    });

    it('should handle empty discounts array', async () => {
      const offeringsWithEmptyDiscounts = {
        all: {
          'test-offering': {
            availablePackages: [
              {
                identifier: 'test-package',
                product: {
                  identifier: 'test-product',
                  title: 'Test Product',
                  priceString: '$9.99',
                  introPrice: null,
                  discounts: []
                }
              }
            ]
          }
        }
      };

      mockTypeGuards.validateAndTransform.mockReturnValue(offeringsWithEmptyDiscounts);
      const mockInstance = {
        getOfferings: jest.fn().mockResolvedValue(offeringsWithEmptyDiscounts)
      };
      mockPurchasesCommon.getInstance.mockReturnValue(mockInstance as any);

      const result = await loadSimulatedPurchaseData('test-package', 'test-offering');

      expect(result.offers).toHaveLength(0);
    });
  });
});