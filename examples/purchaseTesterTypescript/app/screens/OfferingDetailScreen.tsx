import React, { useState } from 'react';

import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, } from 'react-native';

import Purchases, {
  GoogleProductChangeInfo,
  PRORATION_MODE,
  PurchasesPackage,
  PurchasesStoreProduct,
  SubscriptionOption
} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList'
import { useCustomVariables } from '../context/CustomVariablesContext';
import { purchasesAreCompletedByMyApp } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'OfferingDetail'>;

type PurchaseWithOptionalProductChangeInfo = {
  productIdentifier: string;
  purchase: () => void;
  purchaseWithProductChange: (productChangeInfo: GoogleProductChangeInfo) => void;
}

type PickerModalOption = {
  title: string;
  onPress: () => void;
}

type PickerModalState = {
  title: string;
  options: PickerModalOption[];
  onCancel: () => void;
}

const prorationModeOptions = [
  {
    title: 'IMMEDIATE_WITH_TIME_PRORATION',
    value: PRORATION_MODE.IMMEDIATE_WITH_TIME_PRORATION,
  },
  {
    title: 'IMMEDIATE_AND_CHARGE_PRORATED_PRICE',
    value: PRORATION_MODE.IMMEDIATE_AND_CHARGE_PRORATED_PRICE,
  },
  {
    title: 'IMMEDIATE_WITHOUT_PRORATION',
    value: PRORATION_MODE.IMMEDIATE_WITHOUT_PRORATION,
  },
  {
    title: 'DEFERRED',
    value: PRORATION_MODE.DEFERRED,
  },
  {
    title: 'IMMEDIATE_AND_CHARGE_FULL_PRICE',
    value: PRORATION_MODE.IMMEDIATE_AND_CHARGE_FULL_PRICE,
  },
];

