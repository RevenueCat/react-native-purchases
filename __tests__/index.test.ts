
describe("Purchases", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mock('NativeEventEmitter');
  });

  it('isUTCDateStringFuture returns true when a date is in the future', () => {
    const { isUTCDateStringFuture } = require("../index");
    const dateAhead = new Date();
    dateAhead.setDate(dateAhead.getDate() + 2);

    expect(isUTCDateStringFuture(dateAhead.toUTCString())).toEqual(true);
  });

  it("addPurchaseListener correctly saves listeners", () => {
    const listener = jest.fn();
    const Purchases = require("../index").default;

    const listenerId = Purchases.addPurchaseListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      productIdentifier: "test.product.bla",
      purchaserInfo: {},
      error: null
    };

    nativeEmitter.emit('Purchases-PurchaseCompleted', eventInfo);

    expect(listenerId).toEqual(expect.any(String));
    expect(listener).toHaveBeenCalledWith(eventInfo.productIdentifier, eventInfo.purchaserInfo, eventInfo.error);
  });

  it("removePurchaseListener correctly removes a listener", () => {
    const Purchases = require("../index").default;
    const listener = jest.fn();
    const listenerId = Purchases.addPurchaseListener(listener);
    Purchases.removePurchaseListener(listenerId);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      productIdentifier: "test.product.bla",
      purchaserInfo: {},
      error: null
    };

    nativeEmitter.emit('Purchases-PurchaseCompleted', eventInfo);

    expect(listener).toHaveBeenCalledTimes(0);
  });
});
