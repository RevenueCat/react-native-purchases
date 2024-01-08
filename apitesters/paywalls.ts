import RNPaywalls from "../react-native-purchases-ui/";

async function checkpresentPaywall() {
  await RNPaywalls.presentPaywall();
}

async function checkpresentPaywallIfNeeded() {
  await RNPaywalls.presentPaywallIfNeeded("entitlement");
}
