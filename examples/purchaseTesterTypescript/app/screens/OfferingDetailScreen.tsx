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

import Purchases, { PurchasesPackage, PurchasesStoreProduct, SubscriptionOption, PURCHASE_TYPE, PERIOD_UNIT } from 'react-native-purchases';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList'

type Props = NativeStackScreenProps<RootStackParamList, 'OfferingDetail'>;

// Taken from https://reactnative.dev/docs/typescript
const OfferingDetailScreen: React.FC<Props> = ({ route, navigation }: Props) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const purchasePackage = (pkg: PurchasesPackage) => {
    Purchases.purchasePackage(pkg).then((result) => {
    }).catch((err) => {
      console.log("error", err)
    });
  }

  const purchaseProduct = (product: PurchasesStoreProduct) => {
    Purchases.purchaseProduct(
      product.identifier,
      null,
      PURCHASE_TYPE.SUBS,
      null,
      product.presentedOfferingIdentifier,
      ).then((result) => {
    }).catch((err) => {
      console.log("error", err)
    });
  }

  const purchaseSubscriptionOption = (option: SubscriptionOption) => {
    Purchases.purchaseSubscriptionOption(option).then((result) => {
    }).catch((err) => {
      console.log("error", err)
    });
  }

  const renderOptionInfo = (option: SubscriptionOption) => {
    return option.pricingPhases.map((phase) => {
      return `${phase.price.formatted} for ${phase.billingPeriod.value} ${phase.billingPeriod.unit}`;
    }).join(', ');
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
            route.params.offering?.availablePackages.map((pkg: PurchasesPackage) => {
              return (
                <View key={pkg.identifier} style={styles.packageContainer}>
                  <View style={styles.packageInfoAndButtons}>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageHeader}>{ pkg.product.title }</Text>
                      <Text style={styles.packageText}>{ pkg.product.description }</Text>
                      <Text style={styles.packageText}>{ pkg.product.priceString }</Text>
                      <Text style={styles.packageText}>{ pkg.product.identifier }</Text>
                      <Text style={styles.packageText}>{ pkg.product.subscriptionPeriod }</Text>
                      <Text style={styles.packageText}>{ pkg.packageType }</Text>
                    </View>

                    <View style={styles.buttonStack}>
                      <TouchableOpacity
                        style={styles.packageBuy}
                        onPress={() => { purchasePackage(pkg) }}>
                        <Text>Buy Package</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.packageBuy}
                        onPress={() => { purchaseProduct(pkg.product) }}>
                        <Text>Buy Product</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.options}>
                  {
                    pkg.product.subscriptionOptions?.map((option: SubscriptionOption) => {
                      return (
                        <View key={option.id} style={styles.option}>
                          <View style={styles.optionInfo}>
                            <Text style={{fontWeight: "bold"}}>
                              {option.id}
                              {(option.id == pkg.product.defaultOption?.id) ? " (DEFAULT)" : null}
                            </Text>
                            <Text>{renderOptionInfo(option)}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.packageBuy}
                            onPress={() => { purchaseSubscriptionOption(option) }}>
                            <Text>Buy</Text>
                          </TouchableOpacity>
                        </View>
                      )
                    })
                  }
                  </View>
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
    flexDirection: "column",
    alignItems: "flex-start",
    marginVertical: 5,
    padding: 5,
    borderColor: '#000000',
    borderWidth: 1
  },
  packageInfoAndButtons: {
    flex: 1,
    flexDirection: "row",
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
  },
  buttonStack: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 10,
    margin: 5,
    flexGrow: 1,
  },
  options: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    alignSelf: "stretch",
    gap: 5,
    marginTop: 10,
    padding: 10,
    flexGrow: 1,
    borderTopColor: '#CCCCCC',
    borderTopWidth: 1
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  optionInfo: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  }
});

export default OfferingDetailScreen;
