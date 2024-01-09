import {
  NativeModules,
  Platform,
  requireNativeComponent, ScrollView,
  type StyleProp,
  UIManager,
  View,
  type ViewStyle,
} from "react-native";
import React, { type ReactNode } from "react";

const LINKING_ERROR =
  `The package 'react-native-purchases-view' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNPaywalls = NativeModules.RNPaywalls;

export function presentPaywall() {
  // TODO: check iOS/Android version
  RNPaywalls.presentPaywall();
}

export function presentPaywallIfNeeded(requiredEntitlementIdentifier: String) {
  // TODO: check iOS/Android version
  RNPaywalls.presentPaywallIfNeeded(requiredEntitlementIdentifier);
}

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

export const Paywall: React.FC<PaywallViewProps> = (props) => (
  <InternalPaywall {...props} style={[{flex: 1}, props.style]}/>
);

const InternalPaywallFooterView = UIManager.getViewManagerConfig('Paywall') != null
  ? requireNativeComponent<PaywallViewProps>('RCPaywallFooterView')
  : () => {
    throw new Error(LINKING_ERROR);
  };

export const PaywallFooterContainerView: React.FC<PaywallViewProps> = ({style, children}) => (
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
