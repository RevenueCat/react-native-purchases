import { normalizePurchasesError } from "@revenuecat/purchases-typescript-internal";

// The returned promise is chained, never copied: enumerating a TurboModule
// promise's own properties throws inside Hermes.
export function normalizingRejections<T extends object>(module: T): T {
  return new Proxy(module, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof value !== "function") {
        return value;
      }
      // An apply trap keeps what the bridge puts on the method it generated, such as its
      // name and React Native's own call-type marker.
      return new Proxy(value as (...callArgs: unknown[]) => unknown, {
        apply: (method, thisArg, args) => {
          const result = Reflect.apply(method, thisArg, args);
          return result instanceof Promise
            ? result.catch((error: unknown) => {
                throw normalizePurchasesError(error);
              })
            : result;
        },
      });
    },
  });
}
