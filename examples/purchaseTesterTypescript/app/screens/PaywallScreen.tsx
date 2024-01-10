import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

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
      <RevenueCatUI.Paywall/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
});

export default PaywallScreen;