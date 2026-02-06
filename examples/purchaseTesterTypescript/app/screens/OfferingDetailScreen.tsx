import React, { useState } from 'react';

import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View, } from 'react-native';

import { Colors, } from 'react-native/Libraries/NewAppScreen';

import Purchases, {
  PurchasesPackage,
  PurchasesStoreProduct,
  SubscriptionOption
} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList'
import CustomVariablesEditor from '../components/CustomVariablesEditor';

type Props = NativeStackScreenProps<RootStackParamList, 'OfferingDetail'>;

// Taken from https://reactnative.dev/docs/typescript
const OfferingDetailScreen: React.FC<Props> = ({ route, navigation }: Props) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [customVariables, setCustomVariables] = useState<{ [key: string]: string }>({});
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const purchasePackage = (pkg: PurchasesPackage) => {
    Purchases.purchasePackage(pkg).then(() => {
    }).catch((err) => {
      console.log("error", err)
    });
  }

  const purchaseProduct = (product: PurchasesStoreProduct) => {
    Purchases.purchaseStoreProduct(product).then((result) => {
      console.log("success", result)
    }).catch((err) => {
      console.log("error", err)
    });
  }

  const purchaseSubscriptionOption = (option: SubscriptionOption) => {
    Purchases.purchaseSubscriptionOption(option).then(() => {
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
          <Text style={styles.title}>Metadata</Text>
          <Text style={styles.value}>
            { JSON.stringify(route.params.offering?.metadata) }
          </Text>
          <View style={styles.customVariablesSection}>
            <TouchableOpacity
              style={styles.editVariablesButton}
              onPress={() => setIsEditorVisible(true)}>
              <Text style={styles.editVariablesButtonText}>
                Edit Custom Variables ({Object.keys(customVariables).length})
              </Text>
            </TouchableOpacity>
            {Object.keys(customVariables).length > 0 && (
              <Text style={styles.variablesPreview}>
                {Object.entries(customVariables).map(([k, v]) => `${k}: ${v}`).join(', ')}
              </Text>
            )}
          </View>
          <View style={styles.paywallsButtonStack}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => RevenueCatUI.presentPaywall({
                offering: route.params.offering,
                customVariables: Object.keys(customVariables).length > 0 ? customVariables : undefined,
              })}>
              <Text>
                Present paywall
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => RevenueCatUI.presentPaywallIfNeeded({
                offering: route.params.offering,
                displayCloseButton: false,
                requiredEntitlementIdentifier: "pro_cat",
                customVariables: Object.keys(customVariables).length > 0 ? customVariables : undefined,
              })}>
              <Text>
                Present paywall if needed "pro_cat"
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Paywall', { offering: route.params.offering, customVariables })}>
              <Text>
                Show paywall
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('FooterPaywall', { offering: route.params.offering, customVariables })}>
              <Text>
                Show paywall as footer
              </Text>
            </TouchableOpacity>
          </View>
          <CustomVariablesEditor
            isVisible={isEditorVisible}
            variables={customVariables}
            onSave={(vars) => {
              setCustomVariables(vars);
              setIsEditorVisible(false);
            }}
            onCancel={() => setIsEditorVisible(false)}
          />
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
                      {pkg.packageType !== 'LIFETIME' && (
                        <>
                          <Text style={styles.packageText}>{ pkg.product.pricePerWeekString } per week</Text>
                          <Text style={styles.packageText}>{ pkg.product.pricePerMonthString } per month</Text>
                          <Text style={styles.packageText}>{ pkg.product.pricePerYearString } per year</Text>
                        </>
                      )}
                    </View>

                    <View style={styles.buttonStack}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => { purchasePackage(pkg) }}>
                        <Text>Buy Package</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
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
                            style={styles.actionButton}
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
  customVariablesSection: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  editVariablesButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  editVariablesButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  variablesPreview: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  actionButton: {
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
  paywallsButtonStack: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
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
