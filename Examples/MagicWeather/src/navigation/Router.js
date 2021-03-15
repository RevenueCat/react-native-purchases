/**
 * @file App Router.
 * @author Vadim Savin
 */

import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import TabNavigator from './TabNavigator';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createStackNavigator();

const Router = () => {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            title: '✨ Magic Weather Premium',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;
