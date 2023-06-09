
export enum PACKAGE_TYPE {

    /**
     * A package that was defined with a custom identifier.
     */
    UNKNOWN = "UNKNOWN",

    /**
     * A package that was defined with a custom identifier.
     */
    CUSTOM = "CUSTOM",

    /**
     * A package configured with the predefined lifetime identifier.
     */
    LIFETIME = "LIFETIME",

    /**
     * A package configured with the predefined annual identifier.
     */
    ANNUAL = "ANNUAL",

    /**
     * A package configured with the predefined six month identifier.
     */
    SIX_MONTH = "SIX_MONTH",

    /**
     * A package configured with the predefined three month identifier.
     */
    THREE_MONTH = "THREE_MONTH",

    /**
     * A package configured with the predefined two month identifier.
     */
    TWO_MONTH = "TWO_MONTH",

    /**
     * A package configured with the predefined monthly identifier.
     */
    MONTHLY = "MONTHLY",

    /**
     * A package configured with the predefined weekly identifier.
     */
    WEEKLY = "WEEKLY",
}

export enum INTRO_ELIGIBILITY_STATUS {
    /**
     * RevenueCat doesn't have enough information to determine eligibility.
     */
    INTRO_ELIGIBILITY_STATUS_UNKNOWN = 0,
    /**
     * The user is not eligible for a free trial or intro pricing for this product.
     */
    INTRO_ELIGIBILITY_STATUS_INELIGIBLE,
    /**
     * The user is eligible for a free trial or intro pricing for this product.
     */
    INTRO_ELIGIBILITY_STATUS_ELIGIBLE,
    /**
     * There is no free trial or intro pricing for this product.
     */
    INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS
}


export interface PurchasesStoreProduct {
    /**
     * Product Id.
     */
    readonly identifier: string;
    /**
     * Description of the product.
     */
    readonly description: string;
    /**
     * Title of the product.
     */
    readonly title: string;
    /**
     * Price of the product in the local currency.
     * Contains the price value of defaultOption for Google Play.
     */
    readonly price: number;
    /**
     * Formatted price of the item, including its currency sign.
     * Contains the formatted price value of defaultOption for Google Play.
     */
    readonly priceString: string;
    /**
     * Currency code for price and original price.
     * Contains the currency code value of defaultOption for Google Play.
     */
    readonly currencyCode: string;
    /**
     * Introductory price.
     */
    readonly introPrice: PurchasesIntroPrice | null;
    /**
     * Collection of discount offers for a product. Null for Android.
     */
    readonly discounts: PurchasesStoreProductDiscount[] | null;
    /**
     * Product category.
     */
    readonly productCategory: PRODUCT_CATEGORY | null;
    /**
     * Subscription period, specified in ISO 8601 format. For example,
     * P1W equates to one week, P1M equates to one month,
     * P3M equates to three months, P6M equates to six months,
     * and P1Y equates to one year.
     * Note: Not available for Amazon.
     */
    readonly subscriptionPeriod: string | null;
    /**
     * Default subscription option for a product. Google Play only.
     */
    readonly defaultOption: SubscriptionOption | null;
    /**
     * Collection of subscription options for a product. Google Play only.
     */
    readonly subscriptionOptions: SubscriptionOption[] | null;
    /**
     * Offering identifier the store product was presented from.
     * Null if not using offerings or if fetched directly from store via getProducts.
     */
    readonly presentedOfferingIdentifier: string | null;
}

export enum PRODUCT_CATEGORY {
    /**
     * A type of product for non-subscription.
     */
    NON_SUBSCRIPTION = "NON_SUBSCRIPTION",
  
    /**
     * A type of product for subscriptions.
     */
    SUBSCRIPTION = "SUBSCRIPTION",

    /**
     * A type of product for unknowns.
     */
    UNKNOWN = "UNKNOWN",
  }

export interface PurchasesStoreProductDiscount {
    /**
     * Identifier of the discount.
     */
    readonly identifier: string;
    /**
     * Price in the local currency.
     */
    readonly price: number;
    /**
     * Formatted price, including its currency sign, such as €3.99.
     */
    readonly priceString: string;
    /**
     * Number of subscription billing periods for which the user will be given the discount, such as 3.
     */
    readonly cycles: number;
    /**
     * Billing period of the discount, specified in ISO 8601 format.
     */
    readonly period: string;
    /**
     * Unit for the billing period of the discount, can be DAY, WEEK, MONTH or YEAR.
     */
    readonly periodUnit: string;
    /**
     * Number of units for the billing period of the discount.
     */
    readonly periodNumberOfUnits: number;
}

export interface PurchasesIntroPrice {
    /**
     * Price in the local currency.
     */
    readonly price: number;
    /**
     * Formatted price, including its currency sign, such as €3.99.
     */
    readonly priceString: string;
    /**
     * Number of subscription billing periods for which the user will be given the discount, such as 3.
     */
    readonly cycles: number;
    /**
     * Billing period of the discount, specified in ISO 8601 format.
     */
    readonly period: string;
    /**
     * Unit for the billing period of the discount, can be DAY, WEEK, MONTH or YEAR.
     */
    readonly periodUnit: string;
    /**
     * Number of units for the billing period of the discount.
     */
    readonly periodNumberOfUnits: number;
}

