import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Purchases from 'react-native-purchases';
import TestCasesScreen from './src/TestCasesScreen';
import PurchaseThroughPaywallScreen from './src/PurchaseThroughPaywallScreen';

const Stack = createNativeStackNavigator();

const API_KEY = 'MAESTRO_TESTS_REVENUECAT_API_KEY';

export default function App() {
  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({apiKey: API_KEY});
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="TestCases"
          component={TestCasesScreen}
          options={{title: 'Test Cases'}}
        />
        <Stack.Screen
          name="PurchaseThroughPaywall"
          component={PurchaseThroughPaywallScreen}
          options={{title: 'Purchase through paywall'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
