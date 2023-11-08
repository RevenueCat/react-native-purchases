import { requireNativeComponent } from 'react-native';
import { NativeModules } from "react-native";
import React from 'react';

const RNPaywall = requireNativeComponent('RNPaywall');
const { RNPaywalls } = NativeModules;

export default class PaywallView extends React.Component {
    render() {
      return (
        // TODO: check iOS version to fail if < 15
        <RNPaywall
         {...this.props}
        />
      )
    }
}

export function presentPaywall() {
  // TODO: check iOS/Android version
  RNPaywalls.presentPaywall();
}

export function presentPaywallIfNeeded(requiredEntitlementIdentifier: String) {
  // TODO: check iOS/Android version
  RNPaywalls.presentPaywallIfNeeded(requiredEntitlementIdentifier);
}
