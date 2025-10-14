const { NativeModules } = require("react-native");

beforeEach(() => {
    // surpress console output caused by the exceptions thrown (which we expect and assert against)
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe("Purchases.configure API key validation tests (Rork Sandbox)", () => {
  var Purchases;
  
  Object.defineProperty(NativeModules, 'RorkSandbox', {
    value: true
  });

  beforeEach(() => {
    Purchases = require("../../dist/index").default;
  });

  it("calling configure with a native api key when using Rork sandbox environment throws an exception", () => {
    const expectedError = new Error('Invalid API key. The native store is not available when running inside Rork sandbox, please use your Test Store API Key or create a development build in order to use native features. See https://rev.cat/sdk-test-store on how to use the Test Store.');

    expect(() => {
      Purchases.configure({ apiKey: "appl_a" });
    }).toThrow(expectedError);

    expect(() => {
      Purchases.configure({ apiKey: "goog_a" });
    }).toThrow(expectedError);

    expect(() => {
      Purchases.configure({ apiKey: "amzn_a" });
    }).toThrow(expectedError);
  });
});