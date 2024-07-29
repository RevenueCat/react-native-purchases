const {NativeModules, NativeEventEmitter, Platform} = require("react-native");
const {UnsupportedPlatformError} = require("../dist/errors");
const {REFUND_REQUEST_STATUS} = require("../dist/purchases");

const nativeEmitter = new NativeEventEmitter();

describe("Purchases", () => {
  var Purchases;

  beforeEach(() => {
    jest.resetAllMocks();
    NativeModules.RNPurchases.isConfigured.mockResolvedValue(true);

    Purchases = require("../dist/index").default;
  });

  it("addCustomerInfoUpdateListener correctly saves listeners", () => {
    const listener = jest.fn();

    Purchases.addCustomerInfoUpdateListener(listener);

    nativeEmitter.emit("Purchases-CustomerInfoUpdated", customerInfoStub);

    expect(listener).toHaveBeenCalledWith(customerInfoStub);
  });

  it("removeCustomerInfoUpdateListener correctly removes a listener", () => {
    const listener = jest.fn();
    Purchases.addCustomerInfoUpdateListener(listener);
    Purchases.removeCustomerInfoUpdateListener(listener);

    const eventInfo = {
      customerInfo: customerInfoStub,
      error: null,
    };

    nativeEmitter.emit("Purchases-CustomerInfoUpdated", eventInfo);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("addShouldPurchasePromoProductListener correctly saves listeners", () => {
    const listener = jest.fn();

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

    Purchases.addShouldPurchasePromoProductListener(listener);

    const nativeEmitter = new NativeEventEmitter();
    const eventInfo = {
      callbackID: 1,
    };
    nativeEmitter.emit("Purchases-ShouldPurchasePromoProduct", eventInfo);

    NativeModules.RNPurchases.makeDeferredPurchase.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub
    });

    let {customerInfo, purchasedProductIdentifier} = await this.deferredPurchase();

    expect(NativeModules.RNPurchases.makeDeferredPurchase).toBeCalledWith(1);
    expect(customerInfo).toEqual(customerInfoStub);
    expect(purchasedProductIdentifier).toEqual("123");
  });

  it("removeShouldPurchasePromoProductListener correctly removes a listener", () => {
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

  it("calling configure without an object throws exception", () => {
    expect(() => {
      Purchases.configure("api_key")
    }).toThrowError("Invalid API key. It must be called with an Object: configure({apiKey: \"key\"})");

    expect(() => {
      Purchases.configure("api_key", "user_id")
    }).toThrowError();

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledTimes(0);
  });

  it("calling configure with invalid user ID type throws exception", () => {
    expect(() => {
      Purchases.configure({apiKey: "api_key", appUserID: 123})
    }).toThrowError();

    expect(() => {
      Purchases.configure({apiKey: "api_key"})
    }).not.toThrowError();

    expect(() => {
      Purchases.configure({apiKey: "api_key", appUserID: "123a"})
    }).not.toThrowError();


    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledTimes(2);
  })

  it("allowing sharing store account works", async () => {
    await Purchases.setAllowSharingStoreAccount(true)

    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledWith(true);
    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("disallowing sharing store account works", async () => {
    await Purchases.setAllowSharingStoreAccount(false)

    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledWith(false);
    expect(NativeModules.RNPurchases.setAllowSharingStoreAccount).toBeCalledTimes(1);
  })

  it("get offerings works", async () => {
    NativeModules.RNPurchases.getOfferings.mockResolvedValueOnce(offeringsStub);

    const offerings = await Purchases.getOfferings();

    expect(NativeModules.RNPurchases.getOfferings).toBeCalledTimes(1);
    expect(offerings).toEqual(offeringsStub);
  })

  it("get current offerings for placement works", async () => {
    NativeModules.RNPurchases.getCurrentOfferingForPlacement.mockResolvedValueOnce(currentOfferingForPlacementStub);

    const offering = await Purchases.getCurrentOfferingForPlacement("onboarding")

    expect(NativeModules.RNPurchases.getCurrentOfferingForPlacement).toBeCalledWith("onboarding")
    expect(offering).toEqual(currentOfferingForPlacementStub);
  })

  it("sync attributes and offerings if needed works", async () => {
    NativeModules.RNPurchases.syncAttributesAndOfferingsIfNeeded.mockResolvedValueOnce(offeringsStub);

    const offerings = await Purchases.syncAttributesAndOfferingsIfNeeded()

    expect(NativeModules.RNPurchases.syncAttributesAndOfferingsIfNeeded).toBeCalledTimes(1);
    expect(offerings).toEqual(offeringsStub);
  })

  it("getProducts works and gets subs by default", async () => {
    NativeModules.RNPurchases.getProductInfo.mockResolvedValueOnce(productsStub);

    let products = await Purchases.getProducts("onemonth_freetrial");

    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledWith("onemonth_freetrial", "SUBSCRIPTION");
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledTimes(1);
    expect(products).toEqual(productsStub);

    NativeModules.RNPurchases.getProductInfo.mockResolvedValueOnce([]);

    products = await Purchases.getProducts("onemonth_freetrial", "NON_SUBSCRIPTION")

    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledWith("onemonth_freetrial", "NON_SUBSCRIPTION");
    expect(NativeModules.RNPurchases.getProductInfo).toBeCalledTimes(2);
    expect(products).toEqual([]);
  });


  it("purchaseProduct works", async () => {
    NativeModules.RNPurchases.purchaseProduct.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub
    });

    await Purchases.purchaseProduct("onemonth_freetrial")

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith("onemonth_freetrial", undefined, "subs", null, null, null);
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(1);

    await Purchases.purchaseProduct("onemonth_freetrial", {
      oldSKU: "viejo"
    }, Purchases.PRODUCT_CATEGORY.NON_SUBSCRIPTION)

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith("onemonth_freetrial", {oldSKU: "viejo"}, Purchases.PRODUCT_CATEGORY.NON_SUBSCRIPTION, null, null, null);
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(2);

    await Purchases.purchaseProduct("onemonth_freetrial", {
      oldSKU: "viejo",
      prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
    }, Purchases.PURCHASE_TYPE.INAPP)

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith("onemonth_freetrial", {
      oldSKU: "viejo",
      prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
    }, Purchases.PURCHASE_TYPE.INAPP, null, null, null);
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(3);
  });

  it("purchaseProduct with immediate_and_change_full_price proration mode sends the correct proration mode", async () => {
    NativeModules.RNPurchases.purchasePackage.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub,
      transaction: transactionStub
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
          priceString: "$4.5",
          currency_code: "USD",
          introPrice: null
        },
        presentedOfferingContext: {offeringIdentifier: "offering"},
      },
      {
        oldSKU: "viejo",
        prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
      },
    );
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith("$rc_onemonth",{offeringIdentifier: "offering"}, {
      oldSKU: "viejo",
      prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
    }, null, null);
  });

  it("purchaseStoreProduct works", async () => {
    NativeModules.RNPurchases.purchaseProduct.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub,
      transaction: transactionStub
    });

    const aProduct = {
      ...productStub,
      presentedOfferingContext: {offeringIdentifier: "the-offerings"}
    }

    await Purchases.purchaseStoreProduct(aProduct)

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith(aProduct.identifier, undefined, Purchases.PRODUCT_CATEGORY.SUBSCRIPTION, null, null, {offeringIdentifier: "the-offerings"});
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(1);
  });

  it("purchasePackage works", async () => {
    NativeModules.RNPurchases.purchasePackage.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub,
      transaction: transactionStub,
      transaction: transactionStub
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
          priceString: "$4.5",
          currencyCode: "USD",
          introPrice: null
        },
        presentedOfferingContext: {offeringIdentifier: "offering"},
      });

    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith("$rc_onemonth", {offeringIdentifier: "offering"}, undefined, null, null);
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
          priceString: "$4.5",
          currency_code: "USD",
          introPrice: null
        },
        presentedOfferingContext: {offeringIdentifier: "offering"},
      },
      {
        oldSKU: "viejo",
        prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
      },
    );

    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith("$rc_onemonth", {offeringIdentifier: "offering"}, {
      oldSKU: "viejo",
      prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
    }, null, null);
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledTimes(2);
    await Purchases.purchasePackage(
      {
        identifier: "$rc_onemonth",
        packageType: Purchases.PACKAGE_TYPE.MONTHLY,
        product: {
          identifier: "onemonth_freetrial",
          description: "description",
          title: "title",
          price: 4.5,
          priceString: "$4.5",
          currency_code: "USD",
          introPrice: null
        },
        presentedOfferingContext: {offeringIdentifier: "offering"},
      },
      {
        oldProductIdentifier: "viejo",
        prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
      },
    );
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith("$rc_onemonth", {offeringIdentifier: "offering"}, {
      oldProductIdentifier: "viejo",
      prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
    }, null, null);
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledTimes(3);
  });

  it("purchaseSubscriptionOption works", async () => {
    Platform.OS = "android";
    NativeModules.RNPurchases.purchaseSubscriptionOption.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub,
      transaction: transactionStub
    });

    const billingPeriod = {
      "unit": "MONTH",
      "value": 1,
      "iso8601": "P1M"
    };
    const phase = {
      "billingPeriod": billingPeriod,
      "recurrenceMode": 1,
      "billingCycleCount": 0,
      "price": {
          "formatted": "$4.99",
          "amountMicros": 49900000,
          "currencyCode": "USD"
      },
      "offerPaymentMode": null
    };

    await Purchases.purchaseSubscriptionOption(
      {
        id: "monthly",
        storeProductId: "gold:monthly",
        productId: "gold",
        pricingPhases: [phase],
        tags: [],
        isBasePlan: true,
        billingPeriod: billingPeriod,
        isPrePaid: false,
        fullPricePhase: phase,
        freePhase: null,
        introPhase: null,
        presentedOfferingIdentifier: null
      });

    expect(NativeModules.RNPurchases.purchaseSubscriptionOption).toBeCalledWith("gold", "monthly", undefined, null, null, undefined);
    expect(NativeModules.RNPurchases.purchaseSubscriptionOption).toBeCalledTimes(1);

    await Purchases.purchaseSubscriptionOption(
      {
        id: "monthly",
        storeProductId: "gold:monthly",
        productId: "gold",
        pricingPhases: [phase],
        tags: [],
        isBasePlan: true,
        billingPeriod: billingPeriod,
        isPrePaid: false,
        fullPricePhase: phase,
        freePhase: null,
        introPhase: null,
        presentedOfferingContext: {offeringIdentifier: "offering"},
      },
      {
        oldProductIdentifier: "viejo",
        prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
      },
      true
    );

    expect(NativeModules.RNPurchases.purchaseSubscriptionOption).toBeCalledWith("gold", "monthly", {
      oldProductIdentifier: "viejo",
      prorationMode: Purchases.PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE
    }, null, {isPersonalizedPrice: true}, {offeringIdentifier: "offering"});
    expect(NativeModules.RNPurchases.purchaseSubscriptionOption).toBeCalledTimes(2);
  });

  it("restorePurchases works", async () => {
    NativeModules.RNPurchases.restorePurchases.mockResolvedValueOnce(customerInfoStub);

    const customerInfo = await Purchases.restorePurchases();

    expect(NativeModules.RNPurchases.restorePurchases).toBeCalledTimes(1);
    expect(customerInfo).toEqual(customerInfoStub);
  })

  it("getAppUserID works", async () => {
    NativeModules.RNPurchases.getAppUserID.mockResolvedValueOnce("123");

    const appUserID = await Purchases.getAppUserID()

    expect(NativeModules.RNPurchases.getAppUserID).toBeCalledTimes(1);
    expect(appUserID).toEqual("123");
  })

  describe("when calling logIn", () => {
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

    it("returns the correct LogInResult if successful", async () => {
      const mockCreated = (Math.random() < 0.5);

      NativeModules.RNPurchases.logIn.mockResolvedValueOnce({
        created: mockCreated,
        customerInfo: customerInfoStub
      });

      const logInResult = await Purchases.logIn("myUser");

      expect(logInResult.created).toBe(mockCreated);
      expect(logInResult.customerInfo).toBe(customerInfoStub);
      expect(NativeModules.RNPurchases.logIn).toBeCalledTimes(1);
    });
  });

  describe("when calling logOut", () => {
    it("correctly passes the call to the native module and returns the value", async () => {
      NativeModules.RNPurchases.logOut.mockResolvedValueOnce(customerInfoStub);

      const customerInfo = await Purchases.logOut();

      expect(customerInfo).toBe(customerInfoStub);
      expect(NativeModules.RNPurchases.logOut).toBeCalledTimes(1);
    });
  });

  it("setDebugLogsEnabled works", () => {
    Purchases.setDebugLogsEnabled(true)

    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledWith(true);
    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledTimes(1);

    Purchases.setDebugLogsEnabled(false)

    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledWith(false);
    expect(NativeModules.RNPurchases.setDebugLogsEnabled).toBeCalledTimes(2);
  });

  it("setLogLevel verbose", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);

    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledWith("VERBOSE");
    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledTimes(1);
  });

  it("setLogLevel verbose", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);

    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledWith("VERBOSE");
    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledTimes(1);
  });

  it("setLogLevel debug", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledWith("DEBUG");
    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledTimes(1);
  });

  it("setLogLevel info", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO);

    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledWith("INFO");
    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledTimes(1);
  });

  it("setLogLevel warning", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);

    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledWith("WARN");
    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledTimes(1);
  });

  it("setLogLevel error", () => {
    const Purchases = require("../dist/index").default;

    Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);

    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledWith("ERROR");
    expect(NativeModules.RNPurchases.setLogLevel).toBeCalledTimes(1);
  });

  describe("setLogHandler", () => {
    const Purchases = require("../dist/index").default;

    const logDetailsStub = {logLevel: Purchases.LOG_LEVEL.INFO, message: "a message"}

    for (const logLevel of Object.keys(Purchases.LOG_LEVEL)) {
      it(`setLogHandler fires the callback for ${logLevel} logs`, () => {
        let receivedLogLevel;
        Purchases.setLogHandler((logLevel, message) => {
          receivedLogLevel = logLevel
          expect(message).toEqual(logDetailsStub.message);
        });
        nativeEmitter.emit("Purchases-LogHandlerEvent", {...logDetailsStub, logLevel});

        expect(NativeModules.RNPurchases.setLogHandler).toBeCalledTimes(1);

        expect(receivedLogLevel).toEqual(logLevel);
      });
    }

  });

  it("getCustomerInfo works", async () => {
    NativeModules.RNPurchases.getCustomerInfo.mockResolvedValueOnce(customerInfoStub);

    const customerInfo = await Purchases.getCustomerInfo();

    expect(NativeModules.RNPurchases.getCustomerInfo).toBeCalledTimes(1);
    expect(customerInfo).toEqual(customerInfoStub);
  })

  it("configure works", async () => {
    const defaultVerificationMode = "DISABLED"

    Purchases.configure({apiKey: "key", appUserID: "user"});
    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", "REVENUECAT", undefined, "DEFAULT", false, true, defaultVerificationMode, false);

    Purchases.configure({apiKey: "key", appUserID: "user", observerMode: true});
    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", true, undefined, false, false, true, defaultVerificationMode, false);

    Purchases.configure({
      apiKey: "key",
      appUserID: "user",
      observerMode: false,
      userDefaultsSuiteName: "suite name",
      usesStoreKit2IfAvailable: true
    });
    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", false, "suite name", true, false, true, defaultVerificationMode, false);

    Purchases.configure({
      apiKey: "key",
      appUserID: "user",
      observerMode: true,
      userDefaultsSuiteName: "suite name",
      usesStoreKit2IfAvailable: true,
      useAmazon: true,
      shouldShowInAppMessagesAutomatically: true,
      entitlementVerificationMode: Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
      pendingTransactionsForPrepaidPlansEnabled: true
    });
    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", true, "suite name", true, true, true, Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL, true);

    Purchases.configure({
      apiKey: "key",
      appUserID: "user",
      observerMode: true,
      userDefaultsSuiteName: "suite name",
      usesStoreKit2IfAvailable: true,
      useAmazon: true,
      shouldShowInAppMessagesAutomatically: false
    });
    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledWith("key", "user", true, "suite name", true, true, false, defaultVerificationMode, false);

    expect(NativeModules.RNPurchases.setupPurchases).toBeCalledTimes(5);
  })

  it("cancelled purchaseProduct sets userCancelled in the error", () => {
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
    NativeModules.RNPurchases.purchaseProduct.mockResolvedValueOnce({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub
    });

    return expect(Purchases.purchaseProduct("onemonth_freetrial")).resolves.toEqual({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub
    });
  })

  it("syncpurchases works for android", async () => {
    Platform.OS = "android";

    await Purchases.syncPurchases();

    expect(NativeModules.RNPurchases.syncPurchases).toBeCalledTimes(1);
  })

  it("syncpurchases works for ios", async () => {
    Platform.OS = "ios";

    await Purchases.syncPurchases();

    expect(NativeModules.RNPurchases.syncPurchases).toBeCalledTimes(1);
  })

  it("syncObserverModeAmazonPurchase works for android", async () => {
    Platform.OS = "android";

    await Purchases.syncObserverModeAmazonPurchase(
      'productID_test',
      'receiptID_test',
      'amazonUserID_test',
      'isoCurrencyCode_test',
      3.4,
    );

    expect(NativeModules.RNPurchases.syncObserverModeAmazonPurchase).toBeCalledTimes(1);
    expect(NativeModules.RNPurchases.syncObserverModeAmazonPurchase).toBeCalledWith(
      'productID_test',
      'receiptID_test',
      'amazonUserID_test',
      'isoCurrencyCode_test',
      3.4
    );
  })

  it("syncObserverModeAmazonPurchase throws UninitializedError if called before configuring", async () => {
    Platform.OS = "android";

    NativeModules.RNPurchases.isConfigured.mockResolvedValue(false);

    const expected = new Purchases.UninitializedPurchasesError();


    await Purchases.syncObserverModeAmazonPurchase(
      'productID_test',
      'receiptID_test',
      'amazonUserID_test',
      'isoCurrencyCode_test',
      3.4,
    ).then(() => {
      fail(`${allPropertyNames[i]} should have failed`);
    }).catch(error => {
      expect(error.name).toEqual(expected.name);
      expect(error.message).toEqual(expected.message);
    });
  });


  it("syncObserverModeAmazonPurchase throws UnsupportedPlatformError for ios", async () => {
    Platform.OS = "ios";

    try {
      await Purchases.syncObserverModeAmazonPurchase(
        'productID_test',
        'receiptID_test',
        'amazonUserID_test',
        'isoCurrencyCode_test',
        3.4,
      );
      fail("expected error");
    } catch (error) {
      if (!(error instanceof UnsupportedPlatformError)) {
        fail("expected UnsupportedPlatformException");
      }
    }
  })

  it("finishTransactions works", async () => {
    await Purchases.setFinishTransactions(true);
    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledWith(true);

    await Purchases.setFinishTransactions(false);
    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledWith(false);

    expect(NativeModules.RNPurchases.setFinishTransactions).toBeCalledTimes(2);
  })

  it("checkTrialOrIntroductoryPriceEligibility works", async () => {
    await Purchases.checkTrialOrIntroductoryPriceEligibility(["monthly"])

    expect(NativeModules.RNPurchases.checkTrialOrIntroductoryPriceEligibility).toBeCalledWith(["monthly"]);
  })

  it("getPromotionalOffer works", async () => {
    NativeModules.RNPurchases.getPromotionalOffer.mockResolvedValue(promotionalOfferStub);

    const aProduct = {
      ...productStub,
      discounts: [discountStub]
    }

    await Purchases.getPromotionalOffer(aProduct, discountStub)

    expect(NativeModules.RNPurchases.getPromotionalOffer).toBeCalledWith(aProduct.identifier, discountStub.identifier);
    expect(NativeModules.RNPurchases.getPromotionalOffer).toBeCalledTimes(1);
  });

  it("getPromotionalOffer returns undefined for Android", async () => {
    Platform.OS = "android";

    let promotionalOffer = await Purchases.getPromotionalOffer(productStub, discountStub);

    expect(promotionalOffer).toEqual(undefined)
    expect(NativeModules.RNPurchases.getPromotionalOffer).toBeCalledTimes(0);
  });

  it("getPromotionalOffer throws error when null discount", async () => {
    Platform.OS = "ios";

    await expect(Purchases.getPromotionalOffer(productStub, null))
      .rejects
      .toThrow("A discount is required");

    await expect(Purchases.getPromotionalOffer(productStub))
      .rejects
      .toThrow("A discount is required");

    expect(NativeModules.RNPurchases.getPromotionalOffer).toBeCalledTimes(0);
  });

  it("purchaseDiscountedProduct works", async () => {
    NativeModules.RNPurchases.purchaseProduct.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub
    });

    const aProduct = {
      ...productStub,
      discounts: [discountStub],
      presentedOfferingIdentifier: null
    }

    await Purchases.purchaseDiscountedProduct(aProduct, promotionalOfferStub)

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledWith(aProduct.identifier, null, null, promotionalOfferStub.timestamp.toString(), null, undefined);
    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(1);
  });

  it("purchaseDiscountedProduct throws if null or undefined discount", async () => {
    await expect(Purchases.purchaseDiscountedProduct(productStub, null))
      .rejects
      .toThrow("A discount is required");

    await expect(Purchases.purchaseDiscountedProduct(productStub))
      .rejects
      .toThrow("A discount is required");

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(0);
  });

  it("purchaseDiscountedPackage works", async () => {
    NativeModules.RNPurchases.purchasePackage.mockResolvedValue({
      purchasedProductIdentifier: "123",
      customerInfo: customerInfoStub
    });

    const aProduct = {
      ...productStub,
      discounts: [discountStub]
    }

    const aPackage = {
      ...packagestub,
      product: aProduct
    }

    await Purchases.purchaseDiscountedPackage(aPackage, promotionalOfferStub)

    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledWith(
      aPackage.identifier,
      aPackage.presentedOfferingContext,
      null,
      promotionalOfferStub.timestamp.toString(),
      null
    );
    expect(NativeModules.RNPurchases.purchasePackage).toBeCalledTimes(1);

  });

  it("purchaseDiscountedPackage throws if null or undefined discount", async () => {
    await expect(Purchases.purchaseDiscountedPackage(packagestub, null))
      .rejects
      .toThrow("A discount is required");

    await expect(Purchases.purchaseDiscountedPackage(packagestub))
      .rejects
      .toThrow("A discount is required");

    expect(NativeModules.RNPurchases.purchaseProduct).toBeCalledTimes(0);
  });

  describe("invalidate customer info cache", () => {
    describe("when invalidateCustomerInfoCache is called", () => {
      it("makes the right call to Purchases", async () => {
        await Purchases.invalidateCustomerInfoCache();

        expect(NativeModules.RNPurchases.invalidateCustomerInfoCache).toBeCalledTimes(1);
      });
    });
  });

  describe("setAttributes", () => {
    describe("when setAttributes is called", () => {
      it("makes the right call to Purchases", async () => {
        const attributes = {band: "AirBourne", song: "Back in the game"}

        await Purchases.setAttributes(attributes);

        expect(NativeModules.RNPurchases.setAttributes).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setAttributes).toBeCalledWith(attributes);
      });
    });
  });

  describe("setEmail", () => {
    describe("when setEmail is called", () => {
      it("makes the right call to Purchases", async () => {
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
        Purchases.canMakePayments();

        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledWith([]);
      });
    });
    describe("when empty list is passed", () => {
      it("calls Purchases with empty list", () => {
        Purchases.canMakePayments([]);

        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledWith([]);
      });
    });
    describe("when list of parameters are passed", () => {
      it("calls Purchases with list of features", () => {
        Purchases.canMakePayments([Purchases.BILLING_FEATURE.SUBSCRIPTIONS]);

        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.canMakePayments).toBeCalledWith([0]);
      });
    });
    describe("when list of parameters are passed", () => {
      it("parameters are mapped successfully", () => {
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
    describe("when Purchases is configured", () => {
      it("isConfigured returns true", async () => {
        const isConfigured = await Purchases.isConfigured();

        expect(NativeModules.RNPurchases.isConfigured).toBeCalledTimes(1);
        expect(isConfigured).toBeTruthy();
      });
    });
    describe("when Purchases is not configured", () => {
      it("isConfigured returns false", async () => {
        NativeModules.RNPurchases.isConfigured.mockResolvedValueOnce(false);

        const isConfigured = await Purchases.isConfigured();

        expect(NativeModules.RNPurchases.isConfigured).toBeCalledTimes(1);
        expect(isConfigured).toBeFalsy();
      });
    });
  });

  describe("UninitializedError is thrown", () => {
    function isFunction(functionToCheck) {
      return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }

    Purchases = require("../dist/index").default;

    const allPropertyNames = Object.getOwnPropertyNames(Purchases);

    // This functions should skip the test since they not required an instance of Purchases
    const excludedFunctionNames = [
      "configure",
      "setSimulatesAskToBuyInSandbox",
      "addCustomerInfoUpdateListener",
      "removeCustomerInfoUpdateListener",
      "addShouldPurchasePromoProductListener",
      "removeShouldPurchasePromoProductListener",
      "setAutomaticAppleSearchAdsAttributionCollection",
      "addAttributionData",
      "setDebugLogsEnabled",
      "setLogLevel",
      "setLogHandler",
      "canMakePayments",
      "UninitializedPurchasesError",
      "UnsupportedPlatformError",
      "throwIfNotConfigured",
      "throwIfAndroidPlatform",
      "throwIfIOSPlatform",
      "convertIntToRefundRequestStatus",
      "isConfigured",
      "setProxyURL"
    ];
    const functionsThatRequireAndroidAndInstance = [
      "syncObserverModeAmazonPurchase",
    ];
    const expected = new Purchases.UninitializedPurchasesError();
    for (let i = 0; i < allPropertyNames.length; i++) {
      let propertyName = allPropertyNames[i];

      const property = Purchases[propertyName];
      if (isFunction(property) && excludedFunctionNames.indexOf(propertyName) === -1) {

        it(`${propertyName} for functions that require the SDK to be configured if called before configuring`, async () => {
          NativeModules.RNPurchases.isConfigured.mockResolvedValue(false);
          if (functionsThatRequireAndroidAndInstance.indexOf(propertyName) !== -1) {
            Platform.OS = "android";
          } else {
            Platform.OS = "ios";
          }

          // Uncomment if test is failing to see which function is giving issues.
          // If function doesn't require an instance of Purchases, add it to excludedFunctionNames.
          // console.log(`Testing ${allPropertyNames[i]}`);
          await property().then(() => {
            fail(`${propertyName} should have failed`);
          }).catch(error => {
            expect(error.name).toEqual(expected.name);
            expect(error.message).toEqual(expected.message);
          });
        });
      }
    }
  });

  describe("setCleverTapID", () => {
    describe("when setCleverTapID is called", () => {
      it("makes the right call to Purchases", async () => {
        const attributionID = "65a1ds56adsgh6954asd";

        await Purchases.setCleverTapID(attributionID);

        expect(NativeModules.RNPurchases.setCleverTapID).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setCleverTapID).toBeCalledWith(attributionID);
      });
    });
  });

  describe("setMixpanelDistinctID", () => {
    describe("when setMixpanelDistinctID is called", () => {
      it("makes the right call to Purchases", async () => {
        const attributionID = "65a1ds56adsgh6954asd";

        await Purchases.setMixpanelDistinctID(attributionID);

        expect(NativeModules.RNPurchases.setMixpanelDistinctID).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setMixpanelDistinctID).toBeCalledWith(attributionID);
      });
    });
  });

  describe("setFirebaseAppInstanceID", () => {
    describe("when setFirebaseAppInstanceID is called", () => {
      it("makes the right call to Purchases", async () => {
        const attributionID = "65a1ds56adsgh6954asd";

        await Purchases.setFirebaseAppInstanceID(attributionID);

        expect(NativeModules.RNPurchases.setFirebaseAppInstanceID).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.setFirebaseAppInstanceID).toBeCalledWith(attributionID);
      });
    });
  });

  describe("showInAppMessages", () => {
    beforeEach(() => {
      Platform.OS = "ios";
    });

    describe("when Purchases is not configured", () => {
      it("it rejects", async () => {
        NativeModules.RNPurchases.isConfigured.mockResolvedValueOnce(false);

        try {
          await Purchases.showInAppMessages();
          fail("expected error");
        } catch (error) { }

        expect(NativeModules.RNPurchases.showInAppMessages).toBeCalledTimes(0);
      });
    });

    it("makes right calls", async () => {
      NativeModules.RNPurchases.showInAppMessages.mockResolvedValueOnce(0);

      await Purchases.showInAppMessages();

      expect(NativeModules.RNPurchases.showInAppMessages).toBeCalledTimes(1);
    });
  });

  describe("beginRefundRequest", () => {
    beforeEach(() => {
      Platform.OS = "ios";
    });

    describe("forActiveEntitlement", () => {
      it("throws UnsupportedPlatformError if called on Android", async () => {
        Platform.OS = "android";

        try {
          await Purchases.beginRefundRequestForActiveEntitlement();
          fail("expected error");
        } catch (error) {
          if (!(error instanceof UnsupportedPlatformError)) {
            fail("expected UnsupportedPlatformException");
          }
        }
      });

      it("throws UnsupportedPlatformError if native returns null", async () => {
        NativeModules.RNPurchases.beginRefundRequestForActiveEntitlement.mockResolvedValueOnce(null);

        try {
          await Purchases.beginRefundRequestForActiveEntitlement();
          fail("expected error");
        } catch (error) {
          if (!(error instanceof UnsupportedPlatformError)) {
            fail("expected UnsupportedPlatformException");
          }
        }
      });

      it("returns success if getting success from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForActiveEntitlement.mockResolvedValueOnce(0);

        let refundRequestStatus = await Purchases.beginRefundRequestForActiveEntitlement();
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.SUCCESS);
      });

      it("returns user cancelled if getting user cancelled from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForActiveEntitlement.mockResolvedValueOnce(1);

        let refundRequestStatus = await Purchases.beginRefundRequestForActiveEntitlement();
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.USER_CANCELLED);
      });

      it("returns error if getting different code from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForActiveEntitlement.mockResolvedValueOnce(2);

        let refundRequestStatus = await Purchases.beginRefundRequestForActiveEntitlement();
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.ERROR);
      });

      it("makes right calls", async () => {
        NativeModules.RNPurchases.beginRefundRequestForActiveEntitlement.mockResolvedValueOnce(0);

        await Purchases.beginRefundRequestForActiveEntitlement();

        expect(NativeModules.RNPurchases.beginRefundRequestForActiveEntitlement).toBeCalledTimes(1);
      });
    });

    describe("forEntitlement", () => {
      it("throws UnsupportedPlatformError if called on Android", async () => {
        Platform.OS = "android";

        try {
          await Purchases.beginRefundRequestForEntitlement(entitlementInfoStub);
          fail("expected error");
        } catch (error) {
          if (!(error instanceof UnsupportedPlatformError)) {
            fail("expected UnsupportedPlatformException");
          }
        }
      });

      it("throws UnsupportedPlatformError if native returns null", async () => {
        NativeModules.RNPurchases.beginRefundRequestForEntitlementId.mockResolvedValueOnce(null);

        try {
          await Purchases.beginRefundRequestForEntitlement(entitlementInfoStub);
          fail("expected error");
        } catch (error) {
          if (!(error instanceof UnsupportedPlatformError)) {
            fail("expected UnsupportedPlatformException");
          }
        }
      });

      it("returns success if getting success from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForEntitlementId.mockResolvedValueOnce(0);

        let refundRequestStatus = await Purchases.beginRefundRequestForEntitlement(entitlementInfoStub);
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.SUCCESS);
      });

      it("returns user cancelled if getting user cancelled from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForEntitlementId.mockResolvedValueOnce(1);

        let refundRequestStatus = await Purchases.beginRefundRequestForEntitlement(entitlementInfoStub);
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.USER_CANCELLED);
      });

      it("returns error if getting different code from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForEntitlementId.mockResolvedValueOnce(2);

        let refundRequestStatus = await Purchases.beginRefundRequestForEntitlement(entitlementInfoStub);
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.ERROR);
      });

      it("makes right calls", async () => {
        NativeModules.RNPurchases.beginRefundRequestForEntitlementId.mockResolvedValueOnce(0);

        await Purchases.beginRefundRequestForEntitlement(entitlementInfoStub);

        expect(NativeModules.RNPurchases.beginRefundRequestForEntitlementId).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.beginRefundRequestForEntitlementId).toBeCalledWith("entitlement_id");
      });
    });

    describe("forProduct", () => {
      it("throws UnsupportedPlatformError if called on Android", async () => {
        Platform.OS = "android";

        try {
          await Purchases.beginRefundRequestForProduct(productStub);
          fail("expected error");
        } catch (error) {
          if (!(error instanceof UnsupportedPlatformError)) {
            fail("expected UnsupportedPlatformException");
          }
        }
      });

      it("throws UnsupportedPlatformError if native returns null", async () => {
        NativeModules.RNPurchases.beginRefundRequestForProductId.mockResolvedValueOnce(null);

        try {
          await Purchases.beginRefundRequestForProduct(productStub);
          fail("expected error");
        } catch (error) {
          if (!(error instanceof UnsupportedPlatformError)) {
            fail("expected UnsupportedPlatformException");
          }
        }
      });

      it("returns success if getting success from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForProductId.mockResolvedValueOnce(0);

        let refundRequestStatus = await Purchases.beginRefundRequestForProduct(productStub);
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.SUCCESS);
      });

      it("returns user cancelled if getting user cancelled from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForProductId.mockResolvedValueOnce(1);

        let refundRequestStatus = await Purchases.beginRefundRequestForProduct(productStub);
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.USER_CANCELLED);
      });

      it("returns error if getting different code from native layer", async () => {
        NativeModules.RNPurchases.beginRefundRequestForProductId.mockResolvedValueOnce(2);

        let refundRequestStatus = await Purchases.beginRefundRequestForProduct(productStub);
        expect(refundRequestStatus).toEqual(REFUND_REQUEST_STATUS.ERROR);
      });

      it("makes right calls", async () => {
        NativeModules.RNPurchases.beginRefundRequestForProductId.mockResolvedValueOnce(0);

        await Purchases.beginRefundRequestForProduct(productStub);

        expect(NativeModules.RNPurchases.beginRefundRequestForProductId).toBeCalledTimes(1);
        expect(NativeModules.RNPurchases.beginRefundRequestForProductId).toBeCalledWith("onemonth_freetrial");
      });
    });
  });
});
