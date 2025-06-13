import React, {useContext, useEffect, useState} from 'react';
import {View, Text, FlatList, Alert, StyleSheet, Pressable} from 'react-native';
import Purchases from 'react-native-purchases';
import {PackageItem} from '../components';
import {PurchasesPackage} from 'react-native-purchases';
import {NavigationContext} from '../navigation/Navigation';

/*
 An example paywall that uses the current offering.
 */
const PaywallScreen = () => {
  // - State for all available package
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  // - State for displaying an overlay view
  const [isPurchasing, setIsPurchasing] = useState(false);

  const navigation = useContext(NavigationContext);

  useEffect(() => {
    // Get current available packages
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e: any) {
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
      <Pressable onPress={() => navigation.closeModal()} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>
      <FlatList
        data={packages}
        renderItem={({item}) => <PackageItem purchasePackage={item} setIsPurchasing={setIsPurchasing} />}
        keyExtractor={item => item.identifier}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styles.headerFooterContainer}
        ListFooterComponent={footer}
        ListFooterComponentStyle={styles.headerFooterContainer}
      />

      {isPurchasing && <View style={styles.overlay} />}
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  text: {
    color: 'lightgrey',
  },
  headerFooterContainer: {
    marginVertical: 32,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: 'black',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#808080',
  },
  closeButtonText: {
    color: 'white',
  },
});

export default PaywallScreen;
