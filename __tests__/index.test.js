const { NativeModules } = require("react-native");

describe("Purchases", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mock("NativeEventEmitter");
  });

  it("isUTCDateStringFuture returns true when a date is in the future", () => {
    const { isUTCDateStringFuture } = require("../index");
    const dateAhead = new Date();
    dateAhead.setDate(dateAhead.getDate() + 2);

    expect(isUTCDateStringFuture(dateAhead.toUTCString())).toEqual(true);
  });

  it("addPurchaserInfoUpdateListener correctly saves listeners", () => {
    const listener = jest.fn();
    const Purchases = require("../index").default;

    Purchases.addPurchaserInfoUpdateListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    nativeEmitter.emit("Purchases-PurchaserInfoUpdated", purchaserInfoStub);

    expect(listener).toEqual(expect.any(Function));
    expect(listener).toHaveBeenCalledWith(purchaserInfoStub);
  });

  it("removePurchaserInfoUpdateListener correctly removes a listener", () => {
    const Purchases = require("../index").default;
    const listener = jest.fn();
    Purchases.addPurchaserInfoUpdateListener(listener);
    Purchases.removePurchaserInfoUpdateListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      purchaserInfo: purchaserInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-PurchaserInfoUpdated", eventInfo);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("calling setup with something other than string throws exception", () => {
      const Purchases = require("../index").default;

      expect(() => {
        Purchases.setup("api_key", 123)
      }).toThrowError();

      expect(() => {
        Purchases.setup("api_key")
      }).not.toThrowError();

      expect(() => {
        Purchases.setup("api_key", null)
      }).toThrowError();

      expect(() => {
        Purchases.setup("api_key", "123a")
      }).not.toThrowError();


      expect(NativeModules.RNPurchases.setupPurchases).toBeCalledTimes(2);
  })

  it("allowing sharing store account works", () => {
    const Purchases = require("../index").default;

    Purchases.setAllowSharingStoreAccount(true)

    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledWith(true);
    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("disallowing sharing store account works", () => {
    const Purchases = require("../index").default;

    Purchases.setAllowSharingStoreAccount(false)

    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledWith(false);
    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("adding attribution data works", () => {
    const Purchases = require("../index").default;

    Purchases.addAttributionData({}, Purchases.ATTRIBUTION_NETWORKS.APPSFLYER)

    expect(NativeModules.RNPurchases.addAttributionData).toBeCalledWith({}, Purchases.ATTRIBUTION_NETWORKS.APPSFLYER);
    expect(NativeModules.RNPurchases.addAttributionData).toBeCalledTimes(1);
  })

  it("get entitlements works", () => {
    const Purchases = require("../index").default;

    expect(Purchases.getPurchaserInfo()).resolves.toBe(entitlementsStub);
  })

  it("getProducts works", async () => {
    const Purchases = require("../index").default;
    NativeModules.RNPurchases.getProductInfo = jest.fn();
    
    let productsStub = [
      {
        currency_code: "USD",
        intro_price_period: "",
        intro_price_string: "",
        price_string: "$0.99",
        intro_price_cycles: "",
        price: 0.99,
        intro_price: "",
        description: "The best service.",
        title: "One Month Free Trial",
        identifier: "onemonth_freetrial"
      }
    ];
    
    NativeModules.RNPurchases.getProductInfo.mockResolvedValueOnce(productsStub);

    let products = await Purchases.getProducts("onemonth_freetrial");

    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledWith("onemonth_freetrial", "subs");
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledTimes(1);
    expect(products).toEqual(productsStub);

    productsStub = [];
    
    NativeModules.RNPurchases.getProductInfo.mockResolvedValueOnce(productsStub);
    
    products = await Purchases.getProducts("onemonth_freetrial", "nosubs")
    
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledWith("onemonth_freetrial", "nosubs");
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledTimes(2);
    expect(products).toEqual(productsStub);
  })

  it("makePurchase works", () => {
    const Purchases = require("../index").default;

    Purchases.makePurchase("onemonth_freetrial")
    
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledWith("onemonth_freetrial", [], "subs");
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledTimes(1);

    Purchases.makePurchase("onemonth_freetrial", ["viejo"], "nosubs")
    
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledWith("onemonth_freetrial", ["viejo"], "nosubs");
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledTimes(2);
  })

  it("restoreTransactions works", () => {
    const Purchases = require("../index").default;

    Purchases.restoreTransactions()
    
    expect(NativeModules.RNPurchases.restoreTransactions).toBeCalledTimes(1);
  })

  it("getAppUserID works", () => {
    const Purchases = require("../index").default;

    Purchases.getAppUserID()
    
    expect(NativeModules.RNPurchases.getAppUserID).toBeCalledTimes(1);
  })

  it("createAlias throws errors if new app user id is not a string", () => {
    const Purchases = require("../index").default;

    expect(() => {
      Purchases.createAlias(123)
    }).toThrowError();

    expect(() => {
      Purchases.createAlias()
    }).toThrowError();

    expect(() => {
      Purchases.createAlias(null)
    }).toThrowError();

    expect(() => {
      Purchases.createAlias("123a")
    }).not.toThrowError();

    expect(NativeModules.RNPurchases.createAlias).toBeCalledTimes(1);
  })

  it("identify throws errors if new app user id is not a string", () => {
    const Purchases = require("../index").default;

    expect(() => {
      Purchases.identify(123)
    }).toThrowError();

    expect(() => {
      Purchases.identify()
    }).toThrowError();

    expect(() => {
      Purchases.identify(null)
    }).toThrowError();

    expect(() => {
      Purchases.identify("123a")
    }).not.toThrowError();

    expect(NativeModules.RNPurchases.identify).toBeCalledTimes(1);
  })

  it("identify throws errors if new app user id is not a string", () => {
    const Purchases = require("../index").default;

    expect(() => {
      Purchases.identify(123)
    }).toThrowError();

    expect(() => {
      Purchases.identify()
    }).toThrowError();

    expect(() => {
      Purchases.identify(null)
    }).toThrowError();

    expect(() => {
      Purchases.identify("123a")
    }).not.toThrowError();

    expect(NativeModules.RNPurchases.identify).toBeCalledTimes(1);
  })

  it("setDebugLogsEnabled works", () => {
    const Purchases = require("../index").default;

    Purchases.setDebugLogsEnabled(true)

    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledWith(true);
    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledTimes(1);

    Purchases.setDebugLogsEnabled(false)

    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledWith(false);
    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledTimes(2);
  })

  it("getPurchaserInfo works", () => {
    const Purchases = require("../index").default;
    expect(Purchases.getPurchaserInfo()).resolves.toBe(purchaserInfoStub);
  })

});
