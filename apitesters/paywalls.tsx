import React from 'react';

import RevenueCatUI, {
  PAYWALL_RESULT,
  PresentPaywallIfNeededParams,
  PresentPaywallParams
} from "../react-native-purchases-ui";
import { PurchasesOffering } from "@revenuecat/purchases-typescript-internal";

async function checkPresentPaywall(offering: PurchasesOffering) {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({});
  paywallResult = await RevenueCatUI.presentPaywall();
  paywallResult = await RevenueCatUI.presentPaywall({
    offering: offering,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering: offering,
    displayCloseButton: false,
  });
}

async function checkPresentPaywallIfNeeded(offering: PurchasesOffering) {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement"
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    offering: offering,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    offering: offering,
    displayCloseButton: false,
  });
}

function checkPresentPaywallParams(params: PresentPaywallIfNeededParams) {
  const requiredEntitlementIdentifier: string = params.requiredEntitlementIdentifier;
  const offeringIdentifier: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
}

function checkPresentPaywallIfNeededParams(params: PresentPaywallParams) {
  const offeringIdentifier: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
}

const PaywallScreen = () => {
  return (
    <RevenueCatUI.Paywall style={{marginBottom: 10}}/>
  );
};

const FooterPaywallScreen = () => {
  return (
    <RevenueCatUI.PaywallFooterContainerView>
    </RevenueCatUI.PaywallFooterContainerView>
  );
};

