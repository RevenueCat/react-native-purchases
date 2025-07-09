import React, {useEffect, useState} from 'react';

import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
} from 'react-native-purchases';
import RevenueCatUI, { CustomerCenterManagementOption, CustomerCenterManagementOptionEvent } from 'react-native-purchases-ui';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import CustomerInfoHeader from '../components/CustomerInfoHeader';
import RootStackParamList from '../RootStackParamList';
import PromptWithTextInput from '../components/InputModal';
import PaywallScreen from './PaywallScreen';
import { PurchasesError, REFUND_REQUEST_STATUS } from '@revenuecat/purchases-typescript-internal';

interface State {
  appUserID: String | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isAnonymous: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerInfo'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const initialState: State = {
    appUserID: null,
    customerInfo: null,
    offerings: null,
    isAnonymous: true,
  };
  const [state, setState] = useState(initialState);

  // The functional way of componentDidMount
  useEffect(() => {
    // Refetch data when customer info is updated (login, logout)
    // Fetches new data, updates state, and updates
    // props in subviews and components
    //
    // Weird: This listener doesn't always get called so
    // currently passing fetchData to components and screens
    // so everything can be refreshed
    Purchases.addCustomerInfoUpdateListener(fetchData);

    // Oddly the cleanest way to call an async function
    // from a non-asyn function
    setTimeout(fetchData, 1);
  }, []);

  // Gets customer info, app user id, if user is anonymous, and offerings
  const fetchData = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const appUserID = await Purchases.getAppUserID();
      const storefront = await Purchases.getStorefront();
      const isAnonymous = await Purchases.isAnonymous();
      const offerings = await Purchases.getOfferings();

      console.log('Storefront: ', storefront);

      setState(prevState => ({
        appUserID,
        customerInfo: customerInfo,
        offerings,
        isAnonymous,
      }));
    } catch (e) {
      console.log('Purchases Error', e);
    }
  };

  const displayOfferings = () => {
    const offerings = Object.values(state.offerings?.all ?? {});

    const sections = offerings
      .sort((a, b) => {
        return a.identifier.localeCompare(b.identifier);
      })
      .map(offering => {
        const titleParts = [offering.serverDescription];
        if (offering.identifier === state.offerings?.current?.identifier) {
          titleParts.push('(current)');
        }
        const title = titleParts.join(' ');

        return (
          <TouchableOpacity
            key={offering.identifier}
            onPress={() =>
              navigation.navigate('OfferingDetail', {offering: offering})
            }>
            <View style={styles.offerContainer}>
              <Text style={styles.offerTitle}>{title}</Text>
              <Text style={styles.offerDescription}>{offering.identifier}</Text>
              <Text style={styles.offerDescription}>
                {offering.availablePackages.length} package(s)
              </Text>
            </View>
          </TouchableOpacity>
        );
      });

    if (sections.length > 0) {
      return sections;
    } else {
      return <Text>No offerings</Text>;
    }
  };

  const getByPlacement = async () => {
    setPromptPlacementVisible(true);
  };

  const syncAttributesAndOfferings = async () => {
    try {
      const offerings = await Purchases.syncAttributesAndOfferingsIfNeeded();
      console.log('offerings after sync', offerings);
      setState({...state, offerings: offerings});
    } catch (error) {
      console.log('error', error);
    }
  };

  const makePurchase = async () => {
    Alert.prompt('Purchase Product', 'Enter Product ID for purchasing', [
      {
        text: 'Cancel',
        onPress: () => {
          console.log('Cancel');
        },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async text => {
          if (text && text.length > 0) {
            await Purchases.purchaseProduct(text);
          }
        },
      },
    ]);
  };

  const redeemCode = async () => {
    try {
      const rtn = await Purchases.presentCodeRedemptionSheet();
    } catch {
      console.log('error');
    }
  };

  const showManageSubscriptions = async () => {
    try {
      await Purchases.showManageSubscriptions();
    } catch (error) {
      console.log(`Error showing sheet for managing subscriptions: ${error}`);
    }
  };

  const showInAppMessages = async () => {
    try {
      await Purchases.showInAppMessages();
      console.log('Shown messages successfully');
    } catch {
      console.log('Error showing in-app messages: ${error}');
    }
  };

  const [promptPlacementVisible, setPromptPlacementVisible] = useState(false);
  const [paywallModalVisible, setPaywallModalVisible] = useState(false);

  const handlePromptPlacementCancel = () => {
    setPromptPlacementVisible(false);
    console.log('User canceled input');
  };
  const handlePromptPlacementSubmit = async inputValue => {
    setPromptPlacementVisible(false);
    console.log('User submitted:', inputValue);

    if (inputValue && inputValue.length > 0) {
      let offering = await Purchases.getCurrentOfferingForPlacement(inputValue);
      console.log('Offering in RN: ', offering);
      if (offering) {
        navigation.navigate('OfferingDetail', {offering: offering});
      }
    }
  };

  const openPaywallModal = () => {
    setPaywallModalVisible(true);
  };

  const closePaywallModal = () => {
    setPaywallModalVisible(false);
  };

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CustomerInfo', {
                appUserID: state.appUserID,
                customerInfo: state.customerInfo,
              })
            }>
            <CustomerInfoHeader
              appUserID={state.appUserID}
              customerInfo={state.customerInfo}
              isAnonymous={state.isAnonymous}
              refreshData={fetchData}
            />
          </TouchableOpacity>
        </View>

        <Divider />

        <View>{displayOfferings()}</View>

        <PromptWithTextInput
          isVisible={promptPlacementVisible}
          onCancel={handlePromptPlacementCancel}
          onSubmit={handlePromptPlacementSubmit}
        />

        <Divider />
        <View>
          <TouchableOpacity onPress={getByPlacement}>
            <Text style={styles.otherActions}>Offering by Placement</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={syncAttributesAndOfferings}>
            <Text style={styles.otherActions}>
              Sync attributes and offerings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={makePurchase}>
            <Text style={styles.otherActions}>Purchase by Product ID</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={redeemCode}>
            <Text style={styles.otherActions}>Redeem Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={showManageSubscriptions}>
            <Text style={styles.otherActions}>Manage Subscriptions</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={showInAppMessages}>
            <Text style={styles.otherActions}>Show In-App messages</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() => navigation.navigate('Paywall', {offering: null})}>
            <Text style={styles.otherActions}>Go to Paywall Screen</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openPaywallModal}>
            <Text style={styles.otherActions}>Go to Paywall Screen as Modal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('FooterPaywall', {offering: null})
            }>
            <Text style={styles.otherActions}>
              Go to Paywall Screen as Footer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Paywall', {
                offering: null,
                fontFamily: 'Ubuntu',
              })
            }>
            <Text style={styles.otherActions}>
              Go to Paywall Screen with custom font
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('FooterPaywall', {
                offering: null,
                fontFamily: 'Ubuntu',
              })
            }>
            <Text style={styles.otherActions}>
              Go to Paywall Screen as Footer with custom font
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
                requiredEntitlementIdentifier: 'pro_cat',
                displayCloseButton: true,
              });
              console.log('Paywall result: ', paywallResult);
            }}>
            <Text style={styles.otherActions}>
              Present paywall if needed ("pro_cat")
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const paywallResult = await RevenueCatUI.presentPaywall({
                displayCloseButton: true,
              });
              console.log('Paywall result: ', paywallResult);
            }}>
            <Text style={styles.otherActions}>Present paywall</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              try {
                await RevenueCatUI.presentCustomerCenter({
                  callbacks: {
                    onFeedbackSurveyCompleted: ({feedbackSurveyOptionId}: {feedbackSurveyOptionId: string}) => {
                      console.log('📊 CUSTOMER CENTER - Feedback survey completed with option ID:', feedbackSurveyOptionId);
                    },
                    onShowingManageSubscriptions: () => {
                      console.log('📲 CUSTOMER CENTER - Showing manage subscriptions');
                    },
                    onRestoreStarted: () => {
                      console.log('🔄 CUSTOMER CENTER - Restore started');
                    },
                    onRestoreCompleted: ({customerInfo}: {customerInfo: CustomerInfo}) => {
                      console.log('✅ CUSTOMER CENTER - Restore completed successfully');
                      console.log('   • Active entitlements:', Object.keys(customerInfo.entitlements.active).join(', ') || 'none');
                      console.log('   • Original app user ID:', customerInfo.originalAppUserId);
                      console.log('   • Latest expiration date:', customerInfo.latestExpirationDate || 'none');
                    },
                    onRestoreFailed: ({error}: {error: PurchasesError}) => {
                      console.log('❌ CUSTOMER CENTER - Restore failed', error);
                      console.log('   • Error code:', error.code);
                      console.log('   • Error message:', error.message);
                      console.log('   • Error underlying error:', error.underlyingErrorMessage || 'none');
                    },
                    onRefundRequestStarted: ({productIdentifier}: {productIdentifier: string}) => {
                      console.log('💰 CUSTOMER CENTER - Refund request started for product:', productIdentifier);
                    },
                    onRefundRequestCompleted: ({productIdentifier, refundRequestStatus}: {productIdentifier: string, refundRequestStatus: REFUND_REQUEST_STATUS}) => {
                      console.log('✅ CUSTOMER CENTER - Refund request completed for product:', productIdentifier, 'with status:', refundRequestStatus);
                    },
                    onManagementOptionSelected: ({option, url}: CustomerCenterManagementOptionEvent) => {
                      if (option === 'custom_url') {
                        console.log('🔍 CUSTOMER CENTER - Management option selected:', option, 'with URL:', url);
                      } else {
                        console.log('🔍 CUSTOMER CENTER - Management option selected:', option);
                      }
                    }
                  }
                });
                console.log('✨ CUSTOMER CENTER - Presented successfully');
              } catch (error) {
                console.error('❌ CUSTOMER CENTER - Error presenting Customer Center:', error);
              }
            }}>
            <Text style={styles.otherActions}>Present customer center</Text>
          </TouchableOpacity>
        </View>

        <Divider />
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate('WinBackTesting', {})}>
            <Text style={styles.otherActions}>Win-Back Offer Testing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={paywallModalVisible}
        presentationStyle="pageSheet"
        onRequestClose={closePaywallModal}>
        <RevenueCatUI.MyView />
      </Modal>
    </SafeAreaView>
  );
};

const Divider: React.FC<{}> = () => {
  return (
    <View
      style={{
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        marginHorizontal: 20,
        marginVertical: 20,
      }}
    />
  );
};

const styles = StyleSheet.create({
  offerContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  otherActions: {
    fontSize: 16,
    textAlign: 'center',
    color: 'dodgerblue',
    marginVertical: 5,
  },
});

export default HomeScreen;
