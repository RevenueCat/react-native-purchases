jest.mock('react-native', () => ({
  NativeModules: {},
  NativeEventEmitter: jest.fn(),
  Platform: { OS: 'web' },
  UIManager: { getViewManagerConfig: () => null },
  requireNativeComponent: jest.fn(),
  View: 'View',
  ScrollView: 'ScrollView',
}));
jest.mock('@revenuecat/purchases-js-hybrid-mappings', () => ({ PurchasesCommon: {} }));
jest.mock('../src/utils/environment', () => ({ shouldUsePreviewAPIMode: () => true }));
jest.mock('../src/preview/previewComponents', () => ({ PreviewPaywall: () => null, PreviewCustomerCenter: () => null }));

import RevenueCatUI from '../src/index';

describe('presentCustomerCenter in preview mode', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves without callbacks', async () => {
    await expect(RevenueCatUI.presentCustomerCenter()).resolves.toBeUndefined();
  });

  it('resolves with callbacks', async () => {
    await expect(
      RevenueCatUI.presentCustomerCenter({ callbacks: { onRestoreStarted: jest.fn() } })
    ).resolves.toBeUndefined();
  });
});
