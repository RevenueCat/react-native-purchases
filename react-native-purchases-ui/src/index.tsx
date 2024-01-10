import { NativeModules, Platform, requireNativeComponent, UIManager } from "react-native";
import { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";

export { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";

const LINKING_ERROR =
  `The package 'react-native-purchases-view' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNPaywalls = NativeModules.RNPaywalls;
export default class RevenueCatUI {

  public static presentPaywall(): Promise<PAYWALL_RESULT> {
    // TODO: check iOS/Android version
    return RNPaywalls.presentPaywall();
  }

  public static presentPaywallIfNeeded(requiredEntitlementIdentifier: string): Promise<PAYWALL_RESULT> {
    // TODO: check iOS/Android version
    return RNPaywalls.presentPaywallIfNeeded(requiredEntitlementIdentifier);
  }

  public static Paywall =
    UIManager.getViewManagerConfig('Paywall') != null
      ? requireNativeComponent('Paywall')
      : () => {
        throw new Error(LINKING_ERROR);
      };
}
