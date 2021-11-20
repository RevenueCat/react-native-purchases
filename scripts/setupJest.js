const {NativeModules} = require("react-native");

global.purchaserInfoStub = {
  activeSubscriptions: ["annual_freetrial"],
  allExpirationDates: {
    onetime_purchase: null,
    consumable: null,
    annual_freetrial: "2019-01-23T22:34:21Z",
    onemonth_freetrial: "2019-01-19T01:41:06Z"
  },
  allPurchaseDates: {
    onetime_purchase: "2018-01-23T22:34:21Z",
    consumable: "2018-01-23T22:34:21Z",
    annual_freetrial: "2018-01-23T22:34:21Z",
    onemonth_freetrial: "2018-01-19T01:41:06Z"
  },
  allPurchasedProductIdentifiers: [
    "onetime_purchase",
    "consumable",
    "annual_freetrial",
    "onemonth_freetrial"
  ],
  entitlements: {
    active: {
      pro_cat: {
        billingIssueDetectedAt: null,
        expirationDate: null,
        identifier: "pro_cat",
        isActive: true,
        isSandbox: true,
        latestPurchaseDate: "2019-07-26T22:11:41.000Z",
        originalPurchaseDate: "2019-12-02T21:31:19.000Z",
        periodType: "NORMAL",
        productIdentifier: "consumable",
        store: "PLAY_STORE",
        unsubscribeDetectedAt: null,
        willRenew: true
      }
    },
    all: {
      pro_cat: {
        billingIssueDetectedAt: null,
        expirationDate: null,
        identifier: "pro_cat",
        isActive: true,
        isSandbox: true,
        latestPurchaseDate: "2019-07-26T22:11:41.000Z",
        originalPurchaseDate: "2019-12-02T21:31:19.000Z",
        periodType: "NORMAL",
        productIdentifier: "consumable",
        store: "PLAY_STORE",
        unsubscribeDetectedAt: null,
        willRenew: true
      }
    }
  },
  firstSeen: "2019-10-31T23:02:07.000Z",
  latestExpirationDate: "2019-01-23T22:34:21Z",
  originalAppUserId: "9AE22FE1-D0A3-4341-85B6-D1D6C24C404A",
  originalApplicationVersion: null,
  requestDate: "2019-12-03T00:47:58.000Z",
  managementURL: "https://url.com"
};