/**
 * Contains information about the product available for the user to purchase.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesPackage {
    /**
     * Unique identifier for this package. Can be one a predefined package type or a custom one.
     */
    readonly identifier: string;
    /**
     * Package type for the product. Will be one of [PACKAGE_TYPE].
     */
    readonly packageType: PACKAGE_TYPE;
    /**
     * Product assigned to this package.
     */
    readonly product: PurchasesStoreProduct;
    /**
     * Offering this package belongs to.
     */
    readonly offeringIdentifier: string;
}

/**
 * An offering is a collection of Packages (`PurchasesPackage`) available for the user to purchase.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesOffering {
    /**
     * Unique identifier defined in RevenueCat dashboard.
     */
    readonly identifier: string;
    /**
     * Offering description defined in RevenueCat dashboard.
     */
    readonly serverDescription: string;
    /**
     * Offering metadata defined in RevenueCat dashboard.
     */
    readonly metadata: Map<string, any>;
    /**
     * Array of `Package` objects available for purchase.
     */
    readonly availablePackages: PurchasesPackage[];
    /**
     * Lifetime package type configured in the RevenueCat dashboard, if available.
     */
    readonly lifetime: PurchasesPackage | null;
    /**
     * Annual package type configured in the RevenueCat dashboard, if available.
     */
    readonly annual: PurchasesPackage | null;
    /**
     * Six month package type configured in the RevenueCat dashboard, if available.
     */
    readonly sixMonth: PurchasesPackage | null;
    /**
     * Three month package type configured in the RevenueCat dashboard, if available.
     */
    readonly threeMonth: PurchasesPackage | null;
    /**
     * Two month package type configured in the RevenueCat dashboard, if available.
     */
    readonly twoMonth: PurchasesPackage | null;
    /**
     * Monthly package type configured in the RevenueCat dashboard, if available.
     */
    readonly monthly: PurchasesPackage | null;
    /**
     * Weekly package type configured in the RevenueCat dashboard, if available.
     */
    readonly weekly: PurchasesPackage | null;
}

/**
 * Contains all the offerings configured in RevenueCat dashboard.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesOfferings {
    /**
     * Map of all Offerings [PurchasesOffering] objects keyed by their identifier.
     */
    readonly all: { [key: string]: PurchasesOffering };
    /**
     * Current offering configured in the RevenueCat dashboard.
     */
    readonly current: PurchasesOffering | null;
}

/**
 * Holds the information used when upgrading from another sku. For Android use only.
 * @deprecated, use GoogleProductChangeInfo
 */
export interface UpgradeInfo {
    /**
     * The oldSKU to upgrade from.
     */
    readonly oldSKU: string;
    /**
     * The [PRORATION_MODE] to use when upgrading the given oldSKU.
     */
    readonly prorationMode?: PRORATION_MODE;
}

/**
 * Holds the information used when upgrading from another sku. For Android use only.
 */
export interface GoogleProductChangeInfo {
    /**
     * The old product identifier to upgrade from.
     */
    readonly oldProductIdentifier: string;
    /**
     * The [PRORATION_MODE] to use when upgrading the given oldSKU.
     */
    readonly prorationMode?: PRORATION_MODE;
}

/**
 * Holds the introductory price status
 */
export interface IntroEligibility {
    /**
     * The introductory price eligibility status
     */
    readonly status: INTRO_ELIGIBILITY_STATUS;
    /**
     * Description of the status
     */
    readonly description: string;
}

export interface PurchasesPromotionalOffer {
    readonly identifier: string;
    readonly keyIdentifier: string;
    readonly nonce: string;
    readonly signature: string;
    readonly timestamp: number;
}

export enum PRORATION_MODE {
    UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY = 0,

    /**
     * Replacement takes effect immediately, and the remaining time will be
     * prorated and credited to the user. This is the current default behavior.
     */
    IMMEDIATE_WITH_TIME_PRORATION = 1,

    /**
     * Replacement takes effect immediately, and the billing cycle remains the
     * same. The price for the remaining period will be charged. This option is
     * only available for subscription upgrade.
     */
    IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,

    /**
     * Replacement takes effect immediately, and the new price will be charged on
     * next recurrence time. The billing cycle stays the same.
     */
    IMMEDIATE_WITHOUT_PRORATION = 3,

    /**
     * Replacement takes effect when the old plan expires, and the new price will
     * be charged at the same time.
     */
    DEFERRED = 4,
     
    /**
     * Replacement takes effect immediately, and the user is charged full price 
     * of new plan and is given a full billing cycle of subscription, 
     * plus remaining prorated time from the old plan.
     */
    IMMEDIATE_AND_CHARGE_FULL_PRICE = 5,
}

/**
 * Contains all details associated with a SubscriptionOption
 * Used only for Google
 */
