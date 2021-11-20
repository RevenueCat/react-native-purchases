const {NativeModules, NativeEventEmitter, Platform} = require("react-native");

const nativeEmitter = new NativeEventEmitter();

describe("Purchases", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    NativeModules.RNPurchases.isConfigured.mockResolvedValue(true);
  });

  it("addPurchaserInfoUpdateListener correctly saves listeners", () => {
    const listener = jest.fn();
    const Purchases = require("../dist/index").default;

    Purchases.addPurchaserInfoUpdateListener(listener);

    nativeEmitter.emit("Purchases-PurchaserInfoUpdated", purchaserInfoStub);

    expect(listener).toHaveBeenCalledWith(purchaserInfoStub);
  });

  it("removePurchaserInfoUpdateListener correctly removes a listener", () => {
    const Purchases = require("../dist/index").default;
    const listener = jest.fn();
    Purchases.addPurchaserInfoUpdateListener(listener);
    Purchases.removePurchaserInfoUpdateListener(listener);

    const eventInfo = {
      purchaserInfo: purchaserInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-PurchaserInfoUpdated", eventInfo);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("addShouldPurchasePromoProductListener correctly saves listeners", () => {
    const listener = jest.fn();
    const Purchases = require("../dist/index").default;

    Purchases.addShouldPurchasePromoProductListener(listener);

    const nativeEmitter = new NativeEventEmitter();
    const eventInfo = {
      callbackID: 1,
    };
    nativeEmitter.emit("Purchases-ShouldPurchasePromoProduct", eventInfo);

    expect(listener).toHaveBeenCalledWith(expect.any(Function));
  });

  it("shouldPurchasePromoProductListener calls deferred purchase", async () => {
    const listener = deferredPurchase => {
      this.deferredPurchase = deferredPurchase;
    };

    const Purchases = require("../dist/index").default;

    Purchases.addShouldPurchasePromoProductListener(listener);

    const nativeEmitter = new NativeEventEmitter();
    const eventInfo = {
      callbackID: 1,
    };
    nativeEmitter.emit("Purchases-ShouldPurchasePromoProduct", eventInfo);

    NativeModules.RNPurchases.makeDeferredPurchase.mockResolvedValue({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    let {purchaserInfo, purchasedProductIdentifier} = await this.deferredPurchase();

    expect(NativeModules.RNPurchases.makeDeferredPurchase).toBeCalledWith(1);
    expect(purchaserInfo).toEqual(purchaserInfoStub);
    expect(purchasedProductIdentifier).toEqual("123");
  });

  it("removeShouldPurchasePromoProductListener correctly removes a listener", () => {
    const Purchases = require("../dist/index").default;
    const listener = jest.fn();
    Purchases.addShouldPurchasePromoProductListener(listener);
    Purchases.removeShouldPurchasePromoProductListener(listener);

    const nativeEmitter = new NativeEventEmitter();

    const eventInfo = {
      callbackID: 1,
    };

    nativeEmitter.emit("Purchases-ShouldPurchasePromoProduct", eventInfo);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("calling setup with something other than string throws exception", () => {
    const Purchases = require("../dist/index").default;

    expect(() => {
      Purchases.setup("api_key", 123)
    }).toThrowError();

    expect(() => {
      Purchases.setup("api_key")
    }).not.toThrowError();

    expect(() => {
      Purchases.setup("api_key", "123a")
    }).not.toThrowError();


    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledTimes(2);
  })

  it("allowing sharing store account works", async () => {
    const Purchases = require("../dist/index").default;

    await Purchases.setAllowSharingStoreAccount(true)

    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledWith(true);
    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("disallowing sharing store account works", async () => {
    const Purchases = require("../dist/index").default;

    await Purchases.setAllowSharingStoreAccount(false)

    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledWith(false);
    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("adding attribution data works", () => {
    const Purchases = require("../dist/index").default;

    Purchases.addAttributionData({}, Purchases.ATTRIBUTION_NETWORK.APPSFLYER, "cesar")

    expect(NativeModules.RNPurchases.addAttributionData).toBeCalledWith({}, Purchases.ATTRIBUTION_NETWORKS.APPSFLYER, "cesar");
    expect(NativeModules.RNPurchases.addAttributionData).toBeCalledTimes(1);
  })

  it("get offerings works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.getOfferings.mockResolvedValueOnce(offeringsStub);

    const offerings = await Purchases.getOfferings();

    expect(NativeModules.RNPurchases.getOfferings).toBeCalledTimes(1);
    expect(offerings).toEqual(offeringsStub);
  })

  it("getProducts works and gets subs by default", async () => {
    const Purchases = require("../dist/index").default;

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
  });


  it("purchaseProduct works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.purchaseProduct.mockResolvedValue({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    await Purchases.purchaseProduct("onemonth_freetrial")

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith("onemonth_freetrial", undefined, "subs", null);
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(1);

    await Purchases.purchaseProduct("onemonth_freetrial", {
      oldSKU: "viejo"
    }, Purchases.PURCHASE_TYPE.INAPP)

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith("onemonth_freetrial", { oldSKU: "viejo" }, Purchases.PURCHASE_TYPE.INAPP, null);
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(2);

    await Purchases.purchaseProduct("onemonth_freetrial", {
      oldSKU: "viejo",
      prorationMode: Purchases.PRORATION_MODE.DEFERRED
    }, Purchases.PURCHASE_TYPE.INAPP)

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith("onemonth_freetrial", { oldSKU: "viejo", prorationMode: Purchases.PRORATION_MODE.DEFERRED}, Purchases.PURCHASE_TYPE.INAPP, null);
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(3);
  });

  it("purchasePackage works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.purchasePackage.mockResolvedValue({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    await Purchases.purchasePackage(
      {
        identifier: "$rc_onemonth",
        packageType: Purchases.PACKAGE_TYPE.MONTHLY,
        product: {
          identifier: "onemonth_freetrial",
          description: "description",
          title: "title",
          price: 4.5,
          price_string: "$4.5",
          currency_code: "USD",
          intro_price: null,
          intro_price_string: null,
          intro_price_period: null,
          intro_price_cycles: null,
          intro_price_period_unit: null,
          intro_price_period_number_of_units: null,
        },
        offeringIdentifier: "offering",
      });

    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith("$rc_onemonth", "offering", undefined, null);
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledTimes(1);

    await Purchases.purchasePackage(
      {
        identifier: "$rc_onemonth",
        packageType: Purchases.PACKAGE_TYPE.MONTHLY,
        product: {
          identifier: "onemonth_freetrial",
          description: "description",
          title: "title",
          price: 4.5,
          price_string: "$4.5",
          currency_code: "USD",
          intro_price: null,
          intro_price_string: null,
          intro_price_period: null,
          intro_price_cycles: null,
          intro_price_period_unit: null,
          intro_price_period_number_of_units: null,
        },
        offeringIdentifier: "offering",
      },
      {
        oldSKU: "viejo",
        prorationMode: Purchases.PRORATION_MODE.DEFERRED
      },
    );

    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith("$rc_onemonth", "offering", {
      oldSKU: "viejo",
      prorationMode: Purchases.PRORATION_MODE.DEFERRED
    }, null);
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledTimes(2);
  });

  it("restoreTransactions works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.restoreTransactions.mockResolvedValueOnce(purchaserInfoStub);

    const purchaserInfo = await Purchases.restoreTransactions();

    expect(NativeModules.RNPurchases.restoreTransactions).toBeCalledTimes(1);
    expect(purchaserInfo).toEqual(purchaserInfoStub);
  })

  it("getAppUserID works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.getAppUserID.mockResolvedValueOnce("123");

    const appUserID = await Purchases.getAppUserID()

    expect(NativeModules.RNPurchases.getAppUserID).toBeCalledTimes(1);
    expect(appUserID).toEqual("123");
  })

  it("createAlias throws errors if new app user id is not a string", async () => {
    const Purchases = require("../dist/index").default;

    expect(async () => {
      await Purchases.createAlias(123)
    }).rejects.toThrowError();

    expect(async () => {
      await Purchases.createAlias()
    }).rejects.toThrowError();

    expect(async () => {
      await Purchases.createAlias(null)
    }).rejects.toThrowError();

    NativeModules.RNPurchases.createAlias.mockResolvedValueOnce(purchaserInfoStub);
    const info = await Purchases.createAlias("123a")
    expect(info).toEqual(purchaserInfoStub);

    expect(NativeModules.RNPurchases.createAlias).toBeCalledTimes(1);
    expect(NativeModules.RNPurchases.createAlias).toBeCalledWith("123a");
  })

  it("identify throws errors if new app user id is not a string", async () => {
    const Purchases = require("../dist/index").default;

    expect(async () => {
      await Purchases.identify(123)
    }).rejects.toThrowError();

    expect(async () => {
      await Purchases.identify()
    }).rejects.toThrowError();

    expect(async () => {
      await Purchases.identify(null)
    }).rejects.toThrowError();

    NativeModules.RNPurchases.identify.mockResolvedValueOnce(purchaserInfoStub);
    const info = await Purchases.identify("123a")
    expect(info).toEqual(purchaserInfoStub);

    expect(NativeModules.RNPurchases.identify).toBeCalledTimes(1);
  })

  describe("when calling logIn", () => { 
    const Purchases = require("../dist/index").default;

    it("throws an error if the appUserID is not a string", () => { 
      expect(async () => {
        await Purchases.logIn(123)
      }).rejects.toThrowError();

      expect(async () => {
        await Purchases.logIn()
      }).rejects.toThrowError();

      expect(async () => {
        await Purchases.logIn(null)
      }).rejects.toThrowError();
    });

    it ("returns the correct LogInResult if successful", async () => { 
      const mockCreated = (Math.random() < 0.5);

      NativeModules.RNPurchases.logIn.mockResolvedValueOnce({
        created: mockCreated,
        purchaserInfo: purchaserInfoStub
      });
      
      const logInResult = await Purchases.logIn("myUser");

      expect(logInResult.created).toBe(mockCreated);
      expect(logInResult.purchaserInfo).toBe(purchaserInfoStub);
      expect(NativeModules.RNPurchases.logIn).toBeCalledTimes(1);
    });
  });

  describe("when calling logOut", () => { 
    const Purchases = require("../dist/index").default;
    it("correctly passes the call to the native module and returns the value", async () => {
      NativeModules.RNPurchases.logOut.mockResolvedValueOnce(purchaserInfoStub);

      const purchaserInfo = await Purchases.logOut();

      expect(purchaserInfo).toBe(purchaserInfoStub);
      expect(NativeModules.RNPurchases.logOut).toBeCalledTimes(1);
    });
  });

  it("setDebugLogsEnabled works", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setDebugLogsEnabled(true)

    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledWith(true);
    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledTimes(1);

    Purchases.setDebugLogsEnabled(false)

    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledWith(false);
    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledTimes(2);
  })

  it("getPurchaserInfo works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.getPurchaserInfo.mockResolvedValueOnce(purchaserInfoStub);

    const purchaserInfo = await Purchases.getPurchaserInfo();

    expect(NativeModules.RNPurchases.getPurchaserInfo).toBeCalledTimes(1);
    expect(purchaserInfo).toEqual(purchaserInfoStub);
  })

  it("setup works", async () => {
    const Purchases = require("../dist/index").default;

    Purchases.setup("key", "user");

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", false, undefined);

    Purchases.setup("key", "user", true);

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", true, undefined);

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledTimes(2);
  })

  it("cancelled purchaseProduct sets userCancelled in the error", () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.purchaseProduct.mockRejectedValueOnce({
      code: "1",
      message: "User cancelled",
      readableErrorCode: "USER_CANCELLED",
      underlyingErrorMessage: "The user cancelled",
    });

    return expect(Purchases.purchaseProduct("onemonth_freetrial")).rejects.toEqual({
      code: Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
      message: "User cancelled",
      readableErrorCode: "USER_CANCELLED",
      underlyingErrorMessage: "The user cancelled",
      userCancelled: true
    });
  });

  it("cancelled purchasePackage sets userCancelled in the error", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.purchasePackage.mockRejectedValueOnce({
      code: "1",
      message: "User cancelled",
      readableErrorCode: "USER_CANCELLED",
      underlyingErrorMessage: "The user cancelled",
    });

    return expect(async () => { 
      await Purchases.purchasePackage("onemonth_freetrial") 
    }).rejects.toEqual({
      code: Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
      message: "User cancelled",
      readableErrorCode: "USER_CANCELLED",
      underlyingErrorMessage: "The user cancelled",
      userCancelled: true
    });
  });

  it("successful purchase works", () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.purchaseProduct.mockResolvedValueOnce({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    return expect(Purchases.purchaseProduct("onemonth_freetrial")).resolves.toEqual({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });
  })

  it("reset works", () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.reset.mockResolvedValueOnce(purchaserInfoStub);

    return expect(Purchases.reset()).resolves.toEqual(purchaserInfoStub);
  })

  it("syncpurchases works for android", async () => {
    const Purchases = require("../dist/index").default;

    Platform.OS = "android";

    await Purchases.syncPurchases();

    expect(NativeModules.RNPurchases.syncPurchases).toBeCalledTimes(1);
  })

  it("syncpurchases works for ios", async () => {
    const Purchases = require("../dist/index").default;

    Platform.OS = "ios";

    await Purchases.syncPurchases();

    expect(NativeModules.RNPurchases.syncPurchases).toBeCalledTimes(1);
  })


  it("finishTransactions works", async () => {
    const Purchases = require("../dist/index").default;

    await Purchases.setFinishTransactions(true);
    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledWith(true);

    await Purchases.setFinishTransactions(false);
    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledWith(false);

    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledTimes(2);
  })

  it("checkTrialOrIntroductoryPriceEligibility works", async () => {
    const Purchases = require("../dist/index").default;

    await Purchases.checkTrialOrIntroductoryPriceEligibility(["monthly"])

    expect(NativeModules.RNPurchases.checkTrialOrIntroductoryPriceEligibility).toBeCalledWith(["monthly"]);
  })

  it("getPaymentDiscount works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.getPaymentDiscount.mockResolvedValue(paymentDiscountStub);

    const aProduct = {
      ...productStub,
      discounts: [discountStub]
    }

    await Purchases.getPaymentDiscount(aProduct, discountStub)

    expect(NativeModules.RNPurchases.getPaymentDiscount).toBeCalledWith(aProduct.identifier, discountStub.identifier);
    expect(NativeModules.RNPurchases.getPaymentDiscount).toBeCalledTimes(1);
  });

  it("getPaymentDiscount returns undefined for Android", async () => {
    const Purchases = require("../dist/index").default;

    Platform.OS = "android";

    let paymentDiscount = await Purchases.getPaymentDiscount(productStub, discountStub);

    expect(paymentDiscount).toEqual(undefined)
    expect(NativeModules.RNPurchases.getPaymentDiscount).toBeCalledTimes(0);
  });

  it("getPaymentDiscount throws error when null discount", () => {
    const Purchases = require("../dist/index").default;
    Platform.OS = "ios";

    expect(async () => {
      await Purchases.getPaymentDiscount(productStub, null)
    }).rejects.toThrowError();

    expect(async () => {
      Purchases.getPaymentDiscount(productStub)
    }).rejects.toThrowError();

    expect(NativeModules.RNPurchases.getPaymentDiscount).toBeCalledTimes(0);
  });

  it("purchaseDiscountedProduct works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.purchaseProduct.mockResolvedValue({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    const aProduct = {
      ...productStub,
      discounts: [discountStub]
    }

    await Purchases.purchaseDiscountedProduct(aProduct, paymentDiscountStub)

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith(aProduct.identifier, null, null, paymentDiscountStub.timestamp.toString());
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(1);
  });

  it("purchaseDiscountedProduct throws if null or undefined discount", () => {
    const Purchases = require("../dist/index").default;

    expect(async () => {
      Purchases.purchaseDiscountedProduct(productStub, null)
    }).rejects.toThrow();

    expect(async () => {
      Purchases.purchaseDiscountedProduct(productStub)
    }).rejects.toThrow();

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(0);
  });

  it("purchaseDiscountedPackage works", async () => {
    const Purchases = require("../dist/index").default;

    NativeModules.RNPurchases.purchasePackage.mockResolvedValue({
      purchasedProductIdentifier: "123",
      purchaserInfo: purchaserInfoStub
    });

    const aProduct = {
      ...productStub,
      discounts: [discountStub]
    }

    const aPackage = {
      ...packagestub,
      product: aProduct
    }

    await Purchases.purchaseDiscountedPackage(aPackage, paymentDiscountStub)

    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith(
      aPackage.identifier,
      aPackage.offeringIdentifier,
      null,
      paymentDiscountStub.timestamp.toString()
    );
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledTimes(1);

  });

  it("purchaseDiscountedPackage throws if null or undefined discount", () => {
    const Purchases = require("../dist/index").default;

    expect(async () => {
      await Purchases.purchaseDiscountedPackage(packagestub, null)
    }).rejects.toThrow();

    expect(async () => {
      await Purchases.purchaseDiscountedPackage(packagestub)
    }).rejects.toThrow();

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(0);
  });

  it("calling setup with a userDefaultsSuiteName", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setup("key", "user", false, "suitename");

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", false, "suitename");
  })

  describe("invalidate purchaser info cache", () => {
    describe("when invalidatePurchaserInfoCache is called", () => {
      it("makes the right call to Purchases", async () => {
        const Purchases = require("../dist/index").default;
        await Purchases.invalidatePurchaserInfoCache();

        expect(NativeModules.RNPurchases.invalidatePurchaserInfoCache).toBeCalledTimes(1);
      });
    });
  });

  describe("setAttributes", () => {
    describe("when setAttributes is called", () => {
      it("makes the right call to Purchases", async () => {
        const Purchases = require("../dist/index").default;
        const attributes = { band: "AirBourne", song: "Back in the game" }
        
        await Purchases.setAttributes(attributes);

        expect(NativeModules.RNPurchases.setAttributes).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setAttributes).toBeCalledWith(attributes);
      });
    });
  });

  describe("setEmail", () => {
    describe("when setEmail is called", () => {
      it("makes the right call to Purchases", async () => {
        const Purchases = require("../dist/index").default;
        const email = "garfield@revenuecat.com";

        await Purchases.setEmail(email);

        expect(NativeModules.RNPurchases.setEmail).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setEmail).toBeCalledWith(email);
      });
    });
  });

  describe("setPhoneNumber", () => {
    describe("when setPhoneNumber is called", () => {
      it("makes the right call to Purchases", async () => {
        const Purchases = require("../dist/index").default;
        const phoneNumber = "+123456789";

        await Purchases.setPhoneNumber(phoneNumber);

        expect(NativeModules.RNPurchases.setPhoneNumber).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setPhoneNumber).toBeCalledWith(phoneNumber);
      });
    });
  });

  describe("setDisplayName", () => {
    describe("when setDisplayName is called", () => {
      it("makes the right call to Purchases", async () => {
        const Purchases = require("../dist/index").default;
        const displayName = "Garfield";

        await Purchases.setDisplayName(displayName);

        expect(NativeModules.RNPurchases.setDisplayName).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setDisplayName).toBeCalledWith(displayName);
      });
    });
  });

  describe("setPushToken", () => {
    describe("when setPushToken is called", () => {
      it("makes the right call to Purchases", async () => {
        const Purchases = require("../dist/index").default;

        const pushToken = "65a1ds56adsgh6954asd";

        await Purchases.setPushToken(pushToken);

        expect(NativeModules.RNPurchases.setPushToken).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setPushToken).toBeCalledWith(pushToken);
      });
    });
  });

  describe("canMakePayments", () => {
    describe("when no parameters are passed", () => {
      it("calls Purchases with empty list", () => {
        const Purchases = require("../dist/index").default;

        Purchases.canMakePayments();

        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledWith([]);
      });
    });
    describe("when empty list is passed", () => {
      it("calls Purchases with empty list", () => {
        const Purchases = require("../dist/index").default;

        Purchases.canMakePayments([]);

        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledWith([]);
      });
    });
    describe("when list of parameters are passed", () => {
      it("calls Purchases with list of features", () => {
        const Purchases = require("../dist/index").default;

        Purchases.canMakePayments([Purchases.BILLING_FEATURE.SUBSCRIPTIONS]);

        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledWith([0]);
      });
    });
    describe("when list of parameters are passed", () => {
        it("parameters are mapped successfully", () => {
          const Purchases = require("../dist/index").default;

          Purchases.canMakePayments([Purchases.BILLING_FEATURE.SUBSCRIPTIONS,
            Purchases.BILLING_FEATURE.PRICE_CHANGE_CONFIRMATION,
            Purchases.BILLING_FEATURE.SUBSCRIPTIONS_ON_VR,
            Purchases.BILLING_FEATURE.SUBSCRIPTIONS_UPDATE,
            Purchases.BILLING_FEATURE.IN_APP_ITEMS_ON_VR,
            ]);

          expect(NativeModules.RNPurchases.canMakePayments).toBeCalledTimes(1);
          expect(NativeModules.RNPurchases.canMakePayments).toBeCalledWith([0, 4, 3, 1, 2]);
        });
      });
  });

  describe("isConfigured", () => {
    describe("when Purchases is not configured", () => {
      it("isConfigured returns false", async () => {
        const Purchases = require("../dist/index").default;

        const isConfigured = await Purchases.isConfigured();

        expect(NativeModules.RNPurchases.isConfigured).toBeCalledTimes(1);
        expect(isConfigured).toBeTruthy();
      });
    });
    describe("when Purchases is configured", () => {
      it("isConfigured returns true", async () => {
        const Purchases = require("../dist/index").default;
        NativeModules.RNPurchases.isConfigured.mockResolvedValueOnce(false);

        const isConfigured = await Purchases.isConfigured();

        expect(NativeModules.RNPurchases.isConfigured).toBeCalledTimes(1);
        expect(isConfigured).toBeFalsy();
      });
    });
  });
});
