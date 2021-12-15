import React, { useEffect, useState } from 'react';

import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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

import Purchases, { PurchaserInfo, PurchasesOfferings, PurchasesEntitlementInfo } from 'react-native-purchases';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList'

type Props = NativeStackScreenProps<RootStackParamList, 'OfferingDetail'>;

// Taken from https://reactnative.dev/docs/typescript
const OfferingDetailScreen: React.FC<Props> = ({ route, navigation }: Props) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[backgroundStyle, styles.container]}>
          <Text>
            { route.params.offering?.serverDescription }
          </Text>
          <Text>
            { route.params.offering?.identifier }
          </Text>

          {
            route.params.offering?.availablePackages.map((pkg) => {
              return (
                <View key={pkg.identifier} style={styles.packageContainer}>
                  <Text style={styles.packageHeader}>{ pkg.product.title }</Text>
                  <Text>{ pkg.product.description }</Text>
                  <Text>{ pkg.product.price_string }</Text>
                  <Text>{ pkg.packageType }</Text>
                  
                  <Button
                    onPress={() => {
                      Purchases.purchasePackage(pkg).then((result) => {
                      }).catch((err) => {
                        console.log("error", err)
                      });
                    }}
                    title="Buy"
                    color="#841584"
                    accessibilityLabel="Buy"
                  />
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
  packageContainer: {
    flex: 1,
    marginVertical: 5,
    padding: 5,
    borderColor: '#000000',
    borderWidth: 1
  },
  packageHeader: {
    fontWeight: 'bold'
  }
});

export default OfferingDetailScreen;