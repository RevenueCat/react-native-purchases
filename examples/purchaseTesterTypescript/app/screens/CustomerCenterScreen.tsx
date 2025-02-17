import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCenter'>;

const CustomerCenterScreen: React.FC<Props> = ({route, navigation}: Props) => {
  // Example handlers for the events
  const onDismiss = () => {
    console.log('Dismissed');
    navigation.pop();
  };

  const styles = StyleSheet.create({
    flex1: {
      flex: 1,
    },
  });

  return (
    <View style={styles.flex1}>
      <RevenueCatUI.CustomerCenter
        onDismiss={onDismiss}
      />
    </View>
  );
};

export default CustomerCenterScreen;
