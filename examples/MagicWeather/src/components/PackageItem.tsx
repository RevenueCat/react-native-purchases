import React, {useContext} from 'react';
import {View, Text, Pressable, Alert, StyleSheet} from 'react-native';
import Purchases, {PurchasesPackage} from 'react-native-purchases';
import {ENTITLEMENT_ID} from '../constants';
import {NavigationContext} from '../navigation/Navigation';

const PackageItem = ({
  purchasePackage,
  setIsPurchasing,
}: {
  purchasePackage: PurchasesPackage;
  setIsPurchasing: (isPurchasing: boolean) => void;
}) => {
  const {
    product: {title, description, priceString},
  } = purchasePackage;

  const navigation = useContext(NavigationContext);

  const onSelection = async () => {
    setIsPurchasing(true);

    try {
      const {customerInfo} = await Purchases.purchasePackage(purchasePackage);

      if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
        navigation.closeModal();
      }
    } catch (e: any) {
      if (e.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        Alert.alert('Error purchasing package', e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Pressable onPress={onSelection} style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.terms}>{description}</Text>
      </View>
      <Text style={styles.title}>{priceString}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  terms: {
    color: 'darkgrey',
  },
});

export default PackageItem;
