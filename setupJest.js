const { NativeModules } = require("react-native");
const EventEmitter = require("EventEmitter");
const RCTDeviceEventEmitter = require("RCTDeviceEventEmitter");

/**
 * Mock the NativeEventEmitter as a normal JS EventEmitter.
 */
class NativeEventEmitter extends EventEmitter {
  constructor() {
    super(RCTDeviceEventEmitter.sharedSubscriber);
  }
}

global.purchaserInfoStub = {
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

global.entitlementsStub = {
  pro: {
    monthly: {
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
    },
    unlimited: {
      currency_code: "USD",
      intro_price_period: "",
      intro_price_string: "",
      price_string: "$4.99",
      intro_price_cycles: "",
      price: 4.99,
      intro_price: "",
      description: "you can eat it many times",
      title: "Consumable (PurchasesSample)",
      identifier: "consumable"
    },
    broken: null,
    annual: {
      currency_code: "USD",
      intro_price_period: "",
      intro_price_string: "",
      price_string: "$19.99",
      intro_price_cycles: "",
      price: 19.99,
      intro_price: "",
      description: "The best service, annually.",
      title: "Annual Free Trial (PurchasesSample)",
      identifier: "annual_freetrial"
    }
  }
};

global.productsStub = [
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

NativeModules.RNPurchases = {
  setupPurchases: jest.fn(),
  setAllowSharingStoreAccount: jest.fn(),
  addAttributionData: jest.fn(),
  getEntitlements: jest.fn(),
  getProductInfo: jest.fn(),
  makePurchase: jest.fn(),
  restoreTransactions: jest.fn(),
  getAppUserID: jest.fn(),
  createAlias: jest.fn(),
  identify: jest.fn(),
  setDebugLogsEnabled: jest.fn(),
  getPurchaserInfo: jest.fn(),
  reset: jest.fn(),
  syncPurchases: jest.fn(),
  setFinishTransactions: jest.fn()
};

global.NativeEventEmitter = NativeEventEmitter;
