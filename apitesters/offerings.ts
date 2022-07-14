import {
  INTRO_ELIGIBILITY_STATUS,
  IntroEligibility,
  PACKAGE_TYPE, PRORATION_MODE,
  PurchasesStoreProductDiscount,
  PurchasesIntroPrice,
  PurchasesOffering, PurchasesOfferings,
  PurchasesPackage, PurchasesPromotionalOffer,
  PurchasesStoreProduct, UpgradeInfo
} from "../dist";

function checkProduct(product: PurchasesStoreProduct) {
  const identifier: string = product.identifier;
  const description: string = product.description;
  const title: string = product.title;
  const price: number = product.price;
  const priceString: string = product.price_string;
  const currencyCode: string = product.currency_code;
  const introPrice: PurchasesIntroPrice | null = product.introPrice;
  const discounts: PurchasesStoreProductDiscount[] | null = product.discounts;
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
}

function checkOffering(offering: PurchasesOffering) {
  const identifier: string = offering.identifier;
  const serverDescription: string = offering.serverDescription;
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
