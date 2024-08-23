import {
  INTRO_ELIGIBILITY_STATUS,
  IntroEligibility,
  PACKAGE_TYPE,
  PRORATION_MODE,
  PurchasesStoreProductDiscount,
  PurchasesIntroPrice,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesPromotionalOffer,
  PurchasesStoreProduct,
  UpgradeInfo,
  SubscriptionOption,
  PricingPhase,
  Price,
  Period,
  OFFER_PAYMENT_MODE,
  PERIOD_UNIT,
  PRODUCT_CATEGORY,
  RECURRENCE_MODE,
  PresentedOfferingContext,
  PresentedOfferingTargetingContext,
  InstallmentsInfo,
} from "../dist";

function checkProduct(product: PurchasesStoreProduct) {
  const identifier: string = product.identifier;
  const description: string = product.description;
  const title: string = product.title;
  const price: number = product.price;
  const priceString: string = product.priceString;
  const pricePerWeek: number = product.pricePerWeek;
  const pricePerMonth: number = product.pricePerMonth;
  const pricePerYear: number = product.pricePerYear;
  const pricePerWeekString: string = product.pricePerWeekString;
  const pricePerMonthString: string = product.pricePerMonthString;
  const pricePerYearString: string = product.pricePerYearString;
  const currencyCode: string = product.currencyCode;
  const introPrice: PurchasesIntroPrice | null = product.introPrice;
  const discounts: PurchasesStoreProductDiscount[] | null = product.discounts;
  const subscriptionPeriod: string | null = product.subscriptionPeriod;
  const productCategory: PRODUCT_CATEGORY | null = product.productCategory;
  const defaultOption: SubscriptionOption | null = product.defaultOption;
  const subscriptionOptions: SubscriptionOption[] | null =
    product.subscriptionOptions;
  const presentedOfferingIdentifier: string | null =
    product.presentedOfferingIdentifier;
  const presentedOfferingContext: PresentedOfferingContext | null =
    product.presentedOfferingContext;
}

function checkDiscount(discount: PurchasesStoreProductDiscount) {
  const identifier: string = discount.identifier;
  const price: number = discount.price;
  const priceString: string = discount.priceString;
  const cycles: number = discount.cycles;
  const period: string = discount.period;
  const periodUnit: string = discount.periodUnit;
  const periodNumberOfUnits: number = discount.periodNumberOfUnits;
}

function checkIntroPrice(introPrice: PurchasesIntroPrice) {
  const price: number = introPrice.price;
  const priceString: string = introPrice.priceString;
  const cycles: number = introPrice.cycles;
  const period: string = introPrice.period;
  const periodUnit: string = introPrice.periodUnit;
  const periodNumberOfUnits: number = introPrice.periodNumberOfUnits;
}

function checkPackage(pack: PurchasesPackage) {
  const identifier: string = pack.identifier;
  const packageType: PACKAGE_TYPE = pack.packageType;
  const product: PurchasesStoreProduct = pack.product;
  const offeringIdentifier: string = pack.offeringIdentifier;
  const presentedOfferingContext: PresentedOfferingContext =
    pack.presentedOfferingContext;
}

function checkOffering(offering: PurchasesOffering) {
  const identifier: string = offering.identifier;
  const serverDescription: string = offering.serverDescription;
  const metadata: { [key: string]: unknown } = offering.metadata;
  const availablePackages: PurchasesPackage[] = offering.availablePackages;
  const lifetime: PurchasesPackage | null = offering.lifetime;
  const annual: PurchasesPackage | null = offering.annual;
  const sixMonth: PurchasesPackage | null = offering.sixMonth;
  const threeMonth: PurchasesPackage | null = offering.threeMonth;
  const twoMonth: PurchasesPackage | null = offering.twoMonth;
  const monthly: PurchasesPackage | null = offering.monthly;
  const weekly: PurchasesPackage | null = offering.weekly;
}

function checkOfferings(offerings: PurchasesOfferings) {
  const offering1: { [p: string]: PurchasesOffering } = offerings.all;
  const offering2: PurchasesOffering | null = offerings.current;
}

function checkUpgradeInfo(info: UpgradeInfo) {
  const oldSKU: string = info.oldSKU;
  const prorationMode: PRORATION_MODE | undefined = info.prorationMode;
}

function checkIntroEligibility(eligibility: IntroEligibility) {
  const status: INTRO_ELIGIBILITY_STATUS = eligibility.status;
  const description: string = eligibility.description;
}

