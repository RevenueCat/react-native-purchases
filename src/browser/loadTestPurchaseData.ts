import {
  PurchasesPackage,
} from '@revenuecat/purchases-typescript-internal';
import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';
import { validateAndTransform, isPurchasesOfferings } from './typeGuards';

/**
 * Common data for test purchases - used by both modal and alert
 */
export interface TestPurchaseData {
  packageInfo: PurchasesPackage;
  offers: string[];
}

/**
 * Loads package data and formats offer information
 */
export async function loadTestPurchaseData(packageIdentifier: string, offeringIdentifier: string): Promise<TestPurchaseData> {
  const offeringsResult = await PurchasesCommon.getInstance().getOfferings();
  const offerings = validateAndTransform(offeringsResult, isPurchasesOfferings, 'PurchasesOfferings');

  const targetOffering = offerings.all[offeringIdentifier];
  if (!targetOffering) {
    throw new Error(`Offering with identifier ${offeringIdentifier} not found`);
  }

  const targetPackage = targetOffering.availablePackages.find(
    (pkg: PurchasesPackage) => pkg.identifier === packageIdentifier
  );

  if (!targetPackage) {
    throw new Error(`Package with identifier ${packageIdentifier} not found in offering ${offeringIdentifier}`);
  }

  const packageInfo = targetPackage;

  // Build offers array
  const offers: string[] = [];
  if (packageInfo.product.introPrice) {
    offers.push(`Intro: ${packageInfo.product.introPrice.priceString} for ${packageInfo.product.introPrice.cycles} ${packageInfo.product.introPrice.periodUnit.toLowerCase()}(s)`);
  }
  if (packageInfo.product.discounts && packageInfo.product.discounts.length > 0) {
    packageInfo.product.discounts.forEach(discount => {
      offers.push(`Discount: ${discount.priceString} for ${discount.cycles} ${discount.periodUnit.toLowerCase()}(s)`);
    });
  }

  return { packageInfo, offers };
}