type Listener = (body: unknown) => void;
const mockListeners = new Map<string, Set<Listener>>();
// The events travel on RCTDeviceEventEmitter, which is global and keyed by name alone.
const EVENT_PREFIX = 'Paywalls-';
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

import RevenueCatUI, { type PaywallCallbacks } from '../src/index';

const registeredListenerCount = () => [...mockListeners.values()].reduce((sum, set) => sum + set.size, 0);
const nativeArgs = (mock: jest.Mock) => mock.mock.calls[mock.mock.calls.length - 1];
const presentationIdArg = (mock: jest.Mock) => nativeArgs(mock)[nativeArgs(mock).length - 2];
const jsResumesPurchaseArg = (mock: jest.Mock) => nativeArgs(mock)[nativeArgs(mock).length - 1];
const emitTo = (presentationId: string, eventName: string, body: Record<string, unknown> = {}) =>
  mockListeners.get(EVENT_PREFIX + eventName)?.forEach(listener => listener({ ...body, presentationId }));

beforeEach(() => {
  mockListeners.clear();
  jest.clearAllMocks();
});

describe('presentPaywall callbacks', () => {
  it('passes no presentation id and subscribes to nothing without callbacks', async () => {
    const promise = RevenueCatUI.presentPaywall();
    expect(presentationIdArg(mockRNPaywalls.presentPaywall)).toBeNull();
    expect(jsResumesPurchaseArg(mockRNPaywalls.presentPaywall)).toBe(false);
    expect(registeredListenerCount()).toBe(0);
    resolvePresent('CANCELLED');
    await expect(promise).resolves.toBe('CANCELLED');
  });

  it('passes no presentation id when the callbacks object is empty', async () => {
    const promise = RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'pro', callbacks: {} });
    expect(presentationIdArg(mockRNPaywalls.presentPaywallIfNeeded)).toBeNull();
    expect(registeredListenerCount()).toBe(0);
    resolvePresent('NOT_PRESENTED');
    await expect(promise).resolves.toBe('NOT_PRESENTED');
  });

  it('detects callbacks defined as methods on a class instance', async () => {
    const cancelled = jest.fn();
    class Handlers implements PaywallCallbacks {
      onPurchaseCancelled() {
        cancelled();
      }
    }
    const promise = RevenueCatUI.presentPaywall({ callbacks: new Handlers() });
    const presentationId = presentationIdArg(mockRNPaywalls.presentPaywall);
    expect(typeof presentationId).toBe('string');

    emitTo(presentationId, 'onPurchaseCancelled');
    expect(cancelled).toHaveBeenCalledTimes(1);

    resolvePresent('CANCELLED');
    await expect(promise).resolves.toBe('CANCELLED');
  });

  it('passes no presentation id when every callback is undefined', async () => {
    const promise = RevenueCatUI.presentPaywall({ callbacks: { onInteraction: undefined } });
    expect(presentationIdArg(mockRNPaywalls.presentPaywall)).toBeNull();
    expect(registeredListenerCount()).toBe(0);
    resolvePresent('CANCELLED');
    await expect(promise).resolves.toBe('CANCELLED');
  });

  it('forwards events while presented and removes the subscriptions afterwards', async () => {
    const onPurchaseStarted = jest.fn();
    const onUrlOpened = jest.fn();
    const onInteraction = jest.fn();
    const promise = RevenueCatUI.presentPaywall({ callbacks: { onPurchaseStarted, onUrlOpened, onInteraction } });
    const presentationId = presentationIdArg(mockRNPaywalls.presentPaywall);
    expect(typeof presentationId).toBe('string');
    expect([...mockListeners.keys()].every(name => name.startsWith(EVENT_PREFIX))).toBe(true);

    emitTo(presentationId, 'onPurchaseStarted', { packageBeingPurchased: { identifier: 'monthly' } });
    emitTo(presentationId, 'onUrlOpened', { url: 'https://example.com' });
    emitTo(presentationId, 'onInteraction', { component_type: 'tab', component_value: 'yearly' });
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

  it('delivers an event only to the presentation that produced it', async () => {
    const firstCancelled = jest.fn();
    const secondCancelled = jest.fn();

    const first = RevenueCatUI.presentPaywall({ callbacks: { onPurchaseCancelled: firstCancelled } });
    const firstId = presentationIdArg(mockRNPaywalls.presentPaywall);
    const resolveFirst = resolvePresent;

    const second = RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'pro',
      callbacks: { onPurchaseCancelled: secondCancelled },
    });
    const secondId = presentationIdArg(mockRNPaywalls.presentPaywallIfNeeded);
    const resolveSecond = resolvePresent;
    expect(secondId).not.toBe(firstId);

    emitTo(firstId, 'onPurchaseCancelled');
    expect(firstCancelled).toHaveBeenCalledTimes(1);
    expect(secondCancelled).not.toHaveBeenCalled();

    emitTo(secondId, 'onPurchaseCancelled');
    expect(firstCancelled).toHaveBeenCalledTimes(1);
    expect(secondCancelled).toHaveBeenCalledTimes(1);

    resolveSecond('NOT_PRESENTED');
    await expect(second).resolves.toBe('NOT_PRESENTED');

    // The first is still up, so its callbacks must survive the second one finishing.
    emitTo(firstId, 'onPurchaseCancelled');
    expect(firstCancelled).toHaveBeenCalledTimes(2);

    resolveFirst('CANCELLED');
    await expect(first).resolves.toBe('CANCELLED');
    expect(registeredListenerCount()).toBe(0);
  });

  it('leaves purchase-initiated to native when onPurchasePackageInitiated is not provided', async () => {
    const promise = RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'pro',
      callbacks: { onPurchaseCompleted: jest.fn() },
    });
    expect(jsResumesPurchaseArg(mockRNPaywalls.presentPaywallIfNeeded)).toBe(false);
    expect(mockListeners.has(EVENT_PREFIX + 'onPurchasePackageInitiated')).toBe(false);
    const presentationId = presentationIdArg(mockRNPaywalls.presentPaywallIfNeeded);
    emitTo(presentationId, 'onPurchasePackageInitiated', { packageBeingPurchased: {}, requestId: 'req-1' });
    expect(mockRNPaywalls.resumePurchasePackageInitiated).not.toHaveBeenCalled();
    resolvePresent('NOT_PRESENTED');
    await expect(promise).resolves.toBe('NOT_PRESENTED');
    expect(registeredListenerCount()).toBe(0);
  });

  it('lets onPurchasePackageInitiated decide whether the purchase proceeds', async () => {
    const promise = RevenueCatUI.presentPaywall({
      callbacks: { onPurchasePackageInitiated: ({ resume }) => resume(false) },
    });
    expect(jsResumesPurchaseArg(mockRNPaywalls.presentPaywall)).toBe(true);
    const presentationId = presentationIdArg(mockRNPaywalls.presentPaywall);
    emitTo(presentationId, 'onPurchasePackageInitiated', { packageBeingPurchased: {}, requestId: 'req-2' });
    expect(mockRNPaywalls.resumePurchasePackageInitiated).toHaveBeenCalledWith('req-2', false);
    resolvePresent('CANCELLED');
    await expect(promise).resolves.toBe('CANCELLED');
    expect(registeredListenerCount()).toBe(0);
  });
});