export interface SubscriptionOption {
    /**
     * Identifier of the subscription option
     * If this SubscriptionOption represents a base plan, this will be the basePlanId.
     * If it represents an offer, it will be {basePlanId}:{offerId}
     */
    readonly id: string;

    /**
     * Identifier of the StoreProduct associated with this SubscriptionOption
     * This will be {subId}:{basePlanId}
     */
    readonly storeProductId: string;

    /**
     * Identifer of the subscription associated with this SubscriptionOption
     * This will be {subId}
     */
    readonly productId: string;

    /**
     * Pricing phases defining a user's payment plan for the product over time.
     */
    readonly pricingPhases: PricingPhase[];

    /**
     * Tags defined on the base plan or offer. Empty for Amazon.
     */
    readonly tags: string[];

    /**
     * True if this SubscriptionOption represents a subscription base plan (rather than an offer).
     */
    readonly isBasePlan: boolean;

    /**
     * The subscription period of fullPricePhase (after free and intro trials).
     */
    readonly billingPeriod: Period | null;

    /**
     * The full price PricingPhase of the subscription.
     * Looks for the last price phase of the SubscriptionOption.
     */
    readonly fullPricePhase: PricingPhase | null;

    /**
     * The free trial PricingPhase of the subscription.
     * Looks for the first pricing phase of the SubscriptionOption where amountMicros is 0.
     * There can be a freeTrialPhase and an introductoryPhase in the same SubscriptionOption.
     */
    readonly freePhase: PricingPhase | null;

    /**
     * The intro trial PricingPhase of the subscription.
     * Looks for the first pricing phase of the SubscriptionOption where amountMicros is greater than 0.
     * There can be a freeTrialPhase and an introductoryPhase in the same SubscriptionOption.
     */
    readonly introPhase: PricingPhase | null;

    /**
     * Offering identifier the subscription option was presented from
     */
    readonly presentedOfferingIdentifier: string | null;
}

/**
 * Contains all the details associated with a PricingPhase
 */
export interface PricingPhase {
    /**
     * Billing period for which the PricingPhase applies
     */
    readonly billingPeriod: Period;

    /**
     * Recurrence mode of the PricingPhase
     */
    readonly recurrenceMode: RECURRENCE_MODE | null;

    /**
     * Number of cycles for which the pricing phase applies.
     * Null for infiniteRecurring or finiteRecurring recurrence modes.
     */
    readonly billingCycleCount: number | null;

    /**
     * Price of the PricingPhase
     */
    readonly price: Price;

    /**
     * Indicates how the pricing phase is charged for finiteRecurring pricing phases
     */
    readonly offerPaymentMode: OFFER_PAYMENT_MODE | null;
}

/**
 * Recurrence mode for a pricing phase
 */
export enum RECURRENCE_MODE {
    /**
     * Pricing phase repeats infinitely until cancellation
     */
    INFINITE_RECURRING = 1,
    /**
     * Pricing phase repeats for a fixed number of billing periods
     */
    FINITE_RECURRING = 2,
    /**
     * Pricing phase does not repeat
     */
    NON_RECURRING = 3,
}

/**
 * Payment mode for offer pricing phases. Google Play only.
 */
export enum OFFER_PAYMENT_MODE {
    /**
     * Subscribers don't pay until the specified period ends
     */
    FREE_TRIAL = "FREE_TRIAL",
    /**
     * Subscribers pay up front for a specified period
     */
    SINGLE_PAYMENT = "SINGLE_PAYMENT",
    /**
     * Subscribers pay a discounted amount for a specified number of periods
     */
    DISCOUNTED_RECURRING_PAYMENT = "DISCOUNTED_RECURRING_PAYMENT",
}

/**
 * Contains all the details associated with a Price
 */
export interface Price {
    /**
     * Formatted price of the item, including its currency sign. For example $3.00
     */
    readonly formatted: string;

    /**
     * Price in micro-units, where 1,000,000 micro-units equal one unit of the currency.
     * 
     * For example, if price is "€7.99", price_amount_micros is 7,990,000. This value represents
     * the localized, rounded price for a particular currency.
     */
    readonly amountMicros: number;

    /**
     * Returns ISO 4217 currency code for price and original price.
     * 
     * For example, if price is specified in British pounds sterling, price_currency_code is "GBP".
     * If currency code cannot be determined, currency symbol is returned.
     */
    readonly currencyCode: string;
}

/**
 * Contains all the details associated with a Period
 */
export interface Period {
    /**
     * The number of period units: day, week, month, year, unknown
     */
    readonly unit: PERIOD_UNIT;

    /**
     * The increment of time that a subscription period is specified in
     */
    readonly value: number;

    /**
     * Specified in ISO 8601 format. For example, P1W equates to one week,
     * P1M equates to one month, P3M equates to three months, P6M equates to six months,
     * and P1Y equates to one year
     */
    readonly iso8601: string;
}

/**
 * Time duration unit for Period.
 */
export enum PERIOD_UNIT {
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR",
    UNKNOWN = "UNKNOWN",
}