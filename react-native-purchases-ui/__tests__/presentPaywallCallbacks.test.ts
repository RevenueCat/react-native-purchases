type Listener = (body: unknown) => void;
const mockListeners = new Map<string, Set<Listener>>();
// The events travel on RCTDeviceEventEmitter, which is global and keyed by name alone.
const EVENT_PREFIX = 'Paywalls-';
const emit = (eventName: string, body?: unknown) =>
  mockListeners.get(EVENT_PREFIX + eventName)?.forEach(listener => listener(body));

let resolvePresent: (result: string) => void = () => {};
let rejectPresent: (error: unknown) => void = () => {};
const presentation = () => new Promise<string>((resolve, reject) => {
  resolvePresent = resolve;
  rejectPresent = reject;
});
const mockRNPaywalls = {
  presentPaywall: jest.fn((..._args: unknown[]) => presentation()),
  presentPaywallIfNeeded: jest.fn((..._args: unknown[]) => presentation()),
  resumePurchasePackageInitiated: jest.fn(),
};

jest.mock('react-native', () => ({
  NativeModules: { RNPaywalls: mockRNPaywalls, RNCustomerCenter: {} },
  NativeEventEmitter: class {
    addListener(eventName: string, listener: Listener) {
      if (!mockListeners.has(eventName)) mockListeners.set(eventName, new Set());
      mockListeners.get(eventName)!.add(listener);
      return { remove: () => mockListeners.get(eventName)!.delete(listener) };
    }
  },
  Platform: { OS: 'ios' },
  UIManager: { getViewManagerConfig: () => null },
  requireNativeComponent: jest.fn(),
  View: 'View',
  ScrollView: 'ScrollView',
}));
jest.mock('../src/preview/nativeModules', () => ({ previewNativeModuleRNPaywalls: {}, previewNativeModuleRNCustomerCenter: {} }));
jest.mock('../src/preview/previewComponents', () => ({ PreviewPaywall: () => null, PreviewCustomerCenter: () => null }));

import RevenueCatUI from '../src/index';

const registeredListenerCount = () => [...mockListeners.values()].reduce((sum, set) => sum + set.size, 0);
const hasCallbacksArg = (mock: jest.Mock, argumentCount: number) => mock.mock.calls[0][argumentCount - 1];

beforeEach(() => {
  mockListeners.clear();
  jest.clearAllMocks();
});

describe('presentPaywall callbacks', () => {
  it('passes hasCallbacks=false and subscribes to nothing without callbacks', async () => {
    const promise = RevenueCatUI.presentPaywall();
    expect(hasCallbacksArg(mockRNPaywalls.presentPaywall, 6)).toBe(false);
    expect(registeredListenerCount()).toBe(0);
    resolvePresent('CANCELLED');
    await expect(promise).resolves.toBe('CANCELLED');
  });

  it('passes hasCallbacks=false when the callbacks object is empty', async () => {
    const promise = RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'pro', callbacks: {} });
    expect(hasCallbacksArg(mockRNPaywalls.presentPaywallIfNeeded, 7)).toBe(false);
    expect(registeredListenerCount()).toBe(0);
    resolvePresent('NOT_PRESENTED');
    await expect(promise).resolves.toBe('NOT_PRESENTED');
  });

  it('passes hasCallbacks=false when every callback is undefined', async () => {
    const promise = RevenueCatUI.presentPaywall({ callbacks: { onInteraction: undefined } });
    expect(hasCallbacksArg(mockRNPaywalls.presentPaywall, 6)).toBe(false);
    expect(registeredListenerCount()).toBe(0);
    resolvePresent('CANCELLED');
    await expect(promise).resolves.toBe('CANCELLED');
  });

  it('forwards events while presented and removes the subscriptions afterwards', async () => {
    const onPurchaseStarted = jest.fn();
    const onUrlOpened = jest.fn();
    const onInteraction = jest.fn();
    const promise = RevenueCatUI.presentPaywall({ callbacks: { onPurchaseStarted, onUrlOpened, onInteraction } });
    expect(hasCallbacksArg(mockRNPaywalls.presentPaywall, 6)).toBe(true);
    expect([...mockListeners.keys()].every(name => name.startsWith(EVENT_PREFIX))).toBe(true);

    emit('onPurchaseStarted', { packageBeingPurchased: { identifier: 'monthly' } });
    emit('onUrlOpened', { url: 'https://example.com' });
    emit('onInteraction', { component_type: 'tab', component_value: 'yearly' });
    expect(onPurchaseStarted).toHaveBeenCalledWith({ packageBeingPurchased: { identifier: 'monthly' } });
    expect(onUrlOpened).toHaveBeenCalledWith('https://example.com');
    expect(onInteraction).toHaveBeenCalledWith({ component_type: 'tab', component_value: 'yearly' });

    resolvePresent('PURCHASED');
    await expect(promise).resolves.toBe('PURCHASED');
    expect(registeredListenerCount()).toBe(0);
  });

  it('removes the subscriptions when the presentation fails', async () => {
    const promise = RevenueCatUI.presentPaywall({ callbacks: { onInteraction: jest.fn() } });
    expect(registeredListenerCount()).toBeGreaterThan(0);

    rejectPresent(new Error('PAYWALLS_MISSING_WRONG_ACTIVITY'));
    await expect(promise).rejects.toThrow('PAYWALLS_MISSING_WRONG_ACTIVITY');
    expect(registeredListenerCount()).toBe(0);
  });

  it('auto-resumes a purchase when onPurchasePackageInitiated is not provided', async () => {
    const promise = RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'pro',
      callbacks: { onPurchaseCompleted: jest.fn() },
    });
    emit('onPurchasePackageInitiated', { packageBeingPurchased: {}, requestId: 'req-1' });
    expect(mockRNPaywalls.resumePurchasePackageInitiated).toHaveBeenCalledWith('req-1', true);
    resolvePresent('NOT_PRESENTED');
    await expect(promise).resolves.toBe('NOT_PRESENTED');
    expect(registeredListenerCount()).toBe(0);
  });

  it('lets onPurchasePackageInitiated decide whether the purchase proceeds', async () => {
    const promise = RevenueCatUI.presentPaywall({
      callbacks: { onPurchasePackageInitiated: ({ resume }) => resume(false) },
    });
    emit('onPurchasePackageInitiated', { packageBeingPurchased: {}, requestId: 'req-2' });
    expect(mockRNPaywalls.resumePurchasePackageInitiated).toHaveBeenCalledWith('req-2', false);
    resolvePresent('CANCELLED');
    await expect(promise).resolves.toBe('CANCELLED');
    expect(registeredListenerCount()).toBe(0);
  });
});
