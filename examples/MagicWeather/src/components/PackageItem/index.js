import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';
import { ENTITLEMENT_ID } from '../../constants';
import styles from './styles.js';

const PackageItem = ({ purchasePackage, setIsPurchasing }) => {
  const {
    product: { title, description, priceString },
  } = purchasePackage;

  const navigation = useNavigation();

  const onSelection = async () => {
    setIsPurchasing(true);

    try {
      const { purchaserInfo } = await Purchases.purchasePackage(purchasePackage);

      if (typeof purchaserInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
        navigation.goBack();
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Error purchasing package', e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Pressable onPress={onSelection} style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.terms}>{description}</Text>
      </View>
      <Text style={styles.title}>{priceString}</Text>
    </Pressable>
  );
};

export default PackageItem;
