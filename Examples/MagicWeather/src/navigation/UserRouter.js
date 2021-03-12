/**
 * @file User Router.
 * @author Vadim Savin
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserScreen from '../screens/UserScreen';

const Stack = createStackNavigator();

const UserRouter = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="User"
      component={UserScreen}
      options={{
        title: 'User',
      }}
    />
  </Stack.Navigator>
);

export default UserRouter;
