import { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";
import RevenueCatUI from "../react-native-purchases-ui";

async function checkPresentPaywall() {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
}

async function checkPresentPaywallIfNeeded() {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded("entitlement");
}
