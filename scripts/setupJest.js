const {NativeModules} = require("react-native");

global.customerInfoStub = {
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
global.transactionStub = {
    productIdentifier: "com.revenuecat.purchases_hybrid_common.monthly_19.99_.1_week_intro",
    transactionIdentifier: "1",
    purchaseDate: "2024-01-29T18:43:21.000Z"
};

global.offeringsStub = {
  current: {
    weekly: {
      offeringIdentifier: 'default',
      product: {
        introPrice: null,
        description: 'Product with intro price',
        currencyCode: 'USD',
        priceString: '$9.99',
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
        introPrice: {
          periodNumberOfUnits: 16,
          periodUnit: 'DAY',
          cycles: 1,
          period: 'P2W2D',
          priceString: '$0.00',
          price: 0
        },
        description: 'The best service, annually.',
        currencyCode: 'USD',
        priceString: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial',
        subscriptionPeriod: "P1Y"
      },
      packageType: 'TWO_MONTH',
      identifier: '$rc_two_month'
    },
    threeMonth: {
      offeringIdentifier: 'default',
      product: {
        introPrice: {
          periodNumberOfUnits: 16,
          periodUnit: 'DAY',
          cycles: 1,
          period: 'P2W2D',
          priceString: '$0.00',
          price: 0
        },
        description: 'The best service, annually.',
        currencyCode: 'USD',
        priceString: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial',
        subscriptionPeriod: "P1Y"
      },
      packageType: 'THREE_MONTH',
      identifier: '$rc_three_month'
    },
    sixMonth: {
      offeringIdentifier: 'default',
      product: {
        introPrice: {
          periodNumberOfUnits: 16,
          periodUnit: 'DAY',
          cycles: 1,
          period: 'P2W2D',
          priceString: '$0.00',
          price: 0
        },
        description: 'The best service, annually.',
        currencyCode: 'USD',
        priceString: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial',
        subscriptionPeriod: "P1Y"
      },
      packageType: 'SIX_MONTH',
      identifier: '$rc_six_month'
    },
    annual: {
      offeringIdentifier: 'default',
      product: {
        introPrice: {
          periodNumberOfUnits: 16,
          periodUnit: 'DAY',
          cycles: 1,
          period: 'P2W2D',
          priceString: '$0.00',
          price: 0
        },
        description: 'The best service, annually.',
        currencyCode: 'USD',
        priceString: '$19.99',
        price: 19.99,
        title: 'Annual Free Trial (PurchasesSample)',
        identifier: 'annual_freetrial',
        subscriptionPeriod: "P1Y"
      },
      packageType: 'ANNUAL',
      identifier: '$rc_annual'
    },
    lifetime: {
      offeringIdentifier: 'default',
      product: {
        introPrice: null,
        description: 'you can eat it many times',
        currencyCode: 'USD',
        priceString: '$4.99',
        price: 4.99,
        title: 'Consumable (PurchasesSample)',
        identifier: 'consumable',
        subscriptionPeriod: null
      },
      packageType: 'LIFETIME',
      identifier: '$rc_lifetime'
    },
    availablePackages: [
      {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'ANNUAL',
        identifier: '$rc_annual'
      },
      {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'SIX_MONTH',
        identifier: '$rc_six_month'
      },
      {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'THREE_MONTH',
        identifier: '$rc_three_month'
      },
      {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'TWO_MONTH',
        identifier: '$rc_two_month'
      },
      {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 7,
            periodUnit: 'DAY',
            cycles: 3,
            period: 'P1W',
            priceString: '$4.99',
            price: 4.99
          },
          description: 'Product with intro price',
          currencyCode: 'USD',
          priceString: '$9.99',
          price: 9.99,
          title: 'Introductory Price (PurchasesSample)',
          identifier: 'introductory_price',
          subscriptionPeriod: "P1M"
        },
        packageType: 'WEEKLY',
        identifier: '$rc_weekly'
      },
      {
        offeringIdentifier: 'default',
        product: {
          introPrice: null,
          description: 'you can eat it many times',
          currencyCode: 'USD',
          priceString: '$4.99',
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
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'CUSTOM',
        identifier: 'Custom'
      }
    ],
    metadata: {
      "int": 5,
      "double": 5.5,
      "boolean": true,
      "string": "five",
      "array": ["five"],
      "dictionary": {
          "string": "five"
      }
    },
    serverDescription: 'Default Offering',
    identifier: 'default'
  },
  all: {
    test: {
      weekly: null,
      monthly: {
        offeringIdentifier: 'test',
        product: {
          introPrice: {
            periodNumberOfUnits: 7,
            periodUnit: 'DAY',
            cycles: 3,
            period: 'P1W',
            priceString: '$4.99',
            price: 4.99
          },
          description: 'Product with intro price',
          currencyCode: 'USD',
          priceString: '$9.99',
          price: 9.99,
          title: 'Introductory Price (PurchasesSample)',
          identifier: 'introductory_price',
          subscriptionPeriod: "P1M"
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
            introPrice: {
              periodNumberOfUnits: 7,
              periodUnit: 'DAY',
              cycles: 3,
              period: 'P1W',
              priceString: '$4.99',
              price: 4.99
            },
            description: 'Product with intro price',
            currencyCode: 'USD',
            priceString: '$9.99',
            price: 9.99,
            title: 'Introductory Price (PurchasesSample)',
            identifier: 'introductory_price',
            subscriptionPeriod: "P1M"
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
          introPrice: {
            periodNumberOfUnits: 7,
            periodUnit: 'DAY',
            cycles: 3,
            period: 'P1W',
            priceString: '$4.99',
            price: 4.99
          },
          description: 'Product with intro price',
          currencyCode: 'USD',
          priceString: '$9.99',
          price: 9.99,
          title: 'Introductory Price (PurchasesSample)',
          identifier: 'introductory_price',
          subscriptionPeriod: "P1M"
        },
        packageType: 'WEEKLY',
        identifier: '$rc_weekly'
      },
      monthly: null,
      twoMonth: {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'TWO_MONTH',
        identifier: '$rc_two_month'
      },
      threeMonth: {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'THREE_MONTH',
        identifier: '$rc_three_month'
      },
      sixMonth: {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'SIX_MONTH',
        identifier: '$rc_six_month'
      },
      annual: {
        offeringIdentifier: 'default',
        product: {
          introPrice: {
            periodNumberOfUnits: 16,
            periodUnit: 'DAY',
            cycles: 1,
            period: 'P2W2D',
            priceString: '$0.00',
            price: 0
          },
          description: 'The best service, annually.',
          currencyCode: 'USD',
          priceString: '$19.99',
          price: 19.99,
          title: 'Annual Free Trial (PurchasesSample)',
          identifier: 'annual_freetrial',
          subscriptionPeriod: "P1Y"
        },
        packageType: 'ANNUAL',
        identifier: '$rc_annual'
      },
      lifetime: {
        offeringIdentifier: 'default',
        product: {
          introPrice: null,
          description: 'you can eat it many times',
          currencyCode: 'USD',
          priceString: '$4.99',
          price: 4.99,
          title: 'Consumable (PurchasesSample)',
          identifier: 'consumable',
          subscriptionPeriod: null
        },
        packageType: 'LIFETIME',
        identifier: '$rc_lifetime'
      },
      availablePackages: [
        {
          offeringIdentifier: 'default',
          product: {
            introPrice: {
              periodNumberOfUnits: 16,
              periodUnit: 'DAY',
              cycles: 1,
              period: 'P2W2D',
              priceString: '$0.00',
              price: 0
            },
            description: 'The best service, annually.',
            currencyCode: 'USD',
            priceString: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial',
            subscriptionPeriod: "P1Y"
          },
          packageType: 'ANNUAL',
          identifier: '$rc_annual'
        },
        {
          offeringIdentifier: 'default',
          product: {
            introPrice: {
              periodNumberOfUnits: 16,
              periodUnit: 'DAY',
              cycles: 1,
              period: 'P2W2D',
              priceString: '$0.00',
              price: 0
            },
            description: 'The best service, annually.',
            currencyCode: 'USD',
            priceString: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial',
            subscriptionPeriod: "P1Y"
          },
          packageType: 'SIX_MONTH',
          identifier: '$rc_six_month'
        },
        {
          offeringIdentifier: 'default',
          product: {
            introPrice: {
              periodNumberOfUnits: 16,
              periodUnit: 'DAY',
              cycles: 1,
              period: 'P2W2D',
              priceString: '$0.00',
              price: 0
            },
            description: 'The best service, annually.',
            currencyCode: 'USD',
            priceString: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial',
            subscriptionPeriod: "P1Y"
          },
          packageType: 'THREE_MONTH',
          identifier: '$rc_three_month'
        },
        {
          offeringIdentifier: 'default',
          product: {
            introPrice: {
              periodNumberOfUnits: 16,
              periodUnit: 'DAY',
              cycles: 1,
              period: 'P2W2D',
              priceString: '$0.00',
              price: 0
            },
            description: 'The best service, annually.',
            currencyCode: 'USD',
            priceString: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial',
            subscriptionPeriod: "P1Y"
          },
          packageType: 'TWO_MONTH',
          identifier: '$rc_two_month'
        },
        {
          offeringIdentifier: 'default',
          product: {
            introPrice: {
              periodNumberOfUnits: 7,
              periodUnit: 'DAY',
              cycles: 3,
              period: 'P1W',
              priceString: '$4.99',
              price: 4.99
            },
            description: 'Product with intro price',
            currencyCode: 'USD',
            priceString: '$9.99',
            price: 9.99,
            title: 'Introductory Price (PurchasesSample)',
            identifier: 'introductory_price',
            subscriptionPeriod: "P1M"
          },
          packageType: 'WEEKLY',
          identifier: '$rc_weekly'
        },
        {
          offeringIdentifier: 'default',
          product: {
            introPrice: null,
            description: 'you can eat it many times',
            currencyCode: 'USD',
            priceString: '$4.99',
            price: 4.99,
            title: 'Consumable (PurchasesSample)',
            identifier: 'consumable',
            subscriptionPeriod: null
          },
          packageType: 'LIFETIME',
          identifier: '$rc_lifetime'
        },
        {
          offeringIdentifier: 'default',
          product: {
            introPrice: {
              periodNumberOfUnits: 16,
              periodUnit: 'DAY',
              cycles: 1,
              period: 'P2W2D',
              priceString: '$0.00',
              price: 0
            },
            description: 'The best service, annually.',
            currencyCode: 'USD',
            priceString: '$19.99',
            price: 19.99,
            title: 'Annual Free Trial (PurchasesSample)',
            identifier: 'annual_freetrial',
            subscriptionPeriod: "P1Y"
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

global.currentOfferingForPlacementStub = {
  offeringIdentifier: 'default',
  product: {
    introPrice: null,
    description: 'Product with intro price',
    currencyCode: 'USD',
    priceString: '$9.99',
    price: 9.99,
    title: 'Introductory Price (PurchasesSample)',
    identifier: 'introductory_price'
  },
  packageType: 'WEEKLY',
  identifier: '$rc_weekly'
}

global.productStub = {
  currencyCode: "USD",
  introPrice: null,
  discounts: null,
  priceString: "$0.99",
  price: 0.99,
  description: "The best service.",
  title: "One Month Free Trial",
  identifier: "onemonth_freetrial",
  productCategory: "SUBSCRIPTION",
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

global.promotionalOfferStub = {
  identifier: "promo_cat",
  keyIdentifier: "keyID",
  nonce: "nonce",
  signature: "signature",
  timestamp: 123,
};

global.entitlementInfoStub = {
  identifier: "entitlement_id",
  isActive: true,
  willRenew: true,
  periodType: "",
  latestPurchaseDate: "",
  originalPurchaseDate: "",
  expirationDate: "",
  store: "APP_STORE",
  productIdentifier: "product_id",
  isSandbox: false,
  unsubscribeDetectedAt: null,
  billingIssueDetectedAt: null
};

NativeModules.RNPurchases = {
  setupPurchases: jest.fn(),
  setAllowSharingStoreAccount: jest.fn(),
  addAttributionData: jest.fn(),
  getOfferings: jest.fn(),
  getCurrentOfferingForPlacement: jest.fn(),
  syncAttributesAndOfferingsIfNeeded: jest.fn(),
  getProductInfo: jest.fn(),
  makePurchase: jest.fn(),
  restorePurchases: jest.fn(),
  getAppUserID: jest.fn(),
  setDebugLogsEnabled: jest.fn(),
  setLogLevel: jest.fn(),
  setLogHandler: jest.fn(),
  getCustomerInfo: jest.fn(),
  logIn: jest.fn(),
  logOut: jest.fn(),
  syncPurchases: jest.fn(),
  syncAmazonPurchase: jest.fn(),
  syncObserverModeAmazonPurchase: jest.fn(),
  purchaseProduct: jest.fn(),
  purchasePackage: jest.fn(),
  purchaseSubscriptionOption: jest.fn(),
  isAnonymous: jest.fn(),
  makeDeferredPurchase: jest.fn(),
  checkTrialOrIntroductoryPriceEligibility: jest.fn(),
  purchaseDiscountedPackage: jest.fn(),
  purchaseDiscountedProduct: jest.fn(),
  getPromotionalOffer: jest.fn(),
  invalidateCustomerInfoCache: jest.fn(),
  setAttributes: jest.fn(),
  setEmail: jest.fn(),
  setPhoneNumber: jest.fn(),
  setDisplayName: jest.fn(),
  setPushToken: jest.fn(),
  setCleverTapID: jest.fn(),
  setMixpanelDistinctID: jest.fn(),
  setFirebaseAppInstanceID: jest.fn(),
  setTenjinAnalyticsInstallationID: jest.fn(),
  setKochavaDeviceID: jest.fn(),
  canMakePayments: jest.fn(),
  beginRefundRequestForActiveEntitlement: jest.fn(),
  beginRefundRequestForEntitlementId: jest.fn(),
  beginRefundRequestForProductId: jest.fn(),
  showInAppMessages: jest.fn(),
  isConfigured: jest.fn(),
  parseAsWebPurchaseRedemption: jest.fn(),
  redeemWebPurchase: jest.fn(),
  getVirtualCurrencies: jest.fn(),
  invalidateVirtualCurrenciesCache: jest.fn(),
  getCachedVirtualCurrencies: jest.fn()
};

jest.mock(
  'react-native/Libraries/EventEmitter/NativeEventEmitter',
 );
