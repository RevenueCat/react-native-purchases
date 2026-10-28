import React from 'react';
import {Text} from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

export default function App() {
  return <Text>{typeof Purchases.configure} / {typeof RevenueCatUI.presentPaywall}</Text>;
}
