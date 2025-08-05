import React from 'react';
import {Pressable, Text, Alert, StyleSheet} from 'react-native';
import Purchases from 'react-native-purchases';

const RestorePurchasesButton: React.FC = () => {
  const restorePurchases = async () => {
    try {
      await Purchases.restorePurchases();
    } catch (e: any) {
      Alert.alert('Error restoring purchases', e.message);
    }
  };

  return (
    <Pressable onPress={restorePurchases} style={styles.button}>
      <Text style={styles.text}>Restore Purchases</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 'auto',
  },
  text: {
    color: 'dodgerblue',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 18,
    paddingVertical: 16,
  },
});

export default RestorePurchasesButton;
