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

const modal = () => tree!.root.findByType("Modal" as any);
const child = () => tree!.root.findByType("CheckpointView" as any);
it.each(["shown-first", "attached-first"])(
  "acknowledges presentation only after both gates: %s",
  async (order) => {
    mount();
    const promise = api.checkpoint("test");
    emit("present", { presentationMode: "pageSheet" });
    const shown = () => act(() => modal().props.onShow());
    const attached = () => act(() => child().props.onAttached());
    (order === "shown-first" ? shown : attached)();
    expect(mockNative.didPresent).not.toHaveBeenCalled();
    (order === "shown-first" ? attached : shown)();
    expect(mockNative.didPresent).toHaveBeenCalledTimes(1);
    attached();
    shown();
    expect(mockNative.didPresent).toHaveBeenCalledTimes(1);
    emit("dismiss");
    expect(modal().props.visible).toBe(false);
    expect(mockNative.didDismiss).not.toHaveBeenCalled();
    act(() => modal().props.onDismiss());
    expect(mockNative.didDismiss).toHaveBeenCalledTimes(1);
    emit("finished");
    await promise;
  }
);
it("attachment failure cancels and rejects the owned request", async () => {
  mount();
  const promise = api.checkpoint("test");
  const rejected = expect(promise).rejects.toThrow(/attach/i);
  emit("present", { presentationMode: "fullScreen" });
  act(() => child().props.onAttachmentFailed());
  expect(mockNative.didFailToPresent).toHaveBeenCalledTimes(1);
  expect(mockNative.cancel).toHaveBeenCalledTimes(1);
  act(() => modal().props.onDismiss());
  emit("finished");
  await rejected;
});
it.each(["loading", "presented", "error"])(
  "unmount during %s releases native ownership and removes listeners",
  async (phase) => {
    mount();
    const promise = api.checkpoint("test");
    const rejected = expect(promise).rejects.toThrow(/cancel/i);
    if (phase !== "loading")
      emit("present", { presentationMode: "fullScreen" });
    if (phase === "error")
      emit("error", {
        requestId: "A",
        kind: "flowActionFailed",
        error: { message: "bad" },
      });
    act(() => tree!.unmount());
    tree = undefined;
    await rejected;
    expect(mockNative.releaseSession).toHaveBeenCalledTimes(1);
    expect(mockListeners.size).toBe(0);
  }
);
it("keeps nested errors in the outer modal and completes error A once before hiding flow", async () => {
  let request: any;
  act(() => {
    tree = renderer.create(
      React.createElement(api.CheckpointHost, {
        renderError: (r) => {
          request = r;
          return React.createElement("ErrorUI");
        },
      })
    );
  });
  const promise = api.checkpoint("test");
  emit("present", { presentationMode: "fullScreen" });
  emit("error", {
    requestId: "A",
    kind: "flowActionFailed",
    error: { message: "bad" },
  });
  expect(modal().findByType("ErrorUI" as any)).toBeTruthy();
  const complete = request.complete;
  emit("dismiss");
  expect(modal().props.visible).toBe(true);
  act(() => complete());
  act(() => complete());
  emit("error", {
    requestId: "A",
    kind: "flowActionFailed",
    error: { message: "duplicate" },
  });
  expect(tree!.root.findAllByType("ErrorUI" as any)).toHaveLength(0);
  expect(mockNative.completeError).toHaveBeenCalledTimes(1);
  expect(modal().props.visible).toBe(false);
  act(() => modal().props.onDismiss());
  emit("finished");
  await promise;
});
it.each(["before", "after"])(
  "renders root errors %s paywall presentation",
  async (phase) => {
    let request: any;
    act(() => {
      tree = renderer.create(
        React.createElement(api.CheckpointHost, {
          renderError: (r) => {
            request = r;
            return React.createElement("ErrorUI");
          },
        })
      );
    });
    const promise = api.checkpoint("test");
    if (phase === "after") {
      emit("present", { presentationMode: "fullScreen" });
      emit("dismiss");
      act(() => modal().props.onDismiss());
    }
    emit("error", {
      requestId: "A",
      kind: "flowCouldNotBeShown",
      error: { message: "bad" },
    });
    expect(tree!.root.findByType("ErrorUI" as any)).toBeTruthy();
    expect(tree!.root.findAllByType("Modal" as any)).toHaveLength(0);
    act(() => request.complete());
    emit("finished");
    await promise;
  }
);
it("stale callbacks cannot close a replacement session or complete its error", async () => {
  let request: any;
  act(() => {
    tree = renderer.create(
      React.createElement(api.CheckpointHost, {
        renderError: (r) => {
          request = r;
          return null;
        },
      })
    );
  });
  const passed = jest.fn();
  const first = api.checkpoint("first", {}, passed);
  const rejected = expect(first).rejects.toThrow(/cancel/i);
  emit("error", { requestId: "A", kind: "flowCouldNotBeShown", error: {} });
  const stale = request.complete;
  const oldId = mockNative.start.mock.calls[0]![0];
  const oldListeners = [...mockListeners];
  act(() => tree!.unmount());
  await rejected;
  mount();
  const replacementPassed = jest.fn();
  const second = api.checkpoint("second", {}, replacementPassed);
  act(() => {
    stale();
    oldListeners.forEach((cb) =>
      cb({ sessionId: oldId, type: "passed", flow: null })
    );
  });
  expect(mockNative.completeError).not.toHaveBeenCalled();
  expect(passed).not.toHaveBeenCalled();
  expect(replacementPassed).not.toHaveBeenCalled();
  oldListeners.forEach((cb) => cb({ sessionId: oldId, type: "finished" }));
  expect(mockNative.releaseSession).toHaveBeenCalledTimes(1);
  emit("finished", {}, mockNative.start.mock.calls[1]![0]);
  await second;
});
it("rejects duplicate host registration without taking ownership", () => {
  mount();
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  expect(() =>
    act(() => {
      renderer.create(
        React.createElement(api.CheckpointHost, { renderError: () => null })
      );
    })
  ).toThrow(/one|already/i);
  error.mockRestore();
});

