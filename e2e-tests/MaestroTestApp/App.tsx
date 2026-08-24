import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Purchases from 'react-native-purchases';
import TestCasesScreen from './src/TestCasesScreen';
import PurchaseThroughPaywallScreen from './src/PurchaseThroughPaywallScreen';

export type RootStackParamList = {
  TestCases: undefined;
  PurchaseThroughPaywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const API_KEY = 'MAESTRO_TESTS_REVENUECAT_API_KEY';

const TEST_FLOW_SCREEN_MAP: Record<string, keyof RootStackParamList> = {
  purchase_through_paywall: 'PurchaseThroughPaywall',
};

type AppProps = {
  e2e_test_flow?: string;
};

export default function App(props: AppProps) {
  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({apiKey: API_KEY});
  }, []);

  const initialRoute =
    (props.e2e_test_flow && TEST_FLOW_SCREEN_MAP[props.e2e_test_flow]) ||
    'TestCases';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
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
