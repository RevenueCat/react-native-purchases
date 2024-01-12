import RevenueCatUI, { PAYWALL_RESULT } from "../react-native-purchases-ui";

async function checkPresentPaywall() {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
}

async function checkPresentPaywallIfNeeded() {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement"
  });
}
