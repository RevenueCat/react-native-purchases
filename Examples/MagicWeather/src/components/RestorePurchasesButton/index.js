/**
 * @file Restore Purchases Button.
 * @author Vadim Savin
 */

import React from 'react';
import { Pressable, Text, Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import styles from './styles';

const RestorePurchasesButton = () => {
  const restorePurchases = async () => {
    try {
      await Purchases.restoreTransactions();
    } catch (e) {
      Alert.alert('Error restoring purchases', e.message);
    }
  };

  return (
    <Pressable onPress={restorePurchases} style={styles.button}>
      <Text style={styles.text}>Restore Purchases</Text>
    </Pressable>
  );
};

export default RestorePurchasesButton;
