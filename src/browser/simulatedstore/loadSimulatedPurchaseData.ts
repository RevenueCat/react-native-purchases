import {
  PurchasesPackage,
} from '@revenuecat/purchases-typescript-internal';
import { PurchasesCommon } from '@revenuecat/purchases-js-hybrid-mappings';
import { validateAndTransform, isPurchasesOfferings } from '../typeGuards';


export interface SimulatedPurchaseData {
  packageInfo: PurchasesPackage;
  offers: string[];
}

/**
 * Loads package data and formats offer information
 */
export async function loadSimulatedPurchaseData(packageIdentifier: string, offeringIdentifier: string): Promise<SimulatedPurchaseData> {
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

  // Build offers array
  const offers: string[] = [];
  if (targetPackage.product.introPrice) {
    offers.push(`Intro: ${targetPackage.product.introPrice.priceString} for ${targetPackage.product.introPrice.cycles} ${targetPackage.product.introPrice.periodUnit.toLowerCase()}(s)`);
  }
  if (targetPackage.product.discounts && targetPackage.product.discounts.length > 0) {
    targetPackage.product.discounts.forEach(discount => {
      offers.push(`Discount: ${discount.priceString} for ${discount.cycles} ${discount.periodUnit.toLowerCase()}(s)`);
    });
  }

  return { packageInfo: targetPackage, offers };
}