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

    Purchases.addAttributionData({}, Purchases.ATTRIBUTION_NETWORKS.APPSFLYER, "cesar")

    expect(NativeModules.RNPurchases.addAttributionData).toBeCalledWith({}, Purchases.ATTRIBUTION_NETWORKS.APPSFLYER, "cesar");
    expect(NativeModules.RNPurchases.addAttributionData).toBeCalledTimes(1);
  })

  it("get entitlements works", async () => {
    const Purchases = require("../index").default;
    
    NativeModules.RNPurchases.getEntitlements.mockResolvedValueOnce(entitlementsStub);
    
    const entitlements = await Purchases.getEntitlements();

    expect(NativeModules.RNPurchases.getEntitlements).toBeCalledTimes(1);
    expect(entitlements).toEqual(entitlementsStub);
  })

  it("getProducts works and gets subs by default", async () => {
    const Purchases = require("../index").default;
    
    NativeModules.RNPurchases.getProductInfo.mockResolvedValueOnce(productsStub);

    let products = await Purchases.getProducts("onemonth_freetrial");

    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledWith("onemonth_freetrial", "subs");
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledTimes(1);
    expect(products).toEqual(productsStub);

    NativeModules.RNPurchases.getProductInfo.mockResolvedValueOnce([]);
    
    products = await Purchases.getProducts("onemonth_freetrial", "nosubs")
    
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledWith("onemonth_freetrial", "nosubs");
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledTimes(2);
    expect(products).toEqual([]);
  })

  it("makePurchase works", () => {
    const Purchases = require("../index").default;

    NativeModules.RNPurchases.makePurchase.mockResolvedValue({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    Purchases.makePurchase("onemonth_freetrial")
    
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledWith("onemonth_freetrial", undefined, "subs");
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledTimes(1);

    Purchases.makePurchase("onemonth_freetrial", "viejo", "nosubs")
    
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledWith("onemonth_freetrial", "viejo", "nosubs");
    expect(NativeModules.RNPurchases.makePurchase).toBeCalledTimes(2);
  })

  it("restoreTransactions works", async () => {
    const Purchases = require("../index").default;

    NativeModules.RNPurchases.restoreTransactions.mockResolvedValueOnce(purchaserInfoStub);

    const purchaserInfo = await Purchases.restoreTransactions();
    
    expect(NativeModules.RNPurchases.restoreTransactions).toBeCalledTimes(1);
    expect(purchaserInfo).toEqual(purchaserInfoStub);
  })

  it("getAppUserID works", async () => {
    const Purchases = require("../index").default;

    NativeModules.RNPurchases.getAppUserID.mockResolvedValueOnce("123");

    const appUserID = await Purchases.getAppUserID()
    
    expect(NativeModules.RNPurchases.getAppUserID).toBeCalledTimes(1);
    expect(appUserID).toEqual("123");
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

    expect(async () => {
      NativeModules.RNPurchases.createAlias.mockResolvedValueOnce(purchaserInfoStub);
      const info = await Purchases.createAlias("123a")
      expect(info).toBeEqual(purchaserInfoStub);
    }).not.toThrowError();

    expect(NativeModules.RNPurchases.createAlias).toBeCalledTimes(1);
    expect(NativeModules.RNPurchases.createAlias).toBeCalledWith("123a");
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

    expect(async () => {
      NativeModules.RNPurchases.identify.mockResolvedValueOnce(purchaserInfoStub);
      const info = await Purchases.identify("123a")
      expect(info).toBeEqual(purchaserInfoStub);
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

  it("getPurchaserInfo works", async () => {
    const Purchases = require("../index").default;

    NativeModules.RNPurchases.getPurchaserInfo.mockResolvedValueOnce(purchaserInfoStub);
    
    const purchaserInfo = await Purchases.getPurchaserInfo();
    
    expect(NativeModules.RNPurchases.getPurchaserInfo).toBeCalledTimes(1);
    expect(purchaserInfo).toEqual(purchaserInfoStub);
  })

  it("setup works", async () => {
    const Purchases = require("../index").default;

    Purchases.setup("key", "user");
    
    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", false);

    Purchases.setup("key", "user", true);

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", true);

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledTimes(2);
  })

  it("cancelled purchase sets userCancelled in the error", () => {
    const Purchases = require("../index").default;

    NativeModules.RNPurchases.makePurchase.mockRejectedValueOnce({
      code: "1"
    });

    return expect(Purchases.makePurchase("onemonth_freetrial")).rejects.toEqual({
      code: "1",
      userCancelled: true
    });
  })

  it("successful purchase works", () => {
    const Purchases = require("../index").default;

    NativeModules.RNPurchases.makePurchase.mockResolvedValueOnce({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    return expect(Purchases.makePurchase("onemonth_freetrial")).resolves.toEqual({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });
  })

  it("reset works", () => {
    const Purchases = require("../index").default;

    NativeModules.RNPurchases.reset.mockResolvedValueOnce(purchaserInfoStub);
    
    return expect(Purchases.reset()).resolves.toEqual(purchaserInfoStub);
  })

  it("syncpurchases works for android", () => {
    const Purchases = require("../index").default;
    
    mockPlatform("android");

    Purchases.syncPurchases();

    expect(NativeModules.RNPurchases.syncPurchases).toBeCalledTimes(1);
  })

  it("syncpurchases doesnt do anything for ios", () => {
    const Purchases = require("../index").default;
    
    mockPlatform("ios");

    Purchases.syncPurchases();

    expect(NativeModules.RNPurchases.syncPurchases).toBeCalledTimes(0);
  })


  it("finishTransactions works", () => {
    const Purchases = require("../index").default;

    Purchases.setFinishTransactions(true);
    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledWith(true);

    Purchases.setFinishTransactions(false);
    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledWith(false);

    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledTimes(2);
  })

  const mockPlatform = OS => {    
    jest.resetModules();  
    jest.doMock("Platform", () => ({ OS, select: objs => objs[OS] }));
  };

});
