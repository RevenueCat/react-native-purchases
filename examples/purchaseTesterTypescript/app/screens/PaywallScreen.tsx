import React from 'react';
import {Paywall} from 'react-native-purchases-ui';

import {StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const PaywallScreen: React.FC<Props> = () => {
  const styles = StyleSheet.create({
    flex1: {
      flex: 1,
    },
  });

  return (
    <View style={styles.flex1}>
      <Paywall/>
    </View>
  );
};

export default PaywallScreen;
