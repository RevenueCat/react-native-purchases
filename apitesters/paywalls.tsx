import React from 'react';

import RevenueCatUI, {
  PAYWALL_RESULT,
  PresentPaywallIfNeededParams,
  PresentPaywallParams
} from "../react-native-purchases-ui";

async function checkPresentPaywall() {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({});
  paywallResult = await RevenueCatUI.presentPaywall({
    // offeringIdentifier: "offering",
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    // offeringIdentifier: "offering",
    displayCloseButton: false,
  });
}

async function checkPresentPaywallIfNeeded() {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement"
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    // offeringIdentifier: "offering",
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    // offeringIdentifier: "offering",
    displayCloseButton: false,
  });
}

function checkPresentPaywallParams(params: PresentPaywallIfNeededParams) {
  const requiredEntitlementIdentifier: string = params.requiredEntitlementIdentifier;
  // const offeringIdentifier: string | undefined = params.offeringIdentifier;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
}

function checkPresentPaywallIfNeededParams(params: PresentPaywallParams) {
  // const offeringIdentifier: string | undefined = params.offeringIdentifier;
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

