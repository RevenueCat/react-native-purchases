import RNPaywalls from "../dist/react-native-purchases-ui/src";

async function checkpresentPaywall() {
  await RNPaywalls.presentPaywall();
}

async function checkpresentPaywallIfNeeded() {
  await RNPaywalls.presentPaywallIfNeeded("entitlement");
}
