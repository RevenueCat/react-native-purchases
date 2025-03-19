import React, { useState, useEffect } from 'react';
import RevenueCatUI from 'react-native-purchases-ui';
import { View, StyleSheet } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCenter'>;

const CustomerCenterScreen: React.FC<Props> = ({route, navigation}: Props) => {
    const onDismiss = () => {
      console.log('CustomerCenter dismissed');
      navigation.pop();
    };

    return (
    <View style={styles.container}>
        <RevenueCatUI.CustomerCenterView style={styles.customerCenter} onDismiss={onDismiss}/>
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

export default CustomerCenterScreen;
