// src/index.ts
import OriginalPurchasesModule from './purchases';
import MockPurchasesModule from './PurchasesMock';

let PurchasesToExport: any;
let isExpoGo = false;

try {
  // Dynamically require expo-constants to avoid issues in non-Expo environments
  // where the module might not be present.
  const Constants = require('expo-constants').default; // .default is often needed for CJS modules when using require
  if (Constants && Constants.executionEnvironment === "storeClient") {
    isExpoGo = true;
  }
} catch (e: any) {
  // expo-constants not available, or other error. Assume not in Expo Go.
  // console.log("RevenueCat SDK (core): Could not determine Expo Go environment. Mock mode will rely on global flag only. Error: " + e.message);
}

const useMock = isExpoGo || (global as any).__EXPO_GO_MOCK_REVENUECAT__ === true;

if (useMock) {
  PurchasesToExport = MockPurchasesModule;
  if (isExpoGo && (global as any).__EXPO_GO_MOCK_REVENUECAT__ !== false) { // Check if explicitly disabled
    console.log("RevenueCat SDK (core): Expo Go environment detected. Mock mode automatically enabled. To disable, set global.__EXPO_GO_MOCK_REVENUECAT__ = false;");
  } else if ((global as any).__EXPO_GO_MOCK_REVENUECAT__ === true) {
    console.log("RevenueCat SDK (core): Global flag __EXPO_GO_MOCK_REVENUECAT__ is true. Mock mode enabled.");
  }
} else {
  PurchasesToExport = OriginalPurchasesModule;
}

export default PurchasesToExport;

// Re-export all named exports from the *original* ./purchases module.
// This ensures that enums, types, etc., are still available.
export * from './errors';
export * from './customerInfo';
export * from './purchases'; // This will re-export named items from the original purchases.ts
export * from './offerings';
