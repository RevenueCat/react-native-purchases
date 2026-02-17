import React from 'react';
import RevenueCatUI, {PURCHASE_LOGIC_RESULT} from 'react-native-purchases-ui';

import {Alert, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';
import {useCustomPurchaseLogic} from '../../App';
import {
  CustomerInfo,
  PurchasesError,
  PurchasesPackage,
  PurchasesStoreTransaction,
} from '@revenuecat/purchases-typescript-internal';
import Purchases from 'react-native-purchases';

type Props = NativeStackScreenProps<RootStackParamList, 'PurchaseLogicPaywall'>;

/**
 * Example screen demonstrating custom PurchaseLogic with paywalls.
 *
 * When `purchaseLogic` is provided, the paywall delegates purchase and restore
 * operations to your app instead of using RevenueCat's default implementation.
 * This is used when `purchasesAreCompletedBy` is set to `MY_APP`.
 */
const PurchaseLogicPaywallScreen: React.FC<Props> = ({route, navigation}: Props) => {
  const onPurchaseStarted = ({
    packageBeingPurchased,
  }: {
    packageBeingPurchased: PurchasesPackage;
  }) => {
    console.log('[PurchaseLogic] onPurchaseStarted - package:', packageBeingPurchased.identifier);
  };

  const onPurchaseCompleted = ({
    customerInfo,
    storeTransaction,
  }: {
    customerInfo: CustomerInfo;
    storeTransaction: PurchasesStoreTransaction;
  }) => {
    console.log('[PurchaseLogic] onPurchaseCompleted - transaction:', storeTransaction.transactionIdentifier);
    console.log('[PurchaseLogic] onPurchaseCompleted - active subscriptions:', customerInfo.activeSubscriptions);
    console.log('[PurchaseLogic] onPurchaseCompleted - active entitlements:', Object.keys(customerInfo.entitlements.active));
  };

  const onPurchaseError = ({error}: {error: PurchasesError}) => {
    console.log('[PurchaseLogic] onPurchaseError - code:', error.code, 'message:', error.message);
  };

  const onPurchaseCancelled = () => {
    console.log('[PurchaseLogic] onPurchaseCancelled');
  };

  const onRestoreStarted = () => {
    console.log('[PurchaseLogic] onRestoreStarted');
  };

  const onRestoreCompleted = ({customerInfo}: {customerInfo: CustomerInfo}) => {
    console.log('[PurchaseLogic] onRestoreCompleted - active subscriptions:', customerInfo.activeSubscriptions);
    console.log('[PurchaseLogic] onRestoreCompleted - active entitlements:', Object.keys(customerInfo.entitlements.active));
  };

  const onRestoreError = ({error}: {error: PurchasesError}) => {
    console.log('[PurchaseLogic] onRestoreError - code:', error.code, 'message:', error.message);
  };

  const onDismiss = () => {
    console.log('[PurchaseLogic] onDismiss');
    navigation.pop();
  };

  if (!useCustomPurchaseLogic) {
    return (
      <View style={styles.container}>
        <Text style={styles.warningText}>
          The SDK is not configured with purchasesAreCompletedBy: MY_APP.{'\n\n'}
          To use custom purchase logic, update the Purchases.configure() call in App.tsx
          to set purchasesAreCompletedBy to MY_APP.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.flex1}>
      <RevenueCatUI.Paywall
        options={{
          offering: route.params.offering,
          displayCloseButton: true,
        }}
        purchaseLogic={{
          performPurchase: async (packageToPurchase: PurchasesPackage) => {
            console.log('[PurchaseLogic] performPurchase called');
            console.log('[PurchaseLogic] performPurchase - package:', packageToPurchase.identifier);
            console.log('[PurchaseLogic] performPurchase - product:', packageToPurchase.product?.identifier);

            try {
              const result = await Purchases.purchasePackage(packageToPurchase);
              console.log('[PurchaseLogic] performPurchase - SUCCESS');
              Alert.alert('Purchase Success', `Active subscriptions: ${result.customerInfo.activeSubscriptions.join(', ')}`);
              return PURCHASE_LOGIC_RESULT.SUCCESS;
            } catch (e: any) {
              if (e.userCancelled) {
                console.log('[PurchaseLogic] performPurchase - CANCELLATION');
                Alert.alert('Purchase Cancelled', 'User cancelled the purchase.');
                return PURCHASE_LOGIC_RESULT.CANCELLATION;
              }
              console.log('[PurchaseLogic] performPurchase - ERROR:', e.message);
              Alert.alert('Purchase Error', e.message);
              return PURCHASE_LOGIC_RESULT.ERROR;
            }
          },
          performRestore: async () => {
            console.log('[PurchaseLogic] performRestore called');

            try {
              const customerInfo = await Purchases.restorePurchases();
              console.log('[PurchaseLogic] performRestore - SUCCESS');
              Alert.alert('Restore Success', `Active subscriptions: ${customerInfo.activeSubscriptions.join(', ')}`);
              return PURCHASE_LOGIC_RESULT.SUCCESS;
            } catch (e: any) {
              console.log('[PurchaseLogic] performRestore - ERROR:', e.message);
              Alert.alert('Restore Error', e.message);
              return PURCHASE_LOGIC_RESULT.ERROR;
            }
          },
        }}
        onPurchaseStarted={onPurchaseStarted}
        onPurchaseCompleted={onPurchaseCompleted}
        onPurchaseError={onPurchaseError}
        onPurchaseCancelled={onPurchaseCancelled}
        onRestoreStarted={onRestoreStarted}
        onRestoreCompleted={onRestoreCompleted}
        onRestoreError={onRestoreError}
        onDismiss={onDismiss}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  warningText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default PurchaseLogicPaywallScreen;
