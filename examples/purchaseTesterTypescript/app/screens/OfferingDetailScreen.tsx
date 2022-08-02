import React, { useEffect, useState } from 'react';

import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Purchases, { PurchasesPackage } from 'react-native-purchases';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList'

type Props = NativeStackScreenProps<RootStackParamList, 'OfferingDetail'>;

// Taken from https://reactnative.dev/docs/typescript
const OfferingDetailScreen: React.FC<Props> = ({ route, navigation }: Props) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const purchase = (pkg: PurchasesPackage) => {
    Purchases.purchasePackage(pkg).then((result) => {
    }).catch((err) => {
      console.log("error", err)
    });
  }

  return (
    <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[backgroundStyle, styles.container]}>
          <Text style={styles.title}>Description</Text>
          <Text style={styles.value}>
            { route.params.offering?.serverDescription }
          </Text>
          <Text style={styles.title}>Identifier</Text>
          <Text style={styles.value}>
            { route.params.offering?.identifier }
          </Text>

          {
            route.params.offering?.availablePackages.map((pkg) => {
              return (
                <View key={pkg.identifier} style={styles.packageContainer}>
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageHeader}>{ pkg.product.title }</Text>
                    <Text style={styles.packageText}>{ pkg.product.description }</Text>
                    <Text style={styles.packageText}>{ pkg.product.priceString }</Text>
                    <Text style={styles.packageText}>{ pkg.product.identifier }</Text>
                    <Text style={styles.packageText}>{ pkg.packageType }</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.packageBuy}
                    onPress={() => { purchase(pkg) }}>
                    <Text>Buy</Text>
                  </TouchableOpacity>
                </View>
              )
            })

          }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    marginBottom: 10
  },
  packageContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    padding: 5,
    borderColor: '#000000',
    borderWidth: 1
  },
  packageHeader: {
    fontWeight: 'bold'
  },
  packageText: {
    flexWrap: 'wrap',
    flexShrink: 1
  },
  packageInfo: {
    flex: 1,
    flexGrow: 1,
  },
  packageBuy: {
    backgroundColor: "lightcoral",
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 4
  }
});

export default OfferingDetailScreen;
