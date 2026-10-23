import {
  api,
  mockListeners,
  mockNative,
  mount,
  emit,
  Platform,
} from "../testutils/checkpointHarness";

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
