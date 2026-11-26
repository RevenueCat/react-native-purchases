import React, {useEffect, useState} from 'react';
import {NativeModules, Text, View} from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

export default function CocoaPodsSmokeTest() {
  const [result, setResult] = useState('Running CocoaPods smoke test');
  useEffect(() => {
    async function run() {
      const appUserID = 'git-cocoapods-smoke-test';
      Purchases.configure({apiKey: 'appl_cocoapods_smoke_test', appUserID});
      if (await Purchases.getAppUserID() !== appUserID) {
        throw new Error('The native bridge returned the wrong app user ID');
      }
      if (typeof RevenueCatUI.presentPaywall !== 'function' ||
          !NativeModules.RNPaywalls || !NativeModules.RNCustomerCenter) {
        throw new Error('The UI package is not available');
      }
      setResult('COCOAPODS_SMOKE_PASSED');
    }
    run().catch(error => setResult(`COCOAPODS_SMOKE_FAILED: ${error.message}`));
  }, []);
  return <View style={{flex: 1, justifyContent: 'center'}}><Text>{result}</Text></View>;
}
