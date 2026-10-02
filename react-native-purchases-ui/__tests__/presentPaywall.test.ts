// The preview implementation pulls in a browser bundle that can't load under node.
jest.mock('../src/preview/nativeModules', () => ({
  previewNativeModuleRNPaywalls: {},
  previewNativeModuleRNCustomerCenter: {},
}));

jest.mock('react-native', () => ({
  NativeModules: {
    RNPaywalls: {
      presentPaywall: jest.fn(),
      presentPaywallIfNeeded: jest.fn(),
    },
    RNCustomerCenter: {},
  },
  NativeEventEmitter: jest.fn(),
  Platform: { OS: 'ios', select: (specifics: Record<string, unknown>) => specifics.ios },
  requireNativeComponent: jest.fn(),
  UIManager: { getViewManagerConfig: () => null },
  StyleSheet: { create: (styles: unknown) => styles },
  View: 'View',
  ScrollView: 'ScrollView',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
}));

import { NativeModules } from 'react-native';
import RevenueCatUI from '../src';

const presentPaywall = NativeModules.RNPaywalls.presentPaywall as jest.Mock;
const presentPaywallIfNeeded = NativeModules.RNPaywalls.presentPaywallIfNeeded as jest.Mock;

describe('presentationMode', () => {
  beforeEach(() => {
    presentPaywall.mockReset().mockResolvedValue('PURCHASED');
    presentPaywallIfNeeded.mockReset().mockResolvedValue('PURCHASED');
  });

  it('presentPaywall forwards presentationMode as the last native argument', async () => {
    await RevenueCatUI.presentPaywall({ presentationMode: 'fullScreen' });

    const args = presentPaywall.mock.calls[0];
    expect(args).toHaveLength(6);
    expect(args[5]).toBe('fullScreen');
  });

  it('presentPaywall sends null when presentationMode is omitted', async () => {
    await RevenueCatUI.presentPaywall();

    const args = presentPaywall.mock.calls[0];
    expect(args).toHaveLength(6);
    expect(args[5]).toBeNull();
  });

  it('presentPaywallIfNeeded forwards presentationMode as the last native argument', async () => {
    await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'pro',
      presentationMode: 'formSheet',
    });

    const args = presentPaywallIfNeeded.mock.calls[0];
    expect(args).toHaveLength(7);
    expect(args[0]).toBe('pro');
    expect(args[6]).toBe('formSheet');
  });

  it('presentPaywallIfNeeded sends null when presentationMode is omitted', async () => {
    await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'pro' });

    const args = presentPaywallIfNeeded.mock.calls[0];
    expect(args).toHaveLength(7);
    expect(args[6]).toBeNull();
  });
});
