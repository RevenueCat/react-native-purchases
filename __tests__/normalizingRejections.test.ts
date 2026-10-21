import { normalizingRejections } from "../src/normalizingRejections";

// React Native's bridge generates each method as a named function and tags it with the
// call type (NativeModules.js: `fn.type = type`), so the wrapper has to pass both on.
function bridgeMethod(result: () => unknown) {
  const fn = function promiseMethodWrapper() {
    return result();
  };
  (fn as typeof fn & { type: string }).type = "promise";
  return fn;
}

function moduleWith(result: () => unknown) {
  return normalizingRejections({ getCustomerInfo: bridgeMethod(result), addListener: () => undefined });
}

describe("the native module wrapper", () => {
  it("keeps what the bridge puts on its methods", () => {
    const wrapped = moduleWith(() => Promise.resolve({}));

    expect(wrapped.getCustomerInfo.name).toBe("promiseMethodWrapper");
    expect((wrapped.getCustomerInfo as unknown as { type: string }).type).toBe("promise");
    expect(Reflect.ownKeys(wrapped.getCustomerInfo)).toEqual(
      Reflect.ownKeys(bridgeMethod(() => Promise.resolve({}))),
    );
  });

  it("normalizes a rejection", async () => {
    const wrapped = moduleWith(() =>
      Promise.reject(Object.assign(new Error("nope"), { code: "11", userInfo: { readableErrorCode: "Bad" } })),
    );

    const error = await wrapped.getCustomerInfo().catch((caught: unknown) => caught);

    expect((error as { readableErrorCode: string }).readableErrorCode).toBe("Bad");
  });

  it("leaves a non-promise return alone", () => {
    const wrapped = normalizingRejections({ addListener: bridgeMethod(() => "sync value") });

    expect(wrapped.addListener()).toBe("sync value");
  });
});
