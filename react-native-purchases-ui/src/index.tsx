import {
  NativeModules,
  Platform,
  requireNativeComponent,
  ScrollView,
  type StyleProp,
  UIManager,
  View,
  type ViewStyle,
} from "react-native";
import { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";
import React, { type ReactNode } from "react";

export { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";

const LINKING_ERROR =
  `The package 'react-native-purchases-view' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNPaywalls = NativeModules.RNPaywalls;

type PaywallViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const InternalPaywall =
  UIManager.getViewManagerConfig('Paywall') != null
    ? requireNativeComponent<PaywallViewProps>('Paywall')
    : () => {
      throw new Error(LINKING_ERROR);
    };

const InternalPaywallFooterView = UIManager.getViewManagerConfig('Paywall') != null
  ? requireNativeComponent<PaywallViewProps>('RCPaywallFooterView')
  : () => {
    throw new Error(LINKING_ERROR);
  };

export default class RevenueCatUI {

  /**
   * The result of presenting a paywall. This will be the last situation the user experienced before the paywall closed.
   * @readonly
   * @enum {string}
   */
  public static PAYWALL_RESULT = PAYWALL_RESULT;

  public static presentPaywall(): Promise<PAYWALL_RESULT> {
    // TODO: check iOS/Android version
    return RNPaywalls.presentPaywall();
  }

  public static presentPaywallIfNeeded(requiredEntitlementIdentifier: string): Promise<PAYWALL_RESULT> {
    // TODO: check iOS/Android version
    return RNPaywalls.presentPaywallIfNeeded(requiredEntitlementIdentifier);
  }

  public static Paywall: React.FC<PaywallViewProps> = (props) => (
    <InternalPaywall {...props} style={[{flex: 1}, props.style]}/>
  );

  public static PaywallFooterContainerView: React.FC<PaywallViewProps> = ({style, children}) => (
    <View style={[{flex: 1}, style]}>
      <ScrollView
        style={{backgroundColor: '#4b72f6'}}
        contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
      >
        {children}
      </ScrollView>
      <InternalPaywallFooterView style={{marginTop: -20}}/>
    </View>
  );
}
