import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Purchases, {CustomerInfo} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

export default function PurchaseThroughPaywallScreen() {
  const [entitlements, setEntitlements] = useState<string>('none');

  useEffect(() => {
    const listener = Purchases.addCustomerInfoUpdateListener(
      (info: CustomerInfo) => {
        updateEntitlements(info);
      },
    );
    Purchases.getCustomerInfo().then(updateEntitlements);
    return () => {
      listener.remove();
    };
  }, []);

  const updateEntitlements = (info: CustomerInfo) => {
    const pro = info.entitlements.active['pro'];
    setEntitlements(pro ? 'pro' : 'none');
  };

  const presentPaywall = async () => {
    await RevenueCatUI.presentPaywall();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Entitlements: {entitlements}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={presentPaywall}
        accessibilityLabel="Present Paywall">
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
  button: {padding: 16, backgroundColor: '#007AFF', borderRadius: 8},
  buttonText: {color: 'white', fontSize: 16},
});
