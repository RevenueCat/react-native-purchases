import { NativeModules, Platform } from 'react-native';
import { shouldUseBrowserMode } from '../src/utils/environment';

describe('shouldUseBrowserMode logging', () => {
  const originalOS = Platform.OS;
  const originalRNPurchases = NativeModules.RNPurchases;
  const originalRorkSandbox = NativeModules.RorkSandbox;
  const originalExpo = globalThis.expo;

  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    Platform.OS = originalOS;
    NativeModules.RNPurchases = originalRNPurchases;
    NativeModules.RorkSandbox = originalRorkSandbox;
    globalThis.expo = originalExpo;
  });

  it('prefixes the web platform detection message with [RevenueCat]', () => {
    Platform.OS = 'web';
    NativeModules.RNPurchases = originalRNPurchases;
    NativeModules.RorkSandbox = undefined;

    const result = shouldUseBrowserMode();

    expect(result).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(
      '[RevenueCat] Web platform detected. Using RevenueCat in Browser Mode.'
    );
  });

  it('prefixes the Expo Go detection message with [RevenueCat]', () => {
    NativeModules.RNPurchases = null;
    NativeModules.RorkSandbox = undefined;
    globalThis.expo = { modules: { ExpoGo: true } };

    const result = shouldUseBrowserMode();

    expect(result).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(
      '[RevenueCat] Expo Go app detected. Using RevenueCat in Browser Mode.'
    );
  });

  it('prefixes the Rork sandbox detection message with [RevenueCat]', () => {
    NativeModules.RorkSandbox = {};

    const result = shouldUseBrowserMode();

    expect(result).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(
      '[RevenueCat] Rork app detected. Using RevenueCat in Preview API Mode.'
    );
  });

  it('does not log a browser-mode detection message on native platforms', () => {
    Platform.OS = 'ios';
    NativeModules.RNPurchases = originalRNPurchases;
    NativeModules.RorkSandbox = undefined;
    globalThis.expo = undefined;

    const result = shouldUseBrowserMode();

    expect(result).toBe(false);
    expect(logSpy).not.toHaveBeenCalled();
  });
});
