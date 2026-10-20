type Listener = (body: unknown) => void;
const mockListeners = new Map<string, Set<Listener>>();
const mockRNPaywalls = {
  presentPaywall: jest.fn((..._args: unknown[]) => new Promise(() => {})),
};
const mockRNCustomerCenter = {
  presentCustomerCenter: jest.fn((..._args: unknown[]) => new Promise(() => {})),
};

jest.mock('react-native', () => ({
  NativeModules: { RNPaywalls: mockRNPaywalls, RNCustomerCenter: mockRNCustomerCenter },
  NativeEventEmitter: class {
    addListener(eventName: string, listener: Listener) {
      if (!mockListeners.has(eventName)) mockListeners.set(eventName, new Set());
      mockListeners.get(eventName)!.add(listener);
      return { remove: () => mockListeners.get(eventName)!.delete(listener) };
    }
  },
  Platform: { OS: 'ios', select: () => ({}) },
  UIManager: { getViewManagerConfig: () => ({}) },
  requireNativeComponent: (name: string) => name,
  View: 'View',
  ScrollView: 'ScrollView',
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (initial: unknown) => [initial, () => {}],
  useEffect: () => {},
}));
jest.mock('../src/preview/nativeModules', () => ({ previewNativeModuleRNPaywalls: {}, previewNativeModuleRNCustomerCenter: {} }));
jest.mock('../src/preview/previewComponents', () => ({ PreviewPaywall: () => null, PreviewCustomerCenter: () => null }));

import RevenueCatUI from '../src/index';

type Element = { type: unknown; props: Record<string, any> };

const rawNativeError = () => ({
  code: 1,
  message: 'Purchase was cancelled.',
  readableErrorCode: 'PURCHASE_CANCELLED',
  underlyingErrorMessage: '',
});

const expectNormalized = (callback: jest.Mock) => {
  expect(callback).toHaveBeenCalledTimes(1);
  const { error } = callback.mock.calls[0][0];
  expect(error.code).toBe('1');
  expect(error.userInfo.readableErrorCode).toBe('PURCHASE_CANCELLED');
  expect(error.readableErrorCode).toBe('PURCHASE_CANCELLED');
  expect(error.message).toBe('Purchase was cancelled.');
  expect(error.underlyingErrorMessage).toBe('');
  expect(error.userCancelled).toBe(true);
};

const renderInternal = (element: Element): Element =>
  (element.type as (props: Record<string, any>) => Element)(element.props);

const findFooterView = (container: Element): Element => {
  const children = container.props.children as Element[];
  return renderInternal(children.find(child => typeof child.type === 'function')!);
};

beforeEach(() => {
  mockListeners.clear();
  jest.clearAllMocks();
});

describe('error callbacks receive a normalized PurchasesError', () => {
  it('from the Paywall view', () => {
    const onPurchaseError = jest.fn();
    const onRestoreError = jest.fn();
    const nativeView = renderInternal(RevenueCatUI.Paywall({ onPurchaseError, onRestoreError }) as Element);

    nativeView.props.onPurchaseError({ nativeEvent: { error: rawNativeError() } });
    nativeView.props.onRestoreError({ nativeEvent: { error: rawNativeError() } });

    expectNormalized(onPurchaseError);
    expectNormalized(onRestoreError);
  });

  it('from the paywall footer view', () => {
    const onPurchaseError = jest.fn();
    const onRestoreError = jest.fn();
    const footer = RevenueCatUI.OriginalTemplatePaywallFooterContainerView({ onPurchaseError, onRestoreError });
    const nativeView = findFooterView(footer as Element);

    nativeView.props.onPurchaseError({ nativeEvent: { error: rawNativeError() } });
    nativeView.props.onRestoreError({ nativeEvent: { error: rawNativeError() } });

    expectNormalized(onPurchaseError);
    expectNormalized(onRestoreError);
  });

  it('from presentPaywall callbacks', () => {
    const onPurchaseError = jest.fn();
    const onRestoreError = jest.fn();
    RevenueCatUI.presentPaywall({ callbacks: { onPurchaseError, onRestoreError } });
    const args = mockRNPaywalls.presentPaywall.mock.calls[0]!;
    const presentationId = args[args.length - 2];

    mockListeners.get('Paywalls-onPurchaseError')!.forEach(listener => listener({ error: rawNativeError(), presentationId }));
    mockListeners.get('Paywalls-onRestoreError')!.forEach(listener => listener({ error: rawNativeError(), presentationId }));

    expectNormalized(onPurchaseError);
    expectNormalized(onRestoreError);
  });

  it('from the CustomerCenter view', () => {
    const onRestoreFailed = jest.fn();
    const nativeView = RevenueCatUI.CustomerCenterView({ onRestoreFailed }) as Element;

    nativeView.props.onRestoreFailed({ nativeEvent: { error: rawNativeError() } });

    expectNormalized(onRestoreFailed);
  });

  it('from presentCustomerCenter callbacks', () => {
    const onRestoreFailed = jest.fn();
    RevenueCatUI.presentCustomerCenter({ callbacks: { onRestoreFailed } });

    mockListeners.get('onRestoreFailed')!.forEach(listener => listener({ error: rawNativeError() }));

    expectNormalized(onRestoreFailed);
  });
});
