/**
 * @file Home Tab Navigator.
 * @author Vadim Savin
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import UserScreen from '../screens/UserScreen';
import WeatherScreen from '../screens/WeatherScreen';

const TabNavigator = createBottomTabNavigator({
  screens: {
    Weather: {
      screen: WeatherScreen,
      options: {
        tabBarIcon: ({focused, color, size}) => (
          <Ionicons
            name={focused ? 'sunny' : 'sunny-outline'}
            color={color}
            size={size}
          />
        ),
      },
    },
    User: {
      screen: UserScreen,
      options: {
        tabBarIcon: ({focused, color, size}) => (
          <Ionicons
            name={focused ? 'person' : 'person-outline'}
            color={color}
            size={size}
          />
        ),
      },
    },
  },
});

export default TabNavigator;
