import { NativeModules } from 'react-native';

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

/**
 * Detects if the app is running in Expo Go
 */
function isExpoGo(): boolean {
  // Taken from https://docs.expo.dev/versions/latest/sdk/constants/#executionenvironment
  return NativeModules.ExpoConstants?.executionEnvironment === 'storeClient';
}