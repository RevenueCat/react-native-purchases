import RNPaywalls from "../react-native-purchases-ui/";
import { Text } from "react-native";
import React from 'react';

async function checkPresentPaywall() {
  await RNPaywalls.presentPaywall();
}

async function checkPresentPaywallIfNeeded() {
  await RNPaywalls.presentPaywallIfNeeded("entitlement");
}

const PaywallScreen = () => {
  return (
    <RNPaywalls.Paywall style={{ marginBottom: 10 }}/>
  );
};

const FooterPaywallScreen = () => {
  return (
      <RNPaywalls.PaywallFooterContainerView>
      </RNPaywalls.PaywallFooterContainerView>
  );
};

