import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';

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