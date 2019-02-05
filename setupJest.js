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
  getPurchaserInfo: () => Promise.resolve(purchaserInfoStub)
};

global.NativeEventEmitter = NativeEventEmitter;
global.RNPurchasesMock = NativeModules.RNPurchases;
global.purchaserInfoStub = purchaserInfoStub;
