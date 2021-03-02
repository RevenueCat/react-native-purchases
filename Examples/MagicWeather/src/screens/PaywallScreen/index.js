/**
 * @file Paywall Screen.
 * @author Vadim Savin
 */

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import { PackageItem } from '../../components';
import styles from './styles.js';

/*
 An example paywall that uses the current offering.
 */
const PaywallScreen = () => {
  // - State for all available package
  const [packages, setPackages] = useState([]);

  // - State for displaying an overlay view
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    // Get current available packages
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        Alert.alert('Error getting offers', e.message);
      }
    };

    getPackages();
  }, []);

  const header = () => <Text style={styles.text}>Magic Weather Premium</Text>;

  const footer = () => {
    console.warn(
      "Modify this value to reflect your app's Privacy Policy and Terms & Conditions agreements. Required to make it through App Review.",
    );
    return (
      <Text style={styles.text}>
        Don't forget to add your subscription terms and conditions. Read more about this here:
        https://www.revenuecat.com/blog/schedule-2-section-3-8-b
      </Text>
    );
  };

  return (
    <View style={styles.page}>
      {/* The paywall flat list displaying each package */}
      <FlatList
        data={packages}
        renderItem={({ item }) => <PackageItem purchasePackage={item} setIsPurchasing={setIsPurchasing} />}
        keyExtractor={(item) => item.identifier}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styles.headerFooterContainer}
        ListFooterComponent={footer}
        ListFooterComponentStyle={styles.headerFooterContainer}
      />

      {isPurchasing && <View style={styles.overlay} />}
    </View>
  );
};

export default PaywallScreen;