global.offeringsStub = {
  current: {
    weekly: {
      offeringIdentifier: 'default',
      product: {
        intro_price_period_number_of_units: 7,
        intro_price_period_unit: 'DAY',
        intro_price_cycles: 3,
        intro_price_period: 'P1W',
        intro_price_string: '$4.99',
        intro_price: 4.99,
        description: 'Product with intro price',
        currency_code: 'USD',
        price_string: '$9.99',
        price: 9.99,
        title: 'Introductory Price (PurchasesSample)',
        identifier: 'introductory_price'
      },
      packageType: 'WEEKLY',
      identifier: '$rc_weekly'
    },
    monthly: null,
    twoMonth: {
      offeringIdentifier: 'default',
      product: {
        intro_price_period_number_of_units: 16,
        intro_price_period_unit: 'DAY',
        intro_price_cycles: 1,
        intro_price_period: 'P2W2D',
        intro_price_string: '$0.00',
        intro_price: 0,
        description: 'The best service, annually.',
        currency_code: 'USD',
        price_string: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial'
      },
      packageType: 'TWO_MONTH',
      identifier: '$rc_two_month'
    },
    threeMonth: {
      offeringIdentifier: 'default',
      product: {
        intro_price_period_number_of_units: 16,
        intro_price_period_unit: 'DAY',
        intro_price_cycles: 1,
        intro_price_period: 'P2W2D',
        intro_price_string: '$0.00',
        intro_price: 0,
        description: 'The best service, annually.',
        currency_code: 'USD',
        price_string: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial'
      },
      packageType: 'THREE_MONTH',
      identifier: '$rc_three_month'
    },
    sixMonth: {
      offeringIdentifier: 'default',
      product: {
        intro_price_period_number_of_units: 16,
        intro_price_period_unit: 'DAY',
        intro_price_cycles: 1,
        intro_price_period: 'P2W2D',
        intro_price_string: '$0.00',
        intro_price: 0,
        description: 'The best service, annually.',
        currency_code: 'USD',
        price_string: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial'
      },
      packageType: 'SIX_MONTH',
      identifier: '$rc_six_month'
    },
    annual: {
      offeringIdentifier: 'default',
      product: {
        intro_price_period_number_of_units: 16,
        intro_price_period_unit: 'DAY',
        intro_price_cycles: 1,
        intro_price_period: 'P2W2D',
        intro_price_string: '$0.00',
        intro_price: 0,
        description: 'The best service, annually.',
        currency_code: 'USD',
        price_string: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial'
      },
      packageType: 'ANNUAL',
      identifier: '$rc_annual'
    },
    lifetime: {
      offeringIdentifier: 'default',
      product: {
        intro_price_period_number_of_units: null,
        intro_price_period_unit: null,
        intro_price_cycles: null,
        intro_price_period: null,
        intro_price_string: null,
        intro_price: null,
        description: 'you can eat it many times',
        currency_code: 'USD',
        price_string: '$4.99',
        price: 4.99,
        title: 'Consumable (PurchasesSample)',
        identifier: 'consumable'
      },
      packageType: 'LIFETIME',
      identifier: '$rc_lifetime'
    },
    availablePackages: [
      {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'ANNUAL',
        identifier: '$rc_annual'
      },
      {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'SIX_MONTH',
        identifier: '$rc_six_month'
      },
      {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'THREE_MONTH',
        identifier: '$rc_three_month'
      },
      {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'TWO_MONTH',
        identifier: '$rc_two_month'
      },
      {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 7,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 3,
          intro_price_period: 'P1W',
          intro_price_string: '$4.99',
          intro_price: 4.99,
          description: 'Product with intro price',
          currency_code: 'USD',
          price_string: '$9.99',
          price: 9.99,
          title: 'Introductory Price (PurchasesSample)',
          identifier: 'introductory_price'
        },
        packageType: 'WEEKLY',
        identifier: '$rc_weekly'
      },
      {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: null,
          intro_price_period_unit: null,
          intro_price_cycles: null,
          intro_price_period: null,
          intro_price_string: null,
          intro_price: null,
          description: 'you can eat it many times',
          currency_code: 'USD',
          price_string: '$4.99',
          price: 4.99,
          title: 'Consumable (PurchasesSample)',
          identifier: 'consumable'
        },
        packageType: 'LIFETIME',
        identifier: '$rc_lifetime'
      },
      {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'CUSTOM',
        identifier: 'Custom'
      }
    ],
    serverDescription: 'Default Offering',
    identifier: 'default'
  },
  all: {
    test: {
      weekly: null,
      monthly: {
        offeringIdentifier: 'test',
        product: {
          intro_price_period_number_of_units: 7,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 3,
          intro_price_period: 'P1W',
          intro_price_string: '$4.99',
          intro_price: 4.99,
          description: 'Product with intro price',
          currency_code: 'USD',
          price_string: '$9.99',
          price: 9.99,
          title: 'Introductory Price (PurchasesSample)',
          identifier: 'introductory_price'
        },
        packageType: 'MONTHLY',
        identifier: '$rc_monthly'
      },
      twoMonth: null,
      threeMonth: null,
      sixMonth: null,
      annual: null,
      lifetime: null,
      availablePackages: [
        {
          offeringIdentifier: 'test',
          product: {
            intro_price_period_number_of_units: 7,
            intro_price_period_unit: 'DAY',
            intro_price_cycles: 3,
            intro_price_period: 'P1W',
            intro_price_string: '$4.99',
            intro_price: 4.99,
            description: 'Product with intro price',
            currency_code: 'USD',
            price_string: '$9.99',
            price: 9.99,
            title: 'Introductory Price (PurchasesSample)',
            identifier: 'introductory_price'
          },
          packageType: 'MONTHLY',
          identifier: '$rc_monthly'
        }
      ],
      serverDescription: 'Testing an offering',
      identifier: 'test'
    },
    'default': {
      weekly: {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 7,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 3,
          intro_price_period: 'P1W',
          intro_price_string: '$4.99',
          intro_price: 4.99,
          description: 'Product with intro price',
          currency_code: 'USD',
          price_string: '$9.99',
          price: 9.99,
          title: 'Introductory Price (PurchasesSample)',
          identifier: 'introductory_price'
        },
        packageType: 'WEEKLY',
        identifier: '$rc_weekly'
      },
      monthly: null,
      twoMonth: {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'TWO_MONTH',
        identifier: '$rc_two_month'
      },
      threeMonth: {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'THREE_MONTH',
        identifier: '$rc_three_month'
      },
      sixMonth: {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'SIX_MONTH',
        identifier: '$rc_six_month'
      },
      annual: {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: 16,
          intro_price_period_unit: 'DAY',
          intro_price_cycles: 1,
          intro_price_period: 'P2W2D',
          intro_price_string: '$0.00',
          intro_price: 0,
          description: 'The best service, annually.',
          currency_code: 'USD',
          price_string: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial'
        },
        packageType: 'ANNUAL',
        identifier: '$rc_annual'
      },
      lifetime: {
        offeringIdentifier: 'default',
        product: {
          intro_price_period_number_of_units: null,
          intro_price_period_unit: null,
          intro_price_cycles: null,
          intro_price_period: null,
          intro_price_string: null,
          intro_price: null,
          description: 'you can eat it many times',
          currency_code: 'USD',
          price_string: '$4.99',
          price: 4.99,
          title: 'Consumable (PurchasesSample)',
          identifier: 'consumable'
        },
        packageType: 'LIFETIME',
        identifier: '$rc_lifetime'
      },
      availablePackages: [
        {
          offeringIdentifier: 'default',
          product: {
            intro_price_period_number_of_units: 16,
            intro_price_period_unit: 'DAY',
            intro_price_cycles: 1,
            intro_price_period: 'P2W2D',
            intro_price_string: '$0.00',
            intro_price: 0,
            description: 'The best service, annually.',
            currency_code: 'USD',
            price_string: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial'
          },
          packageType: 'ANNUAL',
          identifier: '$rc_annual'
        },
        {
          offeringIdentifier: 'default',
          product: {
            intro_price_period_number_of_units: 16,
            intro_price_period_unit: 'DAY',
            intro_price_cycles: 1,
            intro_price_period: 'P2W2D',
            intro_price_string: '$0.00',
            intro_price: 0,
            description: 'The best service, annually.',
            currency_code: 'USD',
            price_string: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial'
          },
          packageType: 'SIX_MONTH',
          identifier: '$rc_six_month'
        },
        {
          offeringIdentifier: 'default',
          product: {
            intro_price_period_number_of_units: 16,
            intro_price_period_unit: 'DAY',
            intro_price_cycles: 1,
            intro_price_period: 'P2W2D',
            intro_price_string: '$0.00',
            intro_price: 0,
            description: 'The best service, annually.',
            currency_code: 'USD',
            price_string: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial'
          },
          packageType: 'THREE_MONTH',
          identifier: '$rc_three_month'
        },
        {
          offeringIdentifier: 'default',
          product: {
            intro_price_period_number_of_units: 16,
            intro_price_period_unit: 'DAY',
            intro_price_cycles: 1,
            intro_price_period: 'P2W2D',
            intro_price_string: '$0.00',
            intro_price: 0,
            description: 'The best service, annually.',
            currency_code: 'USD',
            price_string: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial'
          },
          packageType: 'TWO_MONTH',
          identifier: '$rc_two_month'
        },
        {
          offeringIdentifier: 'default',
          product: {
            intro_price_period_number_of_units: 7,
            intro_price_period_unit: 'DAY',
            intro_price_cycles: 3,
            intro_price_period: 'P1W',
            intro_price_string: '$4.99',
            intro_price: 4.99,
            description: 'Product with intro price',
            currency_code: 'USD',
            price_string: '$9.99',
            price: 9.99,
            title: 'Introductory Price (PurchasesSample)',
            identifier: 'introductory_price'
          },
          packageType: 'WEEKLY',
          identifier: '$rc_weekly'
        },
        {
          offeringIdentifier: 'default',
          product: {
            intro_price_period_number_of_units: null,
            intro_price_period_unit: null,
            intro_price_cycles: null,
            intro_price_period: null,
            intro_price_string: null,
            intro_price: null,
            description: 'you can eat it many times',
            currency_code: 'USD',
            price_string: '$4.99',
            price: 4.99,
            title: 'Consumable (PurchasesSample)',
            identifier: 'consumable'
          },
          packageType: 'LIFETIME',
          identifier: '$rc_lifetime'
        },
        {
          offeringIdentifier: 'default',
          product: {
            intro_price_period_number_of_units: 16,
            intro_price_period_unit: 'DAY',
            intro_price_cycles: 1,
            intro_price_period: 'P2W2D',
            intro_price_string: '$0.00',
            intro_price: 0,
            description: 'The best service, annually.',
            currency_code: 'USD',
            price_string: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial'
          },
          packageType: 'CUSTOM',
          identifier: 'Custom'
        }
      ],
      serverDescription: 'Default Offering',
      identifier: 'default'
    }
  }
};

