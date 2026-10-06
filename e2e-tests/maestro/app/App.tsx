import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Purchases from 'react-native-purchases';
import PurchaseThroughPaywallScreen from './PurchaseThroughPaywallScreen';

export type MaestroAppProps = {
  e2e_test_flow?: string;
};

type Props = MaestroAppProps & {
  apiKey: string;
};

export default function MaestroApp({apiKey, e2e_test_flow}: Props) {
  const [configured, setConfigured] = useState(false);
  const [showPurchase, setShowPurchase] = useState(
    e2e_test_flow === 'purchase_through_paywall',
  );

  useEffect(() => {
    // Build-only CI uses the same app without injecting a Test Store key.
    if (apiKey === 'MAESTRO_TESTS_REVENUECAT_API_KEY') {
      return;
    }
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({apiKey});
    setConfigured(true);
  }, [apiKey]);

  if (!configured) {
    return (
      <View style={styles.container}>
        <Text>Maestro Test Store API key is not configured.</Text>
      </View>
    );
  }

  if (showPurchase) {
    return <PurchaseThroughPaywallScreen />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPurchase(true)}
        testID="purchase-through-paywall-button">
        <Text style={styles.buttonText}>Purchase through paywall</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginVertical: 4,
  },
  buttonText: {color: 'white', fontSize: 16},
});
