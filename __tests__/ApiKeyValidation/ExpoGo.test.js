const { NativeModules } = require("react-native");

beforeEach(() => {
    // surpress console output caused by the exceptions thrown (which we expect and assert against)
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

Object.defineProperty(NativeModules, 'RNPurchases', {
    value: undefined
  });

globalThis.expo = { modules: { ExpoGo: {} } };

describe("Purchases.configure API key validation tests (Expo Go)", () => {
  var Purchases;

  beforeEach(() => {
    Purchases = require("../../dist/index").default;
  });

  it("calling configure with a native api key when using the Expo Go environment throws an exception", () => {
    const expectedError = new Error('Invalid API key. The native store is not available when running inside Expo Go, please use your Test Store API Key or create a development build in order to use native features. See https://rev.cat/sdk-test-store on how to use the Test Store.');

    expect(() => {
      globalThis.expo = { modules: { ExpoGo: {} } };
      Purchases.configure({ apiKey: "appl_a" });
    }).toThrow(expectedError);

    expect(() => {
      globalThis.expo = { modules: { ExpoGo: {} } };
      Purchases.configure({ apiKey: "goog_a" });
    }).toThrow(expectedError);

    expect(() => {
      globalThis.expo = { modules: { ExpoGo: {} } };
      Purchases.configure({ apiKey: "amzn_a" });
    }).toThrow(expectedError);
  });
});