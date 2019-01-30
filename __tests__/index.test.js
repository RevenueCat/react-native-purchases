import { NativeModules } from "react-native";

describe("Purchases", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mock("NativeEventEmitter");
    NativeModules.RNPurchases = { setupPurchases: jest.fn() } 
  });

  const purchaserInfoStub = {
    allExpirationDates: {
      onetime_purchase: null,
      consumable: null,
      annual_freetrial: "2019-01-23T22:34:21Z",
      onemonth_freetrial: "2019-01-19T01:41:06Z"
    },
    activeSubscriptions: ["annual_freetrial"],
    expirationsForActiveEntitlements: { pro: null },
    activeEntitlements: ["pro"],
    allPurchasedProductIdentifiers: [
      "onetime_purchase",
      "consumable",
      "annual_freetrial",
      "onemonth_freetrial"
    ],
    latestExpirationDate: "2019-01-23T22:34:21Z"
  };

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

  it("calling setup with something other than string throws exception", () => {
      const Purchases = require("../index").default;

      expect(() => {
        Purchases.setup("api_key", 123)
      }).toThrowError();

      expect(() => {
        Purchases.setup("api_key")
      }).toThrowError();

      expect(() => {
        Purchases.setup("api_key", null)
      }).toThrowError();

      expect(() => {
        Purchases.setup("api_key", "123a")
      }).not.toThrowError();
  })
});
