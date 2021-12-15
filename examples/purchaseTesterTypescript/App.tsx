/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

 import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './app/screens/HomeScreen';
import CustomerInfoScreen from './app/screens/CustomerInfoScreen';
import OfferingDetailScreen from './app/screens/OfferingDetailScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
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