it("waits for native terminal cleanup on user cancellation and ignores duplicate dismissal", async () => {
  mount();
  const promise = api.checkpoint("test");
  const rejected = expect(promise).rejects.toThrow(/cancel/i);
  emit("present", { presentationMode: "fullScreen" });
  act(() => modal().props.onRequestClose());
  expect(mockNative.cancel).toHaveBeenCalledTimes(1);
  const dismiss = modal().props.onDismiss;
  emit("dismiss");
  act(() => dismiss());
  act(() => dismiss());
  expect(mockNative.didDismiss).toHaveBeenCalledTimes(1);
  emit("finished");
  await rejected;
});
it("gives successive native error requests fresh consumer UI state", async () => {
  class ErrorContent extends React.Component<
    { request: any },
    { visible: boolean }
  > {
    state = { visible: true };
    render() {
      return React.createElement("ErrorModal", {
        visible: this.state.visible,
        hide: () => this.setState({ visible: false }),
        onDismiss: this.props.request.complete,
      });
    }
  }
  act(() => {
    tree = renderer.create(
      React.createElement(api.CheckpointHost, {
        renderError: (request) =>
          React.createElement(ErrorContent, { request }),
      })
    );
  });
  const promise = api.checkpoint("test");
  void promise.catch(() => {});
  emit("error", {
    requestId: "A",
    kind: "flowCouldNotBeShown",
    error: { message: "first" },
  });
  const first = tree!.root.findByType("ErrorModal" as any);
  const completeA = first.props.onDismiss;
  emit("error", {
    requestId: "B",
    kind: "flowCouldNotBeShown",
    error: { message: "second" },
  });
  act(() => first.props.hide());
  act(() => completeA());
  expect(tree!.root.findByType("ErrorModal" as any).props.visible).toBe(true);
  act(() => completeA());
  expect(mockNative.completeError).toHaveBeenCalledTimes(1);
  act(() => tree!.root.findByType("ErrorModal" as any).props.onDismiss());
  emit("finished");
  await promise;
});
