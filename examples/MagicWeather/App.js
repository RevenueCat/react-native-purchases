/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 * @author Vadim Savin
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import Purchases from 'react-native-purchases';
import Router from './src/navigation/Router';
import { API_KEY } from './src/constants';

const App: () => React$Node = () => {
  useEffect(() => {
    /* Enable debug logs before calling `setup`. */
    Purchases.setDebugLogsEnabled(true);

    /*
      Initialize the RevenueCat Purchases SDK.

      - appUserID is nil, so an anonymous ID will be generated automatically by the Purchases SDK. Read more about Identifying Users here: https://docs.revenuecat.com/docs/user-ids

      - observerMode is false, so Purchases will automatically handle finishing transactions. Read more about Observer Mode here: https://docs.revenuecat.com/docs/observer-mode

      - useAmazon is false, so it will use the Play Store in Android and App Store in iOS by default.
      */
    Purchases.configure({ apiKey: API_KEY, appUserID: null, observerMode: false, useAmazon: false });
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Router />
    </>
  );
};

export default App;
