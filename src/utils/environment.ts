import { NativeModules, Platform } from "react-native";

/**
 * Detects if the app is running in an environment where native modules are not available
 * (like Expo Go or Web) or if the required native modules are missing.
 *
 * @returns {boolean} True if the app is running in an environment where native modules are not available
 * (like Expo Go or Web) or if the required native modules are missing.
 */
export function shouldUseBrowserMode(): boolean {
  if (isExpoGo()) {
    logBrowserModeDetection('Expo Go app detected. Using RevenueCat in Browser Mode.');
    return true;
  } else if (isRorkSandbox()) {
    logBrowserModeDetection('Rork app detected. Using RevenueCat in Preview API Mode.');
    return true;
  } else if (isWebPlatform()) {
    logBrowserModeDetection('Web platform detected. Using RevenueCat in Browser Mode.');
    return true;
  } else {
    return false;
  }
}

function logBrowserModeDetection(message: string): void {
  console.log(`[RevenueCat] ${message}`);
}

declare global {
  var expo: {
    modules?: {
      ExpoGo?: boolean;
    };
  };
}

/**
 * Detects if the app is running in Expo Go
 */
export function isExpoGo(): boolean {
  if (!!NativeModules.RNPurchases) {
    return false;
  }

  return !!globalThis.expo?.modules?.ExpoGo;
}

/**
 * Detects if the app is running in the Rork app
 */
export function isRorkSandbox(): boolean {
  return !!NativeModules.RorkSandbox;
}

/**
 * Detects if the app is running on web platform
 */
function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}
