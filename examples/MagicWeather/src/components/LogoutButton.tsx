import React from 'react';
import {Pressable, Text, Alert, StyleSheet} from 'react-native';
import Purchases from 'react-native-purchases';

const LogoutButton: React.FC<{onLogout: () => void}> = ({onLogout}) => {
  const logout = async () => {
    /*
     The current user ID is no longer valid for your instance of *Purchases* since the user is logging out, and is no longer authorized to access purchaserInfo for that user ID.

     `reset` clears the cache and regenerates a new anonymous user ID.

     Note: Each time you call `reset`, a new installation will be logged in the RevenueCat dashboard as that metric tracks unique user ID's that are in-use. Since this method generates a new anonymous ID, it counts as a new user ID in-use.
     */
    try {
      await Purchases.logOut();
    } catch (e: any) {
      Alert.alert('Error resetting purchases', e.message);
    }

    onLogout();
  };

  return (
    <Pressable onPress={logout} style={styles.button}>
      <Text style={styles.text}>Logout</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 'auto',
  },
  text: {
    color: 'red',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 18,
  },
});

export default LogoutButton;
