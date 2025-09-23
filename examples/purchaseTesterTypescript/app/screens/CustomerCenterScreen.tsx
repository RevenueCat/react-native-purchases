import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCenterScreen'>;

const CustomerCenterScreen: React.FC<Props> = ({navigation, route}: Props) => {
  const { shouldShowCloseButton = true } = route.params || {};

  const onDismiss = () => {
    console.log('[CustomerCenter] Dismissed');
    navigation.pop();
  };

  const onCustomActionSelected = (event: {actionId: string; purchaseIdentifier: string | null}) => {
    console.log('[CustomerCenter] Custom action selected:', event.actionId, 'purchaseIdentifier:', event.purchaseIdentifier);
  };

  const onRestoreStarted = () => {
    console.log('[CustomerCenter] Restore started');
  };

  const onRestoreCompleted = (event: {customerInfo: any}) => {
    console.log('[CustomerCenter] Restore completed:', event.customerInfo);
  };

  const onRestoreFailed = (event: {error: any}) => {
    console.log('[CustomerCenter] Restore failed:', event.error);
  };

  const onShowingManageSubscriptions = () => {
    console.log('[CustomerCenter] Showing manage subscriptions');
  };

  const onFeedbackSurveyCompleted = (event: {feedbackSurveyOptionId: string}) => {
    console.log('[CustomerCenter] Feedback survey completed:', event.feedbackSurveyOptionId);
  };

  const onManagementOptionSelected = (event: {option: string; url: string | null}) => {
    console.log('[CustomerCenter] Management option selected:', event.option, 'url:', event.url);
  };

  const onRefundRequestStarted = (event: {productIdentifier: string | null}) => {
    console.log('[CustomerCenter] Refund request started for product:', event.productIdentifier);
  };

  const onRefundRequestCompleted = (event: {productIdentifier: string | null; refundRequestStatus: string | null}) => {
    console.log('[CustomerCenter] Refund request completed for product:', event.productIdentifier, 'status:', event.refundRequestStatus);
  };

  const styles = StyleSheet.create({
    flex1: {
      flex: 1,
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
    </View>
  );
};

export default CustomerCenterScreen;
