/**
 * @file Weather Router.
 * @author Vadim Savin
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WeatherScreen from '../screens/WeatherScreen';

const Stack = createStackNavigator();

const WeatherRouter = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Weather"
      component={WeatherScreen}
      options={{
        title: '✨ Magic Weather',
      }}
    />
  </Stack.Navigator>
);

export default WeatherRouter;
