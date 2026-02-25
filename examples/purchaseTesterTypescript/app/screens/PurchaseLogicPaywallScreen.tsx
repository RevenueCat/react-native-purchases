import React, {useRef, useState} from 'react';
import RevenueCatUI, {PURCHASE_LOGIC_RESULT, type PurchaseLogicResult} from 'react-native-purchases-ui';

import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';
import {useCustomPurchaseLogic} from '../../App';
import {
  CustomerInfo,
  PurchasesError,
  PurchasesPackage,
  PurchasesStoreTransaction,
} from '@revenuecat/purchases-typescript-internal';

type Props = NativeStackScreenProps<RootStackParamList, 'PurchaseLogicPaywall'>;

type ModalType = 'purchase' | 'restore';

/**
 * Example screen demonstrating custom PurchaseLogic with paywalls.
 *
 * When `purchaseLogic` is provided, the paywall delegates purchase and restore
 * operations to your app instead of using RevenueCat's default implementation.
 * This is used when `purchasesAreCompletedBy` is set to `MY_APP`.
 */
const PurchaseLogicPaywallScreen: React.FC<Props> = ({route, navigation}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('purchase');
  const [packageInfo, setPackageInfo] = useState('');
  const resolveRef = useRef<((result: PurchaseLogicResult) => void) | null>(null);

  const showResultModal = (type: ModalType, pkgName?: string): Promise<PurchaseLogicResult> => {
    return new Promise(resolve => {
      resolveRef.current = resolve;
      setModalType(type);
      setPackageInfo(pkgName ?? '');
      setModalVisible(true);
    });
  };

  const pickResult = (result: PurchaseLogicResult) => {
    setModalVisible(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

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
    storeTransaction?: PurchasesStoreTransaction;
  }) => {
    console.log('[PurchaseLogic] onPurchaseCompleted - transaction:', storeTransaction?.transactionIdentifier ?? 'none');
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
          performPurchase: async ({ packageToPurchase }) => {
            console.log('[PurchaseLogic] performPurchase called');
            console.log('[PurchaseLogic] performPurchase - package:', packageToPurchase.identifier);
            console.log('[PurchaseLogic] performPurchase - product:', packageToPurchase.product?.identifier);

            return showResultModal('purchase', packageToPurchase.identifier);
          },
          performRestore: async () => {
            console.log('[PurchaseLogic] performRestore called');

            return showResultModal('restore');
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

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => pickResult({ result: PURCHASE_LOGIC_RESULT.ERROR })}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Custom PurchaseLogic</Text>
            <Text style={styles.modalTitle}>
              {modalType === 'purchase'
                ? `Simulate Purchase\n"${packageInfo}"`
                : 'Simulate Restore'}
            </Text>

            <Pressable
              style={[styles.modalButton, styles.successButton]}
              onPress={() => pickResult({ result: PURCHASE_LOGIC_RESULT.SUCCESS })}>
              <Text style={styles.modalButtonText}>Success</Text>
            </Pressable>

            {modalType === 'purchase' && (
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => pickResult({ result: PURCHASE_LOGIC_RESULT.CANCELLATION })}>
                <Text style={styles.modalButtonText}>Cancelled</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.modalButton, styles.errorButton]}
              onPress={() => pickResult({ result: PURCHASE_LOGIC_RESULT.ERROR })}>
              <Text style={styles.modalButtonText}>Error</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#888',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#FF9500',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
});

export default PurchaseLogicPaywallScreen;