function checkPromotionalOffer(discount: PurchasesPromotionalOffer) {
  const identifier: string = discount.identifier;
  const keyIdentifier: string = discount.keyIdentifier;
  const nonce: string = discount.nonce;
  const signature: string = discount.signature;
  const timestamp: number = discount.timestamp;
}

function checkSubscriptionOption(option: SubscriptionOption) {
  const id: string = option.id;
  const storeProductId: string = option.storeProductId;
  const productId: string = option.productId;
  const pricingPhase: PricingPhase[] = option.pricingPhases;
  const tags: string[] = option.tags;
  const isBasePlan: boolean = option.isBasePlan;
  const billingPeriod: Period | null = option.billingPeriod;
  const isPrepaid: boolean = option.isPrepaid;
  const fullPricePhase: PricingPhase | null = option.fullPricePhase;
  const freePhase: PricingPhase | null = option.freePhase;
  const introPhase: PricingPhase | null = option.introPhase;
  const presentedOfferingIdentifier: string | null =
    option.presentedOfferingIdentifier;
  const presentedOfferingContext: PresentedOfferingContext | null =
    option.presentedOfferingContext;
  const installmentsInfo: InstallmentsInfo | null =
    option.installmentsInfo;
}

function checkInstallmentsInfo(installmentsInfo: InstallmentsInfo) {
  const commitmentPaymentsCount: number =
    installmentsInfo.commitmentPaymentsCount;
  const renewalCommitmentPaymentsCount: number =
    installmentsInfo.renewalCommitmentPaymentsCount;
}

function checkPricingPhase(pricePhase: PricingPhase) {
  const billingPeriod: Period = pricePhase.billingPeriod;
  const recurrenceMode: RECURRENCE_MODE | null = pricePhase.recurrenceMode;
  const billingCycleCount: number | null = pricePhase.billingCycleCount;
  const price: Price = pricePhase.price;
  const offerPaymentMode: OFFER_PAYMENT_MODE | null =
    pricePhase.offerPaymentMode;
}

function checkPeriod(period: Period) {
  const unit: PERIOD_UNIT = period.unit;
  const value: number = period.value;
  const iso8601: string = period.iso8601;
}

function checkPrice(price: Price) {
  const formatted: string = price.formatted;
  const amountMicros: number = price.amountMicros;
  const currencyCode: string = price.currencyCode;
}

function checkRecurrenceMode(mode: RECURRENCE_MODE) {
  switch (mode) {
    case (RECURRENCE_MODE.INFINITE_RECURRING,
    RECURRENCE_MODE.FINITE_RECURRING,
    RECURRENCE_MODE.NON_RECURRING): {
      break;
    }
  }
}

function checkPeriodUnit(periodUnit: PERIOD_UNIT) {
  switch (periodUnit) {
    case (PERIOD_UNIT.DAY,
    PERIOD_UNIT.WEEK,
    PERIOD_UNIT.MONTH,
    PERIOD_UNIT.YEAR,
    PERIOD_UNIT.UNKNOWN): {
      break;
    }
  }
}

function checkOfferPaymentMode(offerPaymentMode: OFFER_PAYMENT_MODE) {
  switch (offerPaymentMode) {
    case (OFFER_PAYMENT_MODE.FREE_TRIAL,
    OFFER_PAYMENT_MODE.SINGLE_PAYMENT,
    OFFER_PAYMENT_MODE.DISCOUNTED_RECURRING_PAYMENT): {
      break;
    }
  }
}

function checkOfferProductCategory(productCategory: PRODUCT_CATEGORY) {
  switch (productCategory) {
    case (PRODUCT_CATEGORY.NON_SUBSCRIPTION,
    PRODUCT_CATEGORY.SUBSCRIPTION,
    PRODUCT_CATEGORY.UNKNOWN): {
      break;
    }
  }
}

function checkPresentedOfferingcontext(
  presentedOfferingContext: PresentedOfferingContext
) {
  const offeringIdentifier: string =
    presentedOfferingContext.offeringIdentifier;
  const placementIdentifier: string | null =
    presentedOfferingContext.placementIdentifier;
  const targetingContext: PresentedOfferingTargetingContext | null =
    presentedOfferingContext.targetingContext;
}

function checkPresentedOfferingTargetingContext(
  targetingContext: PresentedOfferingTargetingContext
) {
  const revision: number = targetingContext.revision;
  const ruleId: string = targetingContext.ruleId;
}
