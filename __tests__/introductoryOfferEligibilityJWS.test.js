const mockReactNative = require("react-native");
const { NativeModules, Platform } = mockReactNative;
let mockBrowserMode = false;
jest.mock("../dist/utils/environment", () => ({ shouldUseBrowserMode: () => mockBrowserMode }));
jest.mock("../dist/browser/nativeModule", () => ({ browserNativeModuleRNPurchases: {
  isConfigured: jest.fn().mockResolvedValue(true), purchasePackage: jest.fn(), purchaseProduct: jest.fn(),
} }));

const product = { identifier: "product", productCategory: "SUBSCRIPTION" };
const aPackage = { identifier: "$rc_monthly", presentedOfferingContext: { offeringIdentifier: "default" } };
const token = "header.deny-intro.signature";

describe("introductory offer eligibility JWS", () => {
  let Purchases;
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBrowserMode = false;
    Platform.OS = "ios";
    NativeModules.RNPurchases.isConfigured.mockResolvedValue(true);
    NativeModules.RNPurchases.purchaseWithIntroductoryOfferEligibilityJWS = jest.fn().mockResolvedValue({ productIdentifier: "product" });
    jest.doMock("react-native", () => ({ NativeModules, Platform, NativeEventEmitter: mockReactNative.NativeEventEmitter }));
    jest.resetModules();
    Purchases = require("../dist/index").default;
  });

  afterEach(() => { Platform.OS = originalOS; });

  const paths = [
    ["product", jws => Purchases.purchaseStoreProduct(product, null, null, jws), { productIdentifier: "product" }],
    ["package", jws => Purchases.purchasePackage(aPackage, null, null, null, jws), {
      packageIdentifier: "$rc_monthly", presentedOfferingContext: aPackage.presentedOfferingContext,
    }],
  ];

  test.each(paths)("forwards the exact token for a %s", async (_name, purchase, options) => {
    await expect(purchase(token)).resolves.toEqual({ productIdentifier: "product" });
    expect(NativeModules.RNPurchases.purchaseWithIntroductoryOfferEligibilityJWS).toHaveBeenCalledWith({
      ...options, introductoryOfferEligibilityJWS: token,
    });
    expect(NativeModules.RNPurchases.purchaseProduct).not.toHaveBeenCalled();
    expect(NativeModules.RNPurchases.purchasePackage).not.toHaveBeenCalled();
  });

  test.each(paths)("preserves the existing %s bridge for null and omitted tokens", async (name, purchase) => {
    await purchase(null);
    await purchase(undefined);
    expect(NativeModules.RNPurchases[name === "product" ? "purchaseProduct" : "purchasePackage"]).toHaveBeenCalledTimes(2);
    expect(NativeModules.RNPurchases.purchaseWithIntroductoryOfferEligibilityJWS).not.toHaveBeenCalled();
  });

  test.each(paths)("rejects malformed tokens before purchasing a %s", async (_name, purchase) => {
    for (const invalid of ["", 123, false, {}]) {
      await expect(purchase(invalid)).rejects.toThrow("non-empty string");
    }
    expect(NativeModules.RNPurchases.purchaseWithIntroductoryOfferEligibilityJWS).not.toHaveBeenCalled();
  });

  test.each(paths)("rejects Android and web without purchasing a %s", async (_name, purchase) => {
    for (const os of ["android", "web"]) {
      Platform.OS = os;
      await expect(purchase(token)).rejects.toThrow();
    }
    expect(NativeModules.RNPurchases.purchaseWithIntroductoryOfferEligibilityJWS).not.toHaveBeenCalled();
    expect(NativeModules.RNPurchases.purchaseProduct).not.toHaveBeenCalled();
    expect(NativeModules.RNPurchases.purchasePackage).not.toHaveBeenCalled();
  });

  test.each(paths)("rejects a missing native capability for a %s", async (_name, purchase) => {
    delete NativeModules.RNPurchases.purchaseWithIntroductoryOfferEligibilityJWS;
    await expect(purchase(token)).rejects.toThrow();
    expect(NativeModules.RNPurchases.purchaseProduct).not.toHaveBeenCalled();
    expect(NativeModules.RNPurchases.purchasePackage).not.toHaveBeenCalled();
  });

  test.each(paths)("preserves native rejection without retrying a %s", async (_name, purchase) => {
    NativeModules.RNPurchases.purchaseWithIntroductoryOfferEligibilityJWS.mockRejectedValueOnce(
      Object.assign(new Error("invalid JWS"), { code: "5" })
    );
    await expect(purchase(token)).rejects.toMatchObject({ code: "5" });
    expect(NativeModules.RNPurchases.purchaseProduct).not.toHaveBeenCalled();
    expect(NativeModules.RNPurchases.purchasePackage).not.toHaveBeenCalled();
  });

  test.each(paths)("rejects iOS browser and preview mode for a %s", async (_name, _purchase, _options) => {
    mockBrowserMode = true;
    jest.doMock("react-native", () => ({ NativeModules, Platform, NativeEventEmitter: mockReactNative.NativeEventEmitter }));
    jest.resetModules();
    const BrowserPurchases = require("../dist/index").default;
    const browser = require("../dist/browser/nativeModule").browserNativeModuleRNPurchases;
    jest.spyOn(browser, "isConfigured").mockReturnValue(true);
    const packagePurchase = jest.spyOn(browser, "purchasePackage");
    const productPurchase = jest.spyOn(browser, "purchaseProduct");
    const request = _name === "product"
      ? BrowserPurchases.purchaseStoreProduct(product, null, null, token)
      : BrowserPurchases.purchasePackage(aPackage, null, null, null, token);
    await expect(request).rejects.toThrow();
    expect(packagePurchase).not.toHaveBeenCalled();
    expect(productPurchase).not.toHaveBeenCalled();
  });
});
