import RNPaywalls from "../react-native-purchases-ui/";

async function checkPresentPaywall() {
  const paywallResult: RNPaywalls.PAYWALL_RESULT = await RNPaywalls.presentPaywall();
}

async function checkPresentPaywallIfNeeded() {
  const paywallResult: RNPaywalls.PAYWALL_RESULT = await RNPaywalls.presentPaywallIfNeeded("entitlement");
}
