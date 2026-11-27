// The browser implementation (and with it the web SDK, `@revenuecat/purchases-js-hybrid-mappings`)
// must only be required where Browser Mode can be used: on web, and in development (Expo Go / Rork Sandbox).
// Metro inlines `Platform.OS` and `__DEV__` in production bundles and removes the unused `require()`.
// See: https://github.com/RevenueCat/react-native-purchases/issues/1643
describe("browser module loading", () => {
  const originalDev = global.__DEV__;
  let browserModuleFactory;

  function loadPurchases({ dev, os }) {
    jest.resetModules();
    global.__DEV__ = dev;
    require("react-native").Platform.OS = os;
    browserModuleFactory = jest.fn(() => ({ browserNativeModuleRNPurchases: {} }));
    jest.doMock("../dist/browser/nativeModule", browserModuleFactory);
    return require("../dist/index").default;
  }

  afterEach(() => {
    global.__DEV__ = originalDev;
    jest.dontMock("../dist/browser/nativeModule");
  });

  it("is not required in production iOS/Android bundles", () => {
    loadPurchases({ dev: false, os: "ios" });
    expect(browserModuleFactory).not.toHaveBeenCalled();

    loadPurchases({ dev: false, os: "android" });
    expect(browserModuleFactory).not.toHaveBeenCalled();
  });

  it("is required in development, for Expo Go and Rork Sandbox", () => {
    loadPurchases({ dev: true, os: "ios" });
    expect(browserModuleFactory).toHaveBeenCalled();
  });

  it("is required on web", () => {
    loadPurchases({ dev: false, os: "web" });
    expect(browserModuleFactory).toHaveBeenCalled();
  });
});
