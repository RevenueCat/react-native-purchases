/**
 * @file App Router.
 * @author Vadim Savin
 */

import React from 'react';
import {DarkTheme, createStaticNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import 'react-native-gesture-handler';

import TabNavigator from './TabNavigator';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: TabNavigator,
      options: {
        headerShown: false,
      },
    },
    Paywall: {
      screen: PaywallScreen,
      options: {
        title: '✨ Magic Weather Premium',
      },
    },
  },
});

const Navigation = createStaticNavigation(Stack);

const Router = () => {
  return <Navigation theme={DarkTheme} />;
};

export default Router;
