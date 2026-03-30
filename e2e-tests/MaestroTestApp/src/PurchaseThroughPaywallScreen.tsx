import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Purchases, {CustomerInfo} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

export default function PurchaseThroughPaywallScreen() {
  const [entitlements, setEntitlements] = useState<string>('none');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onCustomerInfoUpdate = (info: CustomerInfo) => {
      updateEntitlements(info);
    };
    Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdate);
    Purchases.getCustomerInfo()
      .then(updateEntitlements)
      .catch(e => {
        const message = e instanceof Error ? e.message : String(e);
        console.error('Failed to get customer info:', message);
        setError(message);
      });
    return () => {
      Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdate);
    };
  }, []);

  const updateEntitlements = (info: CustomerInfo) => {
    const pro = info.entitlements.active['pro'];
    setEntitlements(pro ? 'pro' : 'none');
  };

  const presentPaywall = async () => {
    setError(null);
    try {
      await RevenueCatUI.presentPaywall();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('Failed to present paywall:', message);
      setError(message);
    }
  };

  return (
    <View style={styles.container}>
      <Text testID="entitlements-label" style={styles.label}>
        Entitlements: {entitlements}
      </Text>
      {error && (
        <Text testID="error-message" style={styles.error}>
          Error: {error}
        </Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={presentPaywall}
        testID="present-paywall-button">
        <Text style={styles.buttonText}>Present Paywall</Text>
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
  label: {fontSize: 18, marginBottom: 20},
  error: {fontSize: 14, color: 'red', marginBottom: 20, textAlign: 'center'},
  button: {padding: 16, backgroundColor: '#007AFF', borderRadius: 8},
  buttonText: {color: 'white', fontSize: 16},
});
