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

import APIKeys from './app/APIKeys';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const App = () => {
  const hasKeys = () => {
    return APIKeys.apple.length > 0 || APIKeys.google.length > 0;
  }

  useEffect(() => {
    if (!hasKeys()) { return }

    Purchases.setDebugLogsEnabled(true);
    if (Platform.OS == "android") {
      Purchases.configure(APIKeys.google);
    } else {
      Purchases.configure(APIKeys.apple);
    }
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
        </Stack.Navigator>
      </NavigationContainer>
    );
};

export default App;
