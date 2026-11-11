import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Purchases from 'react-native-purchases';
import TestCasesScreen from './src/TestCasesScreen';
import PurchaseThroughPaywallScreen from './src/PurchaseThroughPaywallScreen';
import PaywallInPagerScreen from './src/PaywallInPagerScreen';
import CheckpointScreen from './src/CheckpointScreen';
import CustomCheckpointPresenterScreen from './src/CustomCheckpointPresenterScreen';

export type RootStackParamList = {
  TestCases: undefined;
  PurchaseThroughPaywall: undefined;
  PaywallInPager: undefined;
  Checkpoint: {customErrorDialog?: boolean} | undefined;
  CustomCheckpointPresenter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const API_KEY = 'MAESTRO_TESTS_REVENUECAT_API_KEY';

const TEST_FLOW_SCREEN_MAP: Record<string, keyof RootStackParamList> = {
  purchase_through_paywall: 'PurchaseThroughPaywall',
  paywall_in_pager: 'PaywallInPager',
  checkpoint_purchase: 'Checkpoint',
  checkpoint_custom_error_dialog: 'Checkpoint',
  checkpoint_custom_presenter_purchase: 'CustomCheckpointPresenter',
  checkpoint_custom_presenter_back: 'CustomCheckpointPresenter',
  checkpoint_custom_presenter_unmount: 'CustomCheckpointPresenter',
};

type AppProps = {
  e2e_test_flow?: string;
  rc_test_api_key?: string;
};

export default function App(props: AppProps) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    // Maestro's clearState doesn't always reset the SDK's persisted user on iOS,
    // so each test run gets a fresh customer.
    Purchases.configure({
      apiKey: props.rc_test_api_key || API_KEY,
      appUserID: props.e2e_test_flow
        ? `maestro-${props.e2e_test_flow}-${Date.now()}`
        : undefined,
    });
    // Wait for the native configuration call before mounting an inline paywall.
    Purchases.isConfigured()
      .then(setIsConfigured)
      .catch(error => console.error('Failed to configure Purchases:', error));
  }, []);

  if (!isConfigured) {
    return null;
  }

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
        <Stack.Screen
          name="PaywallInPager"
          component={PaywallInPagerScreen}
          options={{title: 'Paywall in pager'}}
        />
        <Stack.Screen
          name="CustomCheckpointPresenter"
          component={CustomCheckpointPresenterScreen}
          options={{title: 'Custom checkpoint presenter'}}
        />
        <Stack.Screen
          name="Checkpoint"
          component={CheckpointScreen}
          initialParams={{
            customErrorDialog:
              props.e2e_test_flow === 'checkpoint_custom_error_dialog',
          }}
          options={{title: 'Checkpoint'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
