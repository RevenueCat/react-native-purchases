import { NativeModules } from 'react-native';

/**
 * Detects if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 * 
 * @returns {boolean} True if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 */
export function shouldUseCompatibilityAPIMode(): boolean {
  // Check if RNPurchases native module exists
  if (!NativeModules.RNPurchases) {
    return false;
  }

  return isExpoGo();
}

/**
 * Detects if the app is running in Expo Go
 */
function isExpoGo(): boolean {
  return NativeModules.ExpoConstants?.executionEnvironment === 'storeClient';
}