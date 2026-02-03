const { NativeModules } = require("react-native");

describe("when RNPurchases native module is null", () => {
  let Purchases;
  let originalRNPurchases;

  beforeEach(() => {
    // Save the original mock
    originalRNPurchases = NativeModules.RNPurchases;
    // Set to null to simulate missing native module
    NativeModules.RNPurchases = null;
    // Clear module cache and re-import
    jest.resetModules();
    Purchases = require("../dist/index").default;
  });

  afterEach(() => {
    // Restore original mock
    NativeModules.RNPurchases = originalRNPurchases;
  });

  it("isConfigured() should return false instead of crashing", async () => {
    const result = await Purchases.isConfigured();
    expect(result).toBe(false);
  });

  it("canMakePayments() should return false instead of crashing", async () => {
    const result = await Purchases.canMakePayments();
    expect(result).toBe(false);
  });

  it("configure() should throw a helpful error message", () => {
    expect(() => {
      Purchases.configure({ apiKey: "test_api_key" });
    }).toThrow("Native module (RNPurchases) not found");
  });
});
