type Event = { sessionId: string; type: string; [key: string]: unknown };
const mockListeners = new Set<(event: Event) => void>();
const mockNative = {
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
const api = RevenueCatUI as unknown as {
  checkpoint: (
    id: string,
    options?: object,
    passed?: (result: unknown) => void
  ) => Promise<void>;
  CheckpointHost: React.ComponentType<{
    renderError: (request: any) => React.ReactNode;
  }>;
};
let tree: renderer.ReactTestRenderer | undefined;
const mount = () =>
  act(() => {
    tree = renderer.create(
      React.createElement(api.CheckpointHost, { renderError: () => null })
    );
  });
const emit = (
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
  act(() => tree?.unmount());
  tree = undefined;
  expect(mockListeners.size).toBe(0);
});
it("rejects missing host before starting native work", async () => {
  expect(typeof api.checkpoint).toBe("function");
  await expect(api.checkpoint("test")).rejects.toThrow(/host/i);
  expect(mockNative.start).not.toHaveBeenCalled();
});
it("rejects unsupported platforms before native work", async () => {
  mount();
  (Platform as any).OS = "android";
  await expect(api.checkpoint("test")).rejects.toThrow(/unsupported|iOS/i);
  expect(mockNative.start).not.toHaveBeenCalled();
});
it("subscribes before start, filters sessions, delivers no-match once, and waits for finished", async () => {
  mount();
  const passed = jest.fn();
  let settled = false;
  mockNative.start.mockImplementationOnce(() =>
    expect(mockListeners.size).toBe(1)
  );
  const promise = api.checkpoint("test", {}, passed).then(() => {
    settled = true;
  });
  emit("passed", { flow: null }, "stale");
  expect(passed).not.toHaveBeenCalled();
  emit("passed", { flow: null });
  emit("passed", { flow: null });
  expect(passed).toHaveBeenCalledTimes(1);
  expect(passed).toHaveBeenCalledWith({ flow: null });
  await Promise.resolve();
  expect(settled).toBe(false);
  emit("finished");
  await promise;
});
it("finishes suppressed native executions without synthesizing passed", async () => {
  mount();
  const passed = jest.fn();
  const promise = api.checkpoint("test", {}, passed);
  emit("finished");
  await promise;
  expect(passed).not.toHaveBeenCalled();
});
it("rejects a second request without borrowing the first session", async () => {
  mount();
  const first = api.checkpoint("first");
  await expect(api.checkpoint("second")).rejects.toThrow(/active|progress/i);
  expect(mockNative.start).toHaveBeenCalledTimes(1);
  emit("finished");
  await first;
});
it("does not let a throwing passed callback strand cleanup", async () => {
  mount();
  const promise = api.checkpoint("test", {}, () => {
    throw Error("consumer");
  });
  expect(() => emit("passed", { flow: null })).not.toThrow();
  emit("finished");
  await promise;
});
it("preserves typed custom variables and the native obtained entitlements result", async () => {
  mount();
  const passed = jest.fn();
  const promise = api.checkpoint(
    "workflow",
    {
      presentationMode: "pageSheet",
      customVariables: {
        level: { type: "number", value: 42 },
        enabled: { type: "boolean", value: true },
        name: { type: "string", value: "Sam" },
      },
    },
    passed
  );
  expect(mockNative.start.mock.calls[0]!.slice(1)).toEqual([
    "workflow",
    { level: 42, enabled: true, name: "Sam" },
    "pageSheet",
  ]);
  const flow = {
    obtainedEntitlements: [{ identifier: "pro", productIdentifier: "annual" }],
  };
  emit("passed", { flow });
  emit("passed", { flow });
  expect(passed).toHaveBeenCalledTimes(1);
  expect(passed).toHaveBeenCalledWith({ flow });
  emit("finished");
  await promise;
});
