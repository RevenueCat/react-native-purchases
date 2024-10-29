/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import Purchases from 'react-native-purchases';

import PurchaseScreen from './src/screens/PurchaseScreen';

function App(): React.JSX.Element {
  Purchases.configure({apiKey: 'goog_'});
  Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);

  return <PurchaseScreen />;
}

export default App;
