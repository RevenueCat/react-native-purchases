import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
  type PurchasesStoreTransaction,
  REFUND_REQUEST_STATUS,
  PURCHASES_ERROR_CODE
} from "@revenuecat/purchases-typescript-internal";

export interface PreviewPaywallProps {
  offering?: PurchasesOffering | null;
  displayCloseButton?: boolean;
  fontFamily?: string | null;
  onPurchaseStarted?: ({packageBeingPurchased}: { packageBeingPurchased: PurchasesPackage }) => void;
  onPurchaseCompleted?: ({
                           customerInfo,
                           storeTransaction
                         }: { customerInfo: CustomerInfo, storeTransaction: PurchasesStoreTransaction }) => void;
  onPurchaseError?: ({error}: { error: PurchasesError }) => void;
  onPurchaseCancelled?: () => void;
  onRestoreStarted?: () => void;
  onRestoreCompleted?: ({customerInfo}: { customerInfo: CustomerInfo }) => void;
  onRestoreError?: ({error}: { error: PurchasesError }) => void;
  onDismiss?: () => void;
}

export interface PreviewCustomerCenterProps {
  callbacks?: {
    onFeedbackSurveyCompleted?: ({feedbackSurveyOptionId}: { feedbackSurveyOptionId: string }) => void;
    onShowingManageSubscriptions?: () => void;
    onRestoreCompleted?: ({customerInfo}: { customerInfo: CustomerInfo }) => void;
    onRestoreFailed?: ({error}: { error: PurchasesError }) => void;
    onRestoreStarted?: () => void;
    onRefundRequestStarted?: ({productIdentifier}: { productIdentifier: string }) => void;
    onRefundRequestCompleted?: ({productIdentifier, refundRequestStatus}: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => void;
    onManagementOptionSelected?: (event: any) => void;
  };
}

export const PreviewPaywall: React.FC<PreviewPaywallProps> = ({
  displayCloseButton = true,
  fontFamily,
  onDismiss,
}) => {
  const handleClose = () => {
    onDismiss?.();
  };

  const textStyle = fontFamily ? { fontFamily } : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>
          Preview Paywall
        </Text>
        {displayCloseButton && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.notSupportedMessage, textStyle]}>
          Web paywalls are not supported yet.
        </Text>
        <Text style={[styles.fakeMessage, textStyle]}>
          This is a fake preview implementation.
        </Text>
        <Text style={[styles.previewMode, textStyle]}>
          Currently in preview mode
        </Text>
        
        <TouchableOpacity style={styles.closePaywallButton} onPress={handleClose}>
          <Text style={[styles.closePaywallButtonText, textStyle]}>
            Close Paywall
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const PreviewCustomerCenter: React.FC<PreviewCustomerCenterProps> = ({
  callbacks
}) => {
  const handleManageSubscriptions = () => {
    callbacks?.onShowingManageSubscriptions?.();
    callbacks?.onManagementOptionSelected?.({ option: 'change_plans', url: null });
  };

  const handleRestore = () => {
    callbacks?.onRestoreStarted?.();
    // Simulate restore flow for web
    setTimeout(() => {
      const error: PurchasesError = {
        code: PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR,
        message: 'Restore purchases is not supported on web platform',
        userCancelled: false,
        underlyingErrorMessage: 'Web platform does not support restore purchases',
        readableErrorCode: PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR,
        userInfo: { readableErrorCode: PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR }
      };
      callbacks?.onRestoreFailed?.({ error });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preview Customer Center</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Manage your subscription and account settings
        </Text>
        
        <TouchableOpacity style={styles.optionButton} onPress={handleManageSubscriptions}>
          <Text style={styles.optionButtonText}>Manage Subscriptions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton} onPress={handleRestore}>
          <Text style={styles.optionButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.disclaimer}>
          Web platform - Preview mode. Some features may not be available.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 400,
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notSupportedMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  fakeMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewMode: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
  },
  closePaywallButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  closePaywallButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
}); 