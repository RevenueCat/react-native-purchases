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


      expect(RNPurchasesMock.setupPurchases).toBeCalledTimes(2);
  })

  it("allowing sharing store account works", () => {
    const Purchases = require("../index").default;

    Purchases.setAllowSharingStoreAccount(true)

    expect(RNPurchasesMock.setAllowSharingStoreAccount).toBeCalledWith(true);
    expect(RNPurchasesMock.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("disallowing sharing store account works", () => {
    const Purchases = require("../index").default;

    Purchases.setAllowSharingStoreAccount(false)

    expect(RNPurchasesMock.setAllowSharingStoreAccount).toBeCalledWith(false);
    expect(RNPurchasesMock.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("adding attribution data works", () => {
    const Purchases = require("../index").default;

    Purchases.addAttributionData({}, Purchases.ATTRIBUTION_NETWORKS.APPSFLYER)

    expect(RNPurchasesMock.addAttributionData).toBeCalledWith({}, Purchases.ATTRIBUTION_NETWORKS.APPSFLYER);
    expect(RNPurchasesMock.addAttributionData).toBeCalledTimes(1);
  })

  it("get entitlements works", () => {
    // TODO: make getEntitlements return entitlements
    const Purchases = require("../index").default;

    Purchases.getEntitlements()

    expect(RNPurchasesMock.getEntitlements).toBeCalledTimes(1);
  })

  it("getProducts works", () => {
    // TODO: make getProductInfo return products
    const Purchases = require("../index").default;

    Purchases.getProducts("hola")
    
    expect(RNPurchasesMock.getProductInfo).toBeCalledWith("hola", "subs");
    expect(RNPurchasesMock.getProductInfo).toBeCalledTimes(1);

    Purchases.getProducts("hola", "nosubs")
    
    expect(RNPurchasesMock.getProductInfo).toBeCalledWith("hola", "nosubs");
    expect(RNPurchasesMock.getProductInfo).toBeCalledTimes(2);
  })

  it("makePurchase works", () => {
    // TODO: make getProductInfo return products
    const Purchases = require("../index").default;

    Purchases.makePurchase("hola")
    
    expect(RNPurchasesMock.makePurchase).toBeCalledWith("hola", [], "subs");
    expect(RNPurchasesMock.makePurchase).toBeCalledTimes(1);

    Purchases.makePurchase("hola", ["viejo"], "nosubs")
    
    expect(RNPurchasesMock.makePurchase).toBeCalledWith("hola", ["viejo"], "nosubs");
    expect(RNPurchasesMock.makePurchase).toBeCalledTimes(2);
  })

  it("restoreTransactions works", () => {
    const Purchases = require("../index").default;

    Purchases.restoreTransactions()
    
    expect(RNPurchasesMock.restoreTransactions).toBeCalledTimes(1);
  })

  it("getAppUserID works", () => {
    const Purchases = require("../index").default;

    Purchases.getAppUserID()
    
    expect(RNPurchasesMock.getAppUserID).toBeCalledTimes(1);
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

    expect(RNPurchasesMock.createAlias).toBeCalledTimes(1);
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

    expect(RNPurchasesMock.identify).toBeCalledTimes(1);
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

    expect(RNPurchasesMock.identify).toBeCalledTimes(1);
  })

  it("setDebugLogsEnabled works", () => {
    const Purchases = require("../index").default;

    Purchases.setDebugLogsEnabled(true)

    expect(RNPurchasesMock.setDebugLogsEnabled).toBeCalledWith(true);
    expect(RNPurchasesMock.setDebugLogsEnabled).toBeCalledTimes(1);

    Purchases.setDebugLogsEnabled(false)

    expect(RNPurchasesMock.setDebugLogsEnabled).toBeCalledWith(false);
    expect(RNPurchasesMock.setDebugLogsEnabled).toBeCalledTimes(2);
  })

  it("getPurchaserInfo works", () => {
    const Purchases = require("../index").default;
    expect(Purchases.getPurchaserInfo()).resolves.toBe(purchaserInfoStub);
  })

});
