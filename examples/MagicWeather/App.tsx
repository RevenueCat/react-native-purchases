import React, {useEffect, useState} from 'react';
import {StatusBar, Text} from 'react-native';

import Purchases from 'react-native-purchases';
import {API_KEY} from './src/constants';
import TabScreen from './src/navigation/Navigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    /* Enable debug logs before calling `setup`. */
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    /*
      Initialize the RevenueCat Purchases SDK.

      - appUserID is null, so an anonymous ID will be generated automatically by the Purchases SDK. Read more about Identifying Users here: https://docs.revenuecat.com/docs/user-ids

      - useAmazon is false, so it will use the Play Store in Android and App Store in iOS by default.
      */
    if (API_KEY) {
      Purchases.configure({apiKey: API_KEY, appUserID: null, useAmazon: false});
      setIsReady(true);
    } else {
      console.error('API_KEY is not set');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      {isReady ? <TabScreen /> : <Text>Loading...</Text>}
    </SafeAreaProvider>
  );
}

export default App;
