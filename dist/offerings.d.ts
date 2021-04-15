export declare enum PACKAGE_TYPE {
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
    WEEKLY = "WEEKLY"
}
export declare enum INTRO_ELIGIBILITY_STATUS {
    /**
     * RevenueCat doesn't have enough information to determine eligibility.
     */
    INTRO_ELIGIBILITY_STATUS_UNKNOWN = 0,
    /**
     * The user is not eligible for a free trial or intro pricing for this product.
     */
    INTRO_ELIGIBILITY_STATUS_INELIGIBLE = 1,
    /**
     * The user is eligible for a free trial or intro pricing for this product.
     */
    INTRO_ELIGIBILITY_STATUS_ELIGIBLE = 2
}
export interface PurchasesProduct {
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
     */
    readonly price: number;
    /**
     * Formatted price of the item, including its currency sign.
     */
    readonly price_string: string;
    /**
     * Currency code for price and original price.
     */
    readonly currency_code: string;
    /**
     * @deprecated, use introPrice instead.
     *
     * Introductory price of a subscription in the local currency.
     */
    readonly intro_price: number | null;
    /**
     * @deprecated, use introPrice instead.
     *
     * Formatted introductory price of a subscription, including its currency sign, such as €3.99.
     */
    readonly intro_price_string: string | null;
    /**
     * @deprecated, use introPrice instead.
     *
     * Billing period of the introductory price, specified in ISO 8601 format.
     */
    readonly intro_price_period: string | null;
    /**
     * @deprecated, use introPrice instead.
     *
     * Number of subscription billing periods for which the user will be given the introductory price, such as 3.
     */
    readonly intro_price_cycles: number | null;
    /**
     * @deprecated, use introPrice instead.
     *
     * Unit for the billing period of the introductory price, can be DAY, WEEK, MONTH or YEAR.
     */
    readonly intro_price_period_unit: string | null;
    /**
     * @deprecated, use introPrice instead.
     *
     * Number of units for the billing period of the introductory price.
     */
    readonly intro_price_period_number_of_units: number | null;
    /**
     * Introductory price.
     */
    readonly introPrice: PurchasesIntroPrice | null;
    /**
     * Collection of discount offers for a product. Null for Android.
     */
    readonly discounts: PurchasesDiscount[] | null;
}
export interface PurchasesDiscount {
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
    readonly product: PurchasesProduct;
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
    readonly all: {
        [key: string]: PurchasesOffering;
    };
    /**
     * Current offering configured in the RevenueCat dashboard.
     */
    readonly current: PurchasesOffering | null;
}
/**
 * Holds the information used when upgrading from another sku. For Android use only.
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
export interface PurchasesPaymentDiscount {
    readonly identifier: string;
    readonly keyIdentifier: string;
    readonly nonce: string;
    readonly signature: string;
    readonly timestamp: number;
}
export declare enum PRORATION_MODE {
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
    DEFERRED = 4
}
