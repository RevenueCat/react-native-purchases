import {
  CustomerInfo,
  MakePurchaseResult,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesVirtualCurrencies,
} from '@revenuecat/purchases-typescript-internal';

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
export function validateAndTransform<T>(value: any, typeGuard: TypeGuard<T>, typeName: string): T {
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
export function isCustomerInfo(value: any): value is CustomerInfo {
  return value && typeof value === 'object' &&
         typeof value.originalAppUserId === 'string' &&
         typeof value.entitlements === 'object';
}

export function isPurchasesOfferings(value: any): value is PurchasesOfferings {
  return value && typeof value === 'object' &&
         typeof value.all === 'object' &&
         (value.current === null || typeof value.current === 'object');
}

export function isPurchasesOffering(value: any): value is PurchasesOffering {
  return value && typeof value === 'object' &&
         typeof value.identifier === 'string' &&
         typeof value.serverDescription === 'string' &&
         Array.isArray(value.availablePackages);
}

export function isLogInResult(value: any): value is { customerInfo: CustomerInfo; created: boolean } {
  return value && typeof value === 'object' &&
         typeof value.customerInfo === 'object' &&
         typeof value.created === 'boolean' &&
         isCustomerInfo(value.customerInfo);
}

export function isMakePurchaseResult(value: any): value is MakePurchaseResult {
  return value && typeof value === 'object' &&
         typeof value.productIdentifier === 'string' &&
         typeof value.customerInfo === 'object' &&
         isCustomerInfo(value.customerInfo) &&
         typeof value.transaction === 'object';
}

export function isPurchasesVirtualCurrencies(value: any): value is PurchasesVirtualCurrencies {
  return value && typeof value === 'object' &&
         typeof value.all === 'object';
}