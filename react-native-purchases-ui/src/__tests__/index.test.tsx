import { NativeModules } from 'react-native';
import { PAYWALL_RESULT } from '@revenuecat/purchases-typescript-internal';

// It's assumed that Jest is auto-mocking 'react-native' and thus NativeModules.RNPaywalls
// If not, explicit mocks like jest.mock('react-native', () => ({...})) would be needed.

describe('RevenueCatUI SDK Mocking', () => {
  let originalExpoGoMockFlag: boolean | undefined;
  let MockRevenueCatUI: any;
  // We cannot easily import OriginalRevenueCatUI directly as it's defined conditionally.

  beforeAll(() => {
    originalExpoGoMockFlag = (global as any).__EXPO_GO_MOCK_REVENUECAT__;
    // Load MockRevenueCatUI once for comparison
    MockRevenueCatUI = require('../../src/RevenueCatUIMock').default;
  });

  afterEach(() => {
    (global as any).__EXPO_GO_MOCK_REVENUECAT__ = originalExpoGoMockFlag;
    jest.resetModules(); // This is crucial to re-evaluate the import of ../../src/index
    jest.clearAllMocks(); // Clear mock calls between tests
  });

  it('should use MockRevenueCatUI when global.__EXPO_GO_MOCK_REVENUECAT__ is true', async () => {
    (global as any).__EXPO_GO_MOCK_REVENUECAT__ = true;
    const RevenueCatUIToTest = require('../../src/index').default;

    expect(RevenueCatUIToTest).toBe(MockRevenueCatUI);

    const result = await RevenueCatUIToTest.presentPaywall();
    expect(result).toBe(PAYWALL_RESULT.NOT_PRESENTED);

    // Check that the native module method was NOT called by the mock
    expect(NativeModules.RNPaywalls.presentPaywall).not.toHaveBeenCalled();
  });

  it('should use OriginalRevenueCatUI when global.__EXPO_GO_MOCK_REVENUECAT__ is false', async () => {
    (global as any).__EXPO_GO_MOCK_REVENUECAT__ = false;
    const RevenueCatUIToTest = require('../../src/index').default;
    
    expect(RevenueCatUIToTest).not.toBe(MockRevenueCatUI);

    // Mock the native method for this specific call to avoid errors if it's not fully defined by default Jest mock
    NativeModules.RNPaywalls.presentPaywall = jest.fn().mockResolvedValue(PAYWALL_RESULT.ERROR); // Or some other result

    await RevenueCatUIToTest.presentPaywall();
    expect(NativeModules.RNPaywalls.presentPaywall).toHaveBeenCalled();
  });

  it('should use OriginalRevenueCatUI when global.__EXPO_GO_MOCK_REVENUECAT__ is undefined', async () => {
    (global as any).__EXPO_GO_MOCK_REVENUECAT__ = undefined;
    const RevenueCatUIToTest = require('../../src/index').default;

    expect(RevenueCatUIToTest).not.toBe(MockRevenueCatUI);

    NativeModules.RNPaywalls.presentPaywall = jest.fn().mockResolvedValue(PAYWALL_RESULT.ERROR);

    await RevenueCatUIToTest.presentPaywall();
    expect(NativeModules.RNPaywalls.presentPaywall).toHaveBeenCalled();
  });
});
