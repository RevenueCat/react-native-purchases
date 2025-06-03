import { NativeModules } from "react-native";

/**
 * Detects if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 * 
 * @returns {boolean} True if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 */
export function shouldUsePreviewAPIMode(): boolean {
  let usePreviewAPIMode = isExpoGo();
  if (usePreviewAPIMode) {
    console.log('Expo Go app detected. Using RevenueCat in Preview API Mode.');
  }
  return usePreviewAPIMode;
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
function isExpoGo(): boolean {
  if (!!NativeModules.RNPaywalls && !!NativeModules.RNCustomerCenter) {
    return false;
  }

  return !!globalThis.expo?.modules?.ExpoGo;
}