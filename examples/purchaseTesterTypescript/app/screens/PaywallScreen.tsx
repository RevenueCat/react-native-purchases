import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';
import {
  CustomerInfo,
  PurchasesError, PurchasesPackage,
  PurchasesStoreTransaction
} from "@revenuecat/purchases-typescript-internal";

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const PaywallScreen: React.FC<Props> = ({route, navigation}: Props) => {
  // Example handlers for the events
  const onPurchaseCompleted = ({customerInfo, storeTransaction}: {
    customerInfo: CustomerInfo, storeTransaction: PurchasesStoreTransaction
  }) => {
    console.log('Purchase completed:', customerInfo, storeTransaction);
  };

  const onPurchaseStarted = ({packageBeingPurchased}: { packageBeingPurchased: PurchasesPackage }) => {
    console.log('Purchase started:', packageBeingPurchased);
  };

  const onPurchaseError = ({error}: { error: PurchasesError }) => {
    console.error('Purchase error:', error);
  };

  const onPurchaseCancelled = () => {
    console.log('Purchase was cancelled');
  };

  const onRestoreStarted = () => {
    console.log('Restore started');
  };

  const onRestoreCompleted = ({customerInfo}: { customerInfo: CustomerInfo }) => {
    console.log('Restore completed:', customerInfo);
  };

  const onRestoreError = ({error}: { error: PurchasesError }) => {
    console.error('Restore error:', error);
  };

  const onDismiss = () => {
    console.log('Dismissed');
    navigation.pop();
  };

  const onPurchasePackageInitiated = ({packageBeingPurchased, resume}: {
    packageBeingPurchased: PurchasesPackage, resume: (shouldResume: boolean) => void
  }) => {
    console.log('Purchase package initiated:', packageBeingPurchased.identifier);
    resume(true);
  };

  const styles = StyleSheet.create({
    flex1: {
      flex: 1,
    },
  });

  return (
    <View style={styles.flex1}>
      <RevenueCatUI.Paywall
        options={{
          offering: route.params.offering,
          fontFamily: route.params.fontFamily,
          displayCloseButton: true,
        }}
        onPurchaseStarted={onPurchaseStarted}
        onPurchaseCompleted={onPurchaseCompleted}
        onPurchaseError={onPurchaseError}
        onPurchaseCancelled={onPurchaseCancelled}
        onRestoreStarted={onRestoreStarted}
        onRestoreCompleted={onRestoreCompleted}
        onRestoreError={onRestoreError}
        onDismiss={onDismiss}
        onPurchasePackageInitiated={onPurchasePackageInitiated}
      />
    </View>
  );
};

export default PaywallScreen;
