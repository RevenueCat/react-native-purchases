/**
 * @file Login Form.
 * @author Vadim Savin
 */

import React, { useState } from 'react';
import { Text, TextInput, Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import styles from './styles';

/*
 How to login and identify your users with the Purchases SDK.

 These component mimic displaying a login form in order to identifying the user.

 Read more about Identifying Users here: https://docs.revenuecat.com/docs/user-ids
 */
const LoginForm = ({ onLogin }) => {
  const [newUserId, setNewUserId] = useState('');

  console.warn(
    "Public-facing usernames aren't optimal for user ID's - you should use something non-guessable, like a non-public database ID. For more information, visit https://docs.revenuecat.com/docs/user-ids.",
  );

  const login = async () => {
    if (!newUserId) {
      return;
    }

    try {
      await Purchases.identify(newUserId);
    } catch (e) {
      Alert.alert('Error identifying user', e.message);
    }

    setNewUserId('');
    await onLogin();
  };

  return (
    <>
      <Text style={styles.headline}>Login</Text>
      <TextInput
        value={newUserId}
        onChangeText={setNewUserId}
        onEndEditing={login}
        placeholder="Enter App User ID"
        placeholderTextColor="lightgrey"
        style={styles.input}
      />
    </>
  );
};

export default LoginForm;