global.productStub = {
  currency_code: "USD",
  intro_price: null,
  intro_price_string: null,
  intro_price_period: null,
  intro_price_cycles: null,
  intro_price_period_unit: null,
  intro_price_period_number_of_units: null,
  discounts: null,
  introPrice: null,
  price_string: "$0.99",
  price: 0.99,
  description: "The best service.",
  title: "One Month Free Trial",
  identifier: "onemonth_freetrial"
};

global.productsStub = [
  productStub
];

global.packagestub = {
  offeringIdentifier: "default",
  product: productStub,
  packageType: "MONTHLY",
  identifier: "$rc_monthly"
};

global.discountStub = {
  identifier: "promo_cat",
  price: 0.49000000953674316,
  priceString: "$0.49",
  cycles: 1,
  period: "P1M",
  periodUnit: "MONTH",
  periodNumberOfUnits: 1,
};

global.paymentDiscountStub = {
  identifier: "promo_cat",
  keyIdentifier: "keyID",
  nonce: "nonce",
  signature: "signature",
  timestamp: 123,
}

NativeModules.RNPurchases = {
  setupPurchases: jest.fn(),
  setAllowSharingStoreAccount: jest.fn(),
  addAttributionData: jest.fn(),
  getOfferings: jest.fn(),
  getProductInfo: jest.fn(),
  makePurchase: jest.fn(),
  restoreTransactions: jest.fn(),
  getAppUserID: jest.fn(),
  createAlias: jest.fn(),
  identify: jest.fn(),
  setDebugLogsEnabled: jest.fn(),
  getPurchaserInfo: jest.fn(),
  logIn: jest.fn(),
  logOut: jest.fn(),
  reset: jest.fn(),
  syncPurchases: jest.fn(),
  setFinishTransactions: jest.fn(),
  purchaseProduct: jest.fn(),
  purchasePackage: jest.fn(),
  isAnonymous: jest.fn(),
  makeDeferredPurchase: jest.fn(),
  checkTrialOrIntroductoryPriceEligibility: jest.fn(),
  purchaseDiscountedPackage: jest.fn(),
  purchaseDiscountedProduct: jest.fn(),
  getPaymentDiscount: jest.fn(),
  invalidatePurchaserInfoCache: jest.fn(),
  setAttributes: jest.fn(),
  setEmail: jest.fn(),
  setPhoneNumber: jest.fn(),
  setDisplayName: jest.fn(),
  setPushToken: jest.fn(),
  canMakePayments: jest.fn(),
  isConfigured: jest.fn()
};

jest.mock(
  'react-native/Libraries/EventEmitter/NativeEventEmitter',
 );
 