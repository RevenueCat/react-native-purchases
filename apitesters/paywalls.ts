import RNPaywalls from "../react-native-purchases-ui/";

async function checkpresentPaywall() {
  const paywallResult: RNPaywalls.PAYWALL_RESULT = await RNPaywalls.presentPaywall();
}

async function checkpresentPaywallIfNeeded() {
  const paywallResult: RNPaywalls.PAYWALL_RESULT = await RNPaywalls.presentPaywallIfNeeded("entitlement");
}
