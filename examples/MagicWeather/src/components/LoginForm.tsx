import React, {useState} from 'react';
import {Text, TextInput, Alert, StyleSheet} from 'react-native';
import Purchases from 'react-native-purchases';

/*
 How to login and identify your users with the Purchases SDK.

 These component mimic displaying a login form in order to identifying the user.

 Read more about Identifying Users here: https://docs.revenuecat.com/docs/user-ids
 */
const LoginForm: React.FC<{onLogin: () => void}> = ({onLogin}) => {
  const [newUserId, setNewUserId] = useState('');

  console.warn(
    "Public-facing usernames aren't optimal for user ID's - you should use something non-guessable, like a non-public database ID. For more information, visit https://docs.revenuecat.com/docs/user-ids.",
  );

  const login = async () => {
    if (!newUserId) {
      return;
    }

    try {
      await Purchases.logIn(newUserId);
    } catch (e: any) {
      Alert.alert('Error identifying user', e.message);
    }

    setNewUserId('');
    onLogin();
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

const styles = StyleSheet.create({
  headline: {
    color: 'white',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 18,
    paddingTop: 24,
    paddingBottom: 8,
  },
  input: {
    paddingTop: 8,
    color: 'white',
  },
});

export default LoginForm;
