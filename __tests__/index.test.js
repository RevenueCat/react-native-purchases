describe("Purchases", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mock("NativeEventEmitter");
  });

  const purchaserInfoStub = {"allExpirationDates":{"onetime_purchase":null,"consumable":null,"annual_freetrial":"2019-01-23T22:34:21Z","onemonth_freetrial":"2019-01-19T01:41:06Z"},"activeSubscriptions":["annual_freetrial"],"expirationsForActiveEntitlements":{"pro":null},"activeEntitlements":["pro"],"allPurchasedProductIdentifiers":["onetime_purchase","consumable","annual_freetrial","onemonth_freetrial"],"latestExpirationDate":"2019-01-23T22:34:21Z"};

  it("isUTCDateStringFuture returns true when a date is in the future", () => {
    const { isUTCDateStringFuture } = require("../index");
    const dateAhead = new Date();
    dateAhead.setDate(dateAhead.getDate() + 2);

    expect(isUTCDateStringFuture(dateAhead.toUTCString())).toEqual(true);
  });

  it("addPurchaseListener correctly saves listeners", () => {
    const listener = jest.fn();
    const Purchases = require("../index").default;

    Purchases.addPurchaseListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      productIdentifier: "test.product.bla",
      purchaserInfo: purchaserInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-PurchaseCompleted", eventInfo);

    expect(listener).toEqual(expect.any(Function));
    expect(listener).toHaveBeenCalledWith(
      eventInfo.productIdentifier,
      eventInfo.purchaserInfo,
      eventInfo.error
    );
  });

  it("removePurchaseListener correctly removes a listener", () => {
    const Purchases = require("../index").default;
    const listener = jest.fn();
    Purchases.addPurchaseListener(listener);
    Purchases.removePurchaseListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      productIdentifier: "test.product.bla",
      purchaserInfo: purchaserInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-PurchaseCompleted", eventInfo);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("addRestoreTransactionsListener correctly saves listeners", () => {
    const listener = jest.fn();
    const Purchases = require("../index").default;

    Purchases.addRestoreTransactionsListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      purchaserInfo: purchaserInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-RestoredTransactions", eventInfo);

    expect(listener).toEqual(expect.any(Function));
    expect(listener).toHaveBeenCalledWith(
      eventInfo.purchaserInfo,
      eventInfo.error
    );
  });

  it("removeRestoreTransactionsListener correctly removes a listener", () => {
    const Purchases = require("../index").default;
    const listener = jest.fn();
    Purchases.addRestoreTransactionsListener(listener);
    Purchases.removeRestoreTransactionsListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      purchaserInfo: purchaserInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-RestoredTransactions", eventInfo);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("addPurchaserInfoUpdateListener correctly saves listeners", () => {
    const listener = jest.fn();
    const Purchases = require("../index").default;

    Purchases.addPurchaserInfoUpdateListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      purchaserInfo: purchaserInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-PurchaserInfoUpdated", eventInfo);

    expect(listener).toEqual(expect.any(Function));
    expect(listener).toHaveBeenCalledWith(
      eventInfo.purchaserInfo,
      eventInfo.error
    );
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
});
