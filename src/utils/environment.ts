// import { NativeModules, Platform } from 'react-native';
// import DeviceInfo from 'react-native-device-info';

/**
 * Detects if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 * 
 * @returns {boolean} True if the app is running in an environment where native modules are not available
 * (like Expo Go) or if the required native modules are missing.
 */
export function shouldUseCompatibilityAPIMode(): boolean {
  return isExpoGo();
}

// const EXPO_GO_BUNDLE_ID_IOS = 'host.exp.Exponent';
// const EXPO_GO_PACKAGE_ID_ANDROID = 'host.exp.Exponent';

/**
 * Detects if the app is running in Expo Go
 */
function isExpoGo(): boolean {
  // if (Platform.OS === 'ios') {
  //   return DeviceInfo.getBundleId() === EXPO_GO_BUNDLE_ID_IOS;
  // } else if (Platform.OS === 'android') {
  //   return DeviceInfo.getPackageName() === EXPO_GO_PACKAGE_ID_ANDROID;
  // }
  return true; // TODO: Remove this once we have a way to detect Expo Go
}