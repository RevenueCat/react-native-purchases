import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCenterScreen'>;

const CustomerCenterScreen: React.FC<Props> = ({navigation, route}: Props) => {
  const { shouldShowCloseButton = true } = route.params || {};

  const onDismiss = () => {
    console.log('Dismissed');
    navigation.pop();
  };

  const onCustomActionSelected = (event: {actionId: string}) => {
    console.log('Custom action selected:', event.actionId);
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
      />
    </View>
  );
};

export default CustomerCenterScreen;
