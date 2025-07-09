/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useState } from 'react';

import { Alert, Linking, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Purchases from 'react-native-purchases';

import HomeScreen from './app/screens/HomeScreen';
import CustomerInfoScreen from './app/screens/CustomerInfoScreen';
import OfferingDetailScreen from './app/screens/OfferingDetailScreen';
import PaywallScreen from './app/screens/PaywallScreen';
import FooterPaywallScreen from "./app/screens/FooterPaywallScreen";
import WinBackTestingScreen from "./app/screens/WinBackTestingScreen";

import APIKeys from './app/APIKeys';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const App = () => {
  const hasKeys = () => {
    return APIKeys.apple.length > 0 || APIKeys.google.length > 0 || APIKeys.amazon.length > 0;
  }

  const [url, setUrl] = useState<string | null>(null);

  const fetchUrlAsync = async () => {
    // Get the deep link used to open the app
    const initialUrl = await Linking.getInitialURL();
    Linking.addEventListener('url', ({ url }) => {
      setUrl(url);
    });
    setUrl(initialUrl);
  };

  const redeemWebPurchaseIfAny = async () => {
    if (url) {
      const webPurchaseRedemption = await Purchases.parseAsWebPurchaseRedemption(url);
      setUrl(null);
      if (webPurchaseRedemption) {
        const result = await Purchases.redeemWebPurchase(webPurchaseRedemption);
        Alert.alert('Redemption result', JSON.stringify(result, null, 2));
      } else {
        Alert.alert('URL is not a valid web purchase redemption URL');
      }
    }
  }

  useEffect(() => {
    if (!hasKeys()) { return }

    fetchUrlAsync();

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    const verificationMode = Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL;

    if (Platform.OS == "android") {
      const useAmazon = false;
      if (useAmazon) {
        Purchases.configure({
          apiKey: APIKeys.amazon,
          useAmazon: true,
          entitlementVerificationMode: verificationMode,
          pendingTransactionsForPrepaidPlansEnabled: true,
          diagnosticsEnabled: true
        });
      } else {
        Purchases.configure({
          apiKey: APIKeys.google,
          entitlementVerificationMode: verificationMode,
          pendingTransactionsForPrepaidPlansEnabled: true,
          diagnosticsEnabled: true
        });
      }
    } else {
      Purchases.configure({
        apiKey: APIKeys.apple,
        entitlementVerificationMode: verificationMode,
        diagnosticsEnabled: true
      });
    }

    Purchases.enableAdServicesAttributionTokenCollection();
  }, []);

  useEffect(() => {
    redeemWebPurchaseIfAny();
  }, [url]);

  return !hasKeys() ? (
      <SafeAreaView>
        <Text style={{margin: 20, textAlign: 'center'}}>
          Update RevenueCat API Keys in APIKeys.tsx
        </Text>
      </SafeAreaView>
    ) : (
      <NavigationContainer>
        <Stack.Navigator  initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'PurchaseTester' }}
          />
          <Stack.Screen name="CustomerInfo" component={CustomerInfoScreen} />
          <Stack.Screen name="OfferingDetail" component={OfferingDetailScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="FooterPaywall" component={FooterPaywallScreen} />
          <Stack.Screen name="WinBackTesting" component={WinBackTestingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
};

export default App;
