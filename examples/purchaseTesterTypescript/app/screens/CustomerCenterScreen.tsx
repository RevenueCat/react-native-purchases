import React, { useEffect } from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCenterScreen'>;

const CustomerCenterScreen: React.FC<Props> = ({navigation}: Props) => {
  useEffect(() => {
    const presentCustomerCenter = async () => {
      try {
        await RevenueCatUI.presentCustomerCenter({
          callbacks: {
            onFeedbackSurveyCompleted: ({feedbackSurveyOptionId}) => {
              console.log('Feedback survey completed:', feedbackSurveyOptionId);
            },
            onShowingManageSubscriptions: () => {
              console.log('Showing manage subscriptions');
            },
            onRestoreStarted: () => {
              console.log('Restore started');
            },
            onRestoreCompleted: ({customerInfo}) => {
              console.log('Restore completed:', customerInfo);
            },
            onRestoreFailed: ({error}) => {
              console.error('Restore failed:', error);
            },
            onManagementOptionSelected: ({option, url}) => {
              console.log('Management option selected:', option, url);
            }
          }
        });
        // Navigate back after the modal is dismissed
        navigation.pop();
      } catch (error) {
        console.error('Error presenting customer center:', error);
        navigation.pop();
      }
    };

    presentCustomerCenter();
  }, [navigation]);

  const styles = StyleSheet.create({
    flex1: {
      flex: 1,
    },
  });

  return (
    <View style={styles.flex1}>
      {/* This screen will present the native customer center modal */}
    </View>
  );
};

export default CustomerCenterScreen;
