import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';
import { requireNativeComponent, View, StyleSheet, NativeSyntheticEvent } from 'react-native';

const CustomerCenterView = requireNativeComponent('CustomerCenterView');

const CustomerCenterModal: React.FC = () => {
  return (
    <View style={styles.container}>
      <CustomerCenterView style={styles.customerCenter} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerCenter: {
    width: '100%',
    height: '100%',
  },
});

export default CustomerCenterModal;
