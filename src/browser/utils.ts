import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';
import { PurchasesStoreTransaction } from '@revenuecat/purchases-typescript-internal';

/**
 * Creates mock transaction for test purchases
 */
export const createMockTransaction = (productId: string): PurchasesStoreTransaction => ({
  transactionIdentifier: `mock_${Date.now()}`,
  productIdentifier: productId,
  purchaseDate: new Date().toISOString(),
});

/**
 * Helper function to ensure PurchasesCommon is configured before making API calls
 * @throws {Error} If PurchasesCommon is not configured
 */
export function ensurePurchasesConfigured(): void {
  if (!PurchasesCommon.isConfigured()) {
    throw new Error('PurchasesCommon is not configured. Call setupPurchases first.');
  }
}

export function methodNotSupportedOnWeb(methodName: string): void {
  throw new Error(`${methodName} is not supported on web platform.`);
}