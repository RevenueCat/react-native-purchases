import React from 'react';
import { RNPaywall } from 'react-native-purchases-ui';

import {
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import RootStackParamList from "../RootStackParamList";

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const PaywallScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <RNPaywall style={{width: '100%', height: 800}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0
  },
});

export default PaywallScreen;
