import React from 'react';

let mockPreview = false;
let mockHasNativeView = true;
const mockPlatform = { OS: 'ios' };
const mockRequireNativeComponent = jest.fn(() => 'NativePortal');

jest.mock('react-native', () => ({
  Platform: mockPlatform,
  UIManager: { getViewManagerConfig: () => mockHasNativeView ? {} : null },
  requireNativeComponent: mockRequireNativeComponent,
  useWindowDimensions: () => ({ width: 400, height: 800 }),
}));
jest.mock('../src/utils/environment', () => ({ shouldUsePreviewAPIMode: () => mockPreview }));

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  mockPreview = false;
  mockHasNativeView = true;
  mockPlatform.OS = 'ios';
});

it('passes children directly to the native portal so newly mounted errors trigger native placement', () => {
  const { PaywallPortal } = require('../src/PaywallPortal');
  const child = <React.Fragment>error</React.Fragment>;
  const dismissed = jest.fn();
  const element = PaywallPortal({children: child, onHostDismissed: dismissed});
  expect(mockRequireNativeComponent).toHaveBeenCalledWith('RCPaywallPortalView');
  expect(element.type).toBe('NativePortal');
  expect(element.props.children).toBe(child);
  expect(element.props.pointerEvents).toBe('box-none');
  expect(element.props.style).toEqual({position: 'absolute', top: 0, left: 0, width: 400, height: 800});
  element.props.onHostDismissed();
  expect(dismissed).toHaveBeenCalledTimes(1);
});

it.each(['android', 'preview'])('keeps children in the React tree in %s', environment => {
  mockPreview = environment === 'preview';
  mockPlatform.OS = environment === 'android' ? 'android' : 'ios';
  const { PaywallPortal } = require('../src/PaywallPortal');
  const child = <React.Fragment>error</React.Fragment>;
  expect(PaywallPortal({children: child}).props.children).toBe(child);
  expect(mockRequireNativeComponent).not.toHaveBeenCalled();
});

it('reports a missing native view on iOS', () => {
  mockHasNativeView = false;
  const { PaywallPortal } = require('../src/PaywallPortal');
  expect(() => PaywallPortal({})).toThrow('PaywallPortal native view not found');
});
