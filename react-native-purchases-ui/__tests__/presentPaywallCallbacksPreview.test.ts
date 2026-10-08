const mockPreviewRNPaywalls = {
  presentPaywall: jest.fn((..._args: unknown[]) => Promise.resolve('NOT_PRESENTED')),
};

jest.mock('react-native', () => ({
  NativeModules: {},
  NativeEventEmitter: jest.fn(),
  Platform: { OS: 'web' },
  UIManager: { getViewManagerConfig: () => null },
  requireNativeComponent: jest.fn(),
  View: 'View',
  ScrollView: 'ScrollView',
}));
jest.mock('../src/utils/environment', () => ({ shouldUsePreviewAPIMode: () => true }));
jest.mock('../src/preview/nativeModules', () => ({
  previewNativeModuleRNPaywalls: mockPreviewRNPaywalls,
  previewNativeModuleRNCustomerCenter: {},
}));
jest.mock('../src/preview/previewComponents', () => ({ PreviewPaywall: () => null, PreviewCustomerCenter: () => null }));

import { NativeEventEmitter } from 'react-native';
import RevenueCatUI from '../src/index';

describe('presentPaywall callbacks in preview mode', () => {
  it('presents without routing events', async () => {
    const promise = RevenueCatUI.presentPaywall({ callbacks: { onInteraction: jest.fn() } });

    expect(mockPreviewRNPaywalls.presentPaywall.mock.calls[0]?.slice(-2)).toEqual([null, false]);
    expect(NativeEventEmitter).not.toHaveBeenCalled();
    await expect(promise).resolves.toBe('NOT_PRESENTED');
  });
});
