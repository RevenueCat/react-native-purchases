import React, { useEffect, useRef, useState } from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCenterScreen'>;

const CustomerCenterScreen: React.FC<Props> = ({navigation, route}: Props) => {
  const { shouldShowCloseButton = true } = route.params || {};

  const [customerCenterNotification, setCustomerCenterNotification] = useState<{
    title: string;
    message?: string;
  } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const formatNotificationPayload = (payload?: Record<string, unknown>) => {
    if (!payload || Object.keys(payload).length === 0) {
      return undefined;
    }
    try {
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      console.warn('Failed to format Customer Center payload', error);
      return String(payload);
    }
  };

  const showCustomerCenterNotification = (callbackName: string, payload?: Record<string, unknown>) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setCustomerCenterNotification({
      title: callbackName,
      message: formatNotificationPayload(payload),
    });
    notificationTimeoutRef.current = setTimeout(() => {
      setCustomerCenterNotification(null);
    }, 4000);
  };

  const onDismiss = () => {
    showCustomerCenterNotification('onDismiss');
    console.log('[CustomerCenter] Dismissed');
    navigation.pop();
  };

  const onCustomActionSelected = (event: {actionId: string; purchaseIdentifier: string | null}) => {
    showCustomerCenterNotification('onCustomActionSelected', {
      actionId: event.actionId,
      purchaseIdentifier: event.purchaseIdentifier ?? null,
    });
    console.log('[CustomerCenter] Custom action selected:', event.actionId, 'purchaseIdentifier:', event.purchaseIdentifier);
  };

  const onRestoreStarted = () => {
    showCustomerCenterNotification('onRestoreStarted');
    console.log('[CustomerCenter] Restore started');
  };

  const onRestoreCompleted = (event: {customerInfo: any}) => {
    const activeEntitlements = Object.keys(event.customerInfo?.entitlements?.active ?? {});
    showCustomerCenterNotification('onRestoreCompleted', {
      originalAppUserId: event.customerInfo?.originalAppUserId,
      activeEntitlements,
    });
    console.log('[CustomerCenter] Restore completed:', event.customerInfo);
  };

  const onRestoreFailed = (event: {error: any}) => {
    showCustomerCenterNotification('onRestoreFailed', {
      code: event.error?.code,
      message: event.error?.message,
    });
    console.log('[CustomerCenter] Restore failed:', event.error);
  };

  const onShowingManageSubscriptions = () => {
    showCustomerCenterNotification('onShowingManageSubscriptions');
    console.log('[CustomerCenter] Showing manage subscriptions');
  };

  const onFeedbackSurveyCompleted = (event: {feedbackSurveyOptionId: string}) => {
    showCustomerCenterNotification('onFeedbackSurveyCompleted', {feedbackSurveyOptionId: event.feedbackSurveyOptionId});
    console.log('[CustomerCenter] Feedback survey completed:', event.feedbackSurveyOptionId);
  };

  const onManagementOptionSelected = (event: {option: string; url: string | null}) => {
    showCustomerCenterNotification('onManagementOptionSelected', {option: event.option, url: event.url ?? null});
    console.log('[CustomerCenter] Management option selected:', event.option, 'url:', event.url);
  };

  const onRefundRequestStarted = (event: {productIdentifier: string | null}) => {
    showCustomerCenterNotification('onRefundRequestStarted', {productIdentifier: event.productIdentifier});
    console.log('[CustomerCenter] Refund request started for product:', event.productIdentifier);
  };

  const onRefundRequestCompleted = (event: {productIdentifier: string | null; refundRequestStatus: string | null}) => {
    showCustomerCenterNotification('onRefundRequestCompleted', {
      productIdentifier: event.productIdentifier,
      refundRequestStatus: event.refundRequestStatus,
    });
    console.log('[CustomerCenter] Refund request completed for product:', event.productIdentifier, 'status:', event.refundRequestStatus);
  };

  const styles = StyleSheet.create({
    flex1: {
      flex: 1,
    },
    toastWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 24,
      alignItems: 'center',
    },
    toastContainer: {
      maxWidth: '90%',
      backgroundColor: 'rgba(33, 37, 41, 0.95)',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    toastTitle: {
      color: '#ffffff',
      fontWeight: '600',
      marginBottom: 4,
      fontSize: 14,
    },
    toastMessage: {
      color: '#f1f3f5',
      fontSize: 12,
      fontFamily: 'monospace',
    },
  });

  return (
    <View style={styles.flex1}>
      <RevenueCatUI.CustomerCenterView
        style={styles.flex1}
        shouldShowCloseButton={shouldShowCloseButton}
        onDismiss={onDismiss}
        onCustomActionSelected={onCustomActionSelected}
        onRestoreStarted={onRestoreStarted}
        onRestoreCompleted={onRestoreCompleted}
        onRestoreFailed={onRestoreFailed}
        onShowingManageSubscriptions={onShowingManageSubscriptions}
        onFeedbackSurveyCompleted={onFeedbackSurveyCompleted}
        onManagementOptionSelected={onManagementOptionSelected}
        onRefundRequestStarted={onRefundRequestStarted}
        onRefundRequestCompleted={onRefundRequestCompleted}
      />

      {customerCenterNotification && (
        <View style={styles.toastWrapper} pointerEvents="none">
          <View style={styles.toastContainer}>
            <Text style={styles.toastTitle}>{customerCenterNotification.title}</Text>
            {customerCenterNotification.message ? (
              <Text style={styles.toastMessage}>{customerCenterNotification.message}</Text>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
};

export default CustomerCenterScreen;