// Taken from https://reactnative.dev/docs/typescript
const OfferingDetailScreen: React.FC<Props> = ({ route, navigation }: Props) => {
  const { customVariables } = useCustomVariables();
  const [productChangeProductIds, setProductChangeProductIds] = useState<Record<string, boolean>>({});
  const [pickerModal, setPickerModal] = useState<PickerModalState | null>(null);

  const purchasePackage = (pkg: PurchasesPackage, productChangeInfo?: GoogleProductChangeInfo) => {
    Purchases.purchasePackage(pkg, null, productChangeInfo).then(() => {
    }).catch((err) => {
      console.log("error", err)
    });
  }

  const purchaseProduct = (product: PurchasesStoreProduct, productChangeInfo?: GoogleProductChangeInfo) => {
    Purchases.purchaseStoreProduct(product, productChangeInfo).then((result) => {
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

  const updateProductChange = (productIdentifier: string, isProductChange: boolean) => {
    setProductChangeProductIds({
      ...productChangeProductIds,
      [productIdentifier]: isProductChange,
    });
  }

  const purchaseWithOptionalProductChange = ({
    productIdentifier,
    purchase,
    purchaseWithProductChange,
  }: PurchaseWithOptionalProductChangeInfo) => {
    if (productChangeProductIds[productIdentifier]) {
      promptForProductChangeInfo(purchaseWithProductChange);
    } else {
      purchase();
    }
  }

  const promptForProductChangeInfo = (callback: (productChangeInfo: GoogleProductChangeInfo) => void) => {
    showOldProductIdPicker((oldProductIdentifier) => {
      if (oldProductIdentifier == null) {
        return;
      }

      showProrationModePicker((prorationMode) => {
        if (prorationMode == null) {
          return;
        }

        callback({
          oldProductIdentifier,
          prorationMode,
        });
      });
    });
  }

  const showOldProductIdPicker = async (callback: (oldProductIdentifier: string | null) => void) => {
    try {
      await Purchases.invalidateCustomerInfoCache();
      const customerInfo = await Purchases.getCustomerInfo();
      const activeProductIds = Array.from(
        new Set(customerInfo.activeSubscriptions.map((productId) => productId.split(':')[0]))
      );

      if (activeProductIds.length === 0) {
        Alert.alert('Cannot upgrade without an existing active subscription.');
        callback(null);
        return;
      }

      showPickerModal(
        'Choose which active sub to switch from',
        activeProductIds.map((productId) => ({
          title: productId,
          value: productId,
        })),
        callback,
        () => callback(null),
      );
    } catch (err) {
      console.log("error", err)
      Alert.alert('Error fetching customer info', String(err));
      callback(null);
    }
  }

  const showProrationModePicker = (callback: (prorationMode: PRORATION_MODE | null) => void) => {
    showPickerModal(
      'Choose ProrationMode',
      prorationModeOptions,
      callback,
      () => callback(null),
    );
  }

  const showPickerModal = <T,>(
    title: string,
    options: Array<{ title: string; value: T }>,
    onSelect: (value: T) => void,
    onCancel: () => void,
  ) => {
    setPickerModal({
      title,
      options: options.map((option) => ({
        title: option.title,
        onPress: () => {
          setPickerModal(null);
          onSelect(option.value);
        },
      })),
      onCancel: () => {
        setPickerModal(null);
        onCancel();
      },
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
        style={styles.container}>
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
                    <View style={styles.paywallsButtonStack}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => RevenueCatUI.presentPaywall({
                offering: route.params.offering,
                customVariables: customVariables,
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
                customVariables: customVariables,
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
              style={[styles.actionButton, !purchasesAreCompletedByMyApp && styles.disabledButton]}
              disabled={!purchasesAreCompletedByMyApp}
              onPress={() => navigation.navigate('PurchaseLogicPaywall', { offering: route.params.offering })}>
              <Text style={!purchasesAreCompletedByMyApp && styles.disabledText}>
                {purchasesAreCompletedByMyApp
                  ? 'Show paywall with custom PurchaseLogic'
                  : 'Show paywall with custom PurchaseLogic\n(Enable purchasesAreCompletedByMyApp)'}
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
                        onPress={() => {
                          purchaseWithOptionalProductChange({
                            productIdentifier: pkg.product.identifier,
                            purchase: () => purchasePackage(pkg),
                            purchaseWithProductChange: (productChangeInfo: GoogleProductChangeInfo) =>
                              purchasePackage(pkg, productChangeInfo),
                          })
                        }}>
                        <Text>Buy Package</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          purchaseWithOptionalProductChange({
                            productIdentifier: pkg.product.identifier,
                            purchase: () => purchaseProduct(pkg.product),
                            purchaseWithProductChange: (productChangeInfo: GoogleProductChangeInfo) =>
                              purchaseProduct(pkg.product, productChangeInfo),
                          })
                        }}>
                        <Text>Buy Product</Text>
                      </TouchableOpacity>

                      <View style={styles.productChangeContainer}>
                        <Text>Is product change</Text>
                        <Switch
                          value={productChangeProductIds[pkg.product.identifier] ?? false}
                          onValueChange={(value) => updateProductChange(pkg.product.identifier, value)}
                        />
                      </View>
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
          <Modal
            animationType="fade"
            transparent={true}
            visible={pickerModal != null}
            onRequestClose={pickerModal?.onCancel}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{pickerModal?.title}</Text>
                {pickerModal?.options.map((option) => (
                  <TouchableOpacity
                    key={option.title}
                    style={styles.modalOption}
                    onPress={option.onPress}>
                    <Text>{option.title}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.modalOption, styles.modalCancelOption]}
                  onPress={pickerModal?.onCancel}>
                  <Text>Cancel purchase</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  actionButton: {
    backgroundColor: "lightcoral",
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 4
  },
  productChangeContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 10,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    alignSelf: "stretch",
    backgroundColor: "white",
    borderRadius: 4,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalOption: {
    borderTopColor: "#CCCCCC",
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  modalCancelOption: {
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#d3d3d3",
  },
  disabledText: {
    color: "#888",
    textAlign: "center" as const,
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
