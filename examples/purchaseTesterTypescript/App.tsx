/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

 import React, { useEffect } from 'react';

import { Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Purchases from 'react-native-purchases';

import HomeScreen from './app/screens/HomeScreen';
import CustomerInfoScreen from './app/screens/CustomerInfoScreen';
import OfferingDetailScreen from './app/screens/OfferingDetailScreen';
import PaywallScreen from './app/screens/PaywallScreen';
import FooterPaywallScreen from "./app/screens/FooterPaywallScreen";

import APIKeys from './app/APIKeys';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const App = () => {
  const hasKeys = () => {
    return APIKeys.apple.length > 0 || APIKeys.google.length > 0 || APIKeys.amazon.length > 0;
  }

  useEffect(() => {
    if (!hasKeys()) { return }

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    const verificationMode = Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL;

    if (Platform.OS == "android") {
      const useAmazon = false;
      if (useAmazon) {
        Purchases.configure({apiKey: APIKeys.amazon, useAmazon: true, entitlementVerificationMode: verificationMode});
      } else {
        Purchases.configure({apiKey: APIKeys.google, entitlementVerificationMode: verificationMode});
      }
    } else {
      Purchases.configure({apiKey: APIKeys.apple, entitlementVerificationMode: verificationMode});
    }

    Purchases.enableAdServicesAttributionTokenCollection();
  }, []);

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
        </Stack.Navigator>
      </NavigationContainer>
    );
};

export default App;
