import React, { useEffect, useState } from 'react';
import { StatusBar, Text } from 'react-native';

import Purchases from 'react-native-purchases';
import { API_KEY } from './src/constants';
import Router from './src/navigation/Router';

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    /* Enable debug logs before calling `setup`. */
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    /*
      Initialize the RevenueCat Purchases SDK.

      - appUserID is nil, so an anonymous ID will be generated automatically by the Purchases SDK. Read more about Identifying Users here: https://docs.revenuecat.com/docs/user-ids

      - useAmazon is false, so it will use the Play Store in Android and App Store in iOS by default.
      */
    Purchases.configure({ apiKey: API_KEY, appUserID: null, useAmazon: false });
    setIsReady(true);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      {isReady ? <Router /> : <Text>Loading...</Text>}
    </>
  );
}

export default App;
