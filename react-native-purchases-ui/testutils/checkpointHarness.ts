type Event = { sessionId: string; type: string; [key: string]: unknown };
export const mockListeners = new Set<(event: Event) => void>();
export const mockNative = {
  start: jest.fn(),
  cancel: jest.fn(),
  releaseSession: jest.fn(),
  didPresent: jest.fn(),
  didFailToPresent: jest.fn(),
  didDismiss: jest.fn(),
  completeError: jest.fn(),
};
jest.mock("react-native", () => ({
  NativeModules: {
    RNCheckpoints: mockNative,
    RNPaywalls: {},
    RNCustomerCenter: {},
  },
  NativeEventEmitter: class {
    addListener(_name: string, cb: (event: Event) => void) {
      mockListeners.add(cb);
      return { remove: () => mockListeners.delete(cb) };
    }
  },
  Platform: { OS: "ios" },
  UIManager: { getViewManagerConfig: () => ({}) },
  requireNativeComponent: () => "CheckpointView",
  Modal: "Modal",
  View: "View",
  ScrollView: "ScrollView",
}));
jest.mock("../src/preview/nativeModules", () => ({}));
jest.mock("../src/preview/previewComponents", () => ({}));
import React from "react";
import renderer, { act } from "react-test-renderer";
import { Platform } from "react-native";
import RevenueCatUI from "../src";
export const api = RevenueCatUI as unknown as {
  checkpoint: (
    id: string,
    options?: object,
    passed?: (result: unknown) => void
  ) => Promise<void>;
  CheckpointHost: React.ComponentType<{
    renderError: (request: any) => React.ReactNode;
  }>;
};
// Jest loads this module in each suite's isolated environment. Keep per-test
// cleanup here so the two suites exercise the same listener ownership contract.
export const harness: { tree?: renderer.ReactTestRenderer } = {};
export const mount = (
  renderError: React.ComponentProps<
    typeof api.CheckpointHost
  >["renderError"] = () => null
) =>
  act(() => {
    harness.tree = renderer.create(
      React.createElement(api.CheckpointHost, { renderError })
    );
  });
export const unmount = () => {
  act(() => harness.tree?.unmount());
  harness.tree = undefined;
};
export const emit = (
  type: string,
  values = {},
  id = mockNative.start.mock.calls[0]![0]
) =>
  act(() =>
    mockListeners.forEach((cb) => cb({ sessionId: id, type, ...values }))
  );
beforeEach(() => {
  jest.clearAllMocks();
  (Platform as any).OS = "ios";
});
afterEach(() => {
  unmount();
  expect(mockListeners.size).toBe(0);
});

export { Platform };
