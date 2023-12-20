import { NativeModules } from "react-native";

const RNPaywalls = NativeModules.RNPaywalls;

export function presentPaywall() {
  // TODO: check iOS/Android version
  RNPaywalls.presentPaywall();
}

export function presentPaywallIfNeeded(requiredEntitlementIdentifier: String) {
  // TODO: check iOS/Android version
  RNPaywalls.presentPaywallIfNeeded(requiredEntitlementIdentifier);
}
