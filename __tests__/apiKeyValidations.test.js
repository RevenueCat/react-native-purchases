const { NativeModules } = require("react-native");

describe("Purchases.configure API key validation tests", () => {
  var Purchases;

  it("calling configure with a native api key when using the expo go browser environment throws an exception", () => {
    expect(() => {
      const purchases = NativeModules.RNPurchases;
      NativeModules.RNPurchases = undefined;
      globalThis.expo = { modules: { ExpoGo: {} } };
      Purchases.configure({ apiKey: "appl_a" });
      NativeModules.RNPurchases = purchases;
    }).toThrowError();

    expect(() => {
      NativeModules.RNPurchases = undefined;
      globalThis.expo = { modules: { ExpoGo: {} } };
      Purchases.configure({ apiKey: "goog_a" });
    }).toThrowError();

    expect(() => {
      NativeModules.RNPurchases = undefined;
      globalThis.expo = { modules: { ExpoGo: {} } };
      Purchases.configure({ apiKey: "amzn_a" });
    }).toThrowError();
  });

  it("calling configure with a native api key when using the rork sandbox environment throws an exception", () => {
    expect(() => {
      const purchases = NativeModules.RNPurchases;
      NativeModules.RNPurchases = undefined;
      NativeModules.RorkSandbox = {};
      Purchases.configure({ apiKey: "appl_a" });
      NativeModules.RNPurchases = purchases;
    }).toThrowError();

    expect(() => {
      NativeModules.RNPurchases = undefined;
      NativeModules.RorkSandbox = {};
      Purchases.configure({ apiKey: "goog_a" });
    }).toThrowError();

    expect(() => {
      NativeModules.RNPurchases = undefined;
      NativeModules.RorkSandbox = {};
      Purchases.configure({ apiKey: "amzn_a" });
    }).toThrowError();
  });
});
