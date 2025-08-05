import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Purchases from 'react-native-purchases';
import {ENTITLEMENT_ID} from '../constants';
import {LoginForm, LogoutButton, RestorePurchasesButton} from '../components';

/*
 The app's user tab to display user's details like subscription status and ID's.
 */
const UserScreen = () => {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  // get the latest details about the user (is anonymous, user id, has active subscription)
  const getUserDetails = async () => {
    setIsAnonymous(await Purchases.isAnonymous());
    setUserId(await Purchases.getAppUserID());

    const customerInfo = await Purchases.getCustomerInfo();
    setSubscriptionActive(typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined');
  };

  useEffect(() => {
    // Get user details when component first mounts
    getUserDetails();
  }, []);

  useEffect(() => {
    // Subscribe to purchaser updates
    Purchases.addCustomerInfoUpdateListener(getUserDetails);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(getUserDetails);
    };
  });

  return (
    <View style={styles.page}>
      {/* The user's current app user ID and subscription status */}
      <Text style={styles.headline}>Current User Identifier</Text>
      <Text style={styles.userIdentifier}>{userId}</Text>

      <Text style={styles.headline}>Subscription Status</Text>
      <Text style={{color: subscriptionActive ? 'green' : 'red'}}>{subscriptionActive ? 'Active' : 'Not Active'}</Text>

      {/* Authentication UI */}
      {isAnonymous ? <LoginForm onLogin={getUserDetails} /> : <LogoutButton onLogout={getUserDetails} />}

      {/* You should always give users the option to restore purchases to connect their purchase to their current app user ID */}
      <RestorePurchasesButton />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    padding: 36,
  },
  headline: {
    color: 'white',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 18,
    paddingVertical: 8,
  },
  userIdentifier: {
    color: 'white',
  },
});

export default UserScreen;
