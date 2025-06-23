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

export interface WebPaywallProps {
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

export interface WebCustomerCenterProps {
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

export const WebPaywall: React.FC<WebPaywallProps> = ({
  offering,
  displayCloseButton = true,
  fontFamily,
  onPurchaseStarted,
  onPurchaseCancelled,
  onRestoreStarted,
  onRestoreError,
  onDismiss,
}) => {
  const handlePurchase = (pkg: PurchasesPackage) => {
    onPurchaseStarted?.({ packageBeingPurchased: pkg });
    // Simulate purchase flow for web
    setTimeout(() => {
      onPurchaseCancelled?.();
    }, 1000);
  };

  const handleRestore = () => {
    onRestoreStarted?.();
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
      onRestoreError?.({ error });
    }, 1000);
  };

  const handleClose = () => {
    onDismiss?.();
  };

  const textStyle = fontFamily ? { fontFamily } : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>
          {offering?.serverDescription || 'Premium Subscription'}
        </Text>
        {displayCloseButton && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={[styles.description, textStyle]}>
          {offering?.serverDescription || 'Unlock premium features with a subscription'}
        </Text>
        
        {offering?.availablePackages.map((pkg, index) => (
          <TouchableOpacity
            key={index}
            style={styles.packageButton}
            onPress={() => handlePurchase(pkg)}
          >
            <Text style={[styles.packageTitle, textStyle]}>
              {pkg.product.title}
            </Text>
            <Text style={[styles.packagePrice, textStyle]}>
              {pkg.product.priceString}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={[styles.restoreButtonText, textStyle]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={[styles.disclaimer, textStyle]}>
          Web platform - Preview mode. Purchases are not processed.
        </Text>
      </View>
    </View>
  );
};

export const WebCustomerCenter: React.FC<WebCustomerCenterProps> = ({
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
        <Text style={styles.title}>Customer Center</Text>
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
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  packageButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 16,
    color: '#ffffff',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#007AFF',
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