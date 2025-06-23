import { NativeModules, Platform } from "react-native";

/**
 * Detects if the app is running in an environment where native modules are not available
 * (like Expo Go or Web) or if the required native modules are missing.
 * 
 * @returns {boolean} True if the app is running in an environment where native modules are not available
 * (like Expo Go or Web) or if the required native modules are missing.
 */
export function shouldUsePreviewAPIMode(): boolean {
  let usePreviewAPIMode = isExpoGo() || isWebPlatform();
  if (usePreviewAPIMode) {
    if (isWebPlatform()) {
      console.log('Web platform detected. Using RevenueCat in Preview API Mode.');
    } else {
      console.log('Expo Go app detected. Using RevenueCat in Preview API Mode.');
    }
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
  if (!!NativeModules.RNPurchases) {
    return false;
  }

  return !!globalThis.expo?.modules?.ExpoGo;
}

/**
 * Detects if the app is running on web platform
 */
function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}