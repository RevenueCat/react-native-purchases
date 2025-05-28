import { NativeModules } from "react-native";

/**
 * Detects if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 * 
 * @returns {boolean} True if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 */
export function shouldUseCompatibilityAPIMode(): boolean {
  let useCompatibilityMode = isExpoGo();
  if (useCompatibilityMode) {
    console.log('Expo Go app detected. Using RevenueCat in Compatibility API Mode.');
  }
  return useCompatibilityMode;
}

/**
 * Detects if the app is running in Expo Go
 */
function isExpoGo(): boolean {
  if (!!NativeModules.RNPurchases) {
    return false;
  }

  try {
    const Constants = require('expo-constants').default;
    return Constants.executionEnvironment === 'storeClient';
  } catch (error) {
    // No expo-constants module found, so we're not running in Expo Go
    return false;
  }
}