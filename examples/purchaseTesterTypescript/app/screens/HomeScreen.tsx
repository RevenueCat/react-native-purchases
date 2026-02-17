import React, {useEffect, useRef, useState} from 'react';

import {
  Modal,
  Alert,
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
import { PurchasesError, REFUND_REQUEST_STATUS } from '@revenuecat/purchases-typescript-internal';
import { useCustomVariables } from '../context/CustomVariablesContext';

interface State {
  appUserID: String | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isAnonymous: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerInfo'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const { customVariables } = useCustomVariables();

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customerCenterNotification, setCustomerCenterNotification] = useState<{
    title: string;
    message?: string;
  } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const formatNotificationPayload = (payload?: Record<string, unknown>) => {
    if (!payload || Object.keys(payload).length === 0) {
      return undefined;
    }
    try {
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      console.warn('Failed to format Customer Center payload', error);
      return String(payload);
    }
  };

  const showCustomerCenterNotification = (callbackName: string, payload?: Record<string, unknown>) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setCustomerCenterNotification({
      title: callbackName,
      message: formatNotificationPayload(payload),
    });
    notificationTimeoutRef.current = setTimeout(() => {
      setCustomerCenterNotification(null);
    }, 4000);
  };

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

  const onDismissCustomerCenter = () => {
    showCustomerCenterNotification('onDismiss');
    setIsModalVisible(false);
  };

  const onCustomActionSelected = (event: {actionId: string}) => {
    showCustomerCenterNotification('onCustomActionSelected', {
      actionId: event.actionId,
    });
    console.log('Custom action selected:', event.actionId);
  };

  return (
    <SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={onDismissCustomerCenter}
      >
        <View style={styles.modalOverlay}>
          <RevenueCatUI.CustomerCenterView
            style={styles.modalContent}
            shouldShowCloseButton={true}
            onDismiss={onDismissCustomerCenter}
            onCustomActionSelected={({actionId, purchaseIdentifier}) => {
              showCustomerCenterNotification('onCustomActionSelected', {
                actionId,
                purchaseIdentifier: purchaseIdentifier ?? null,
              });
              console.log('[CustomerCenter Modal] Custom action selected:', actionId, 'purchaseIdentifier:', purchaseIdentifier);
            }}
            onFeedbackSurveyCompleted={({feedbackSurveyOptionId}) => {
              showCustomerCenterNotification('onFeedbackSurveyCompleted', {feedbackSurveyOptionId});
            }}
            onShowingManageSubscriptions={() => {
              showCustomerCenterNotification('onShowingManageSubscriptions');
            }}
            onRestoreStarted={() => {
              showCustomerCenterNotification('onRestoreStarted');
            }}
            onRestoreCompleted={({customerInfo}) => {
              const activeEntitlements = Object.keys(customerInfo.entitlements.active ?? {});
              showCustomerCenterNotification('onRestoreCompleted', {
                originalAppUserId: customerInfo.originalAppUserId,
                activeEntitlements,
              });
            }}
            onRestoreFailed={({error}) => {
              showCustomerCenterNotification('onRestoreFailed', {
                code: error.code,
                message: error.message,
              });
            }}
            onRefundRequestStarted={({productIdentifier}) => {
              showCustomerCenterNotification('onRefundRequestStarted', {productIdentifier});
            }}
            onRefundRequestCompleted={({productIdentifier, refundRequestStatus}) => {
              showCustomerCenterNotification('onRefundRequestCompleted', {
                productIdentifier,
                refundRequestStatus,
              });
            }}
            onManagementOptionSelected={({option, url}) => {
              showCustomerCenterNotification('onManagementOptionSelected', {option, url: url ?? null});
            }}
          />
        </View>
      </Modal>
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

          <TouchableOpacity
            onPress={() => navigation.navigate('VirtualCurrency', {})}>
            <Text style={styles.otherActions}>Virtual Currency Testing Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CustomVariables')}>
            <Text style={styles.otherActions}>Custom Variables</Text>
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
          <TouchableOpacity
            onPress={() => navigation.navigate('PaywallModalNoHeader', {})}>
            <Text style={styles.otherActions}>Go to Paywall Modal (no header)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('PaywallModalWithHeader', {})}>
            <Text style={styles.otherActions}>Go to Paywall Modal (with header)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerCenterModalNoHeader', { shouldShowCloseButton: true })}>
            <Text style={styles.otherActions}>Go to Customer Center Modal (no header)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerCenterModalWithHeader', { shouldShowCloseButton: false })}>
            <Text style={styles.otherActions}>Go to Customer Center Modal (with header)</Text>
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
            onPress={() =>
              navigation.navigate('PurchaseLogicPaywall', {offering: null})
            }>
            <Text style={styles.otherActions}>
              Go to Paywall with custom PurchaseLogic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
                requiredEntitlementIdentifier: 'pro_cat',
                displayCloseButton: true,
                customVariables: customVariables,
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
                customVariables: customVariables,
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
                      showCustomerCenterNotification('onFeedbackSurveyCompleted', {feedbackSurveyOptionId});
                      console.log('📊 CUSTOMER CENTER - Feedback survey completed with option ID:', feedbackSurveyOptionId);
                    },
                    onShowingManageSubscriptions: () => {
                      showCustomerCenterNotification('onShowingManageSubscriptions');
                      console.log('📲 CUSTOMER CENTER - Showing manage subscriptions');
                    },
                    onRestoreStarted: () => {
                      showCustomerCenterNotification('onRestoreStarted');
                      console.log('🔄 CUSTOMER CENTER - Restore started');
                    },
                    onRestoreCompleted: ({customerInfo}: {customerInfo: CustomerInfo}) => {
                      const activeEntitlements = Object.keys(customerInfo.entitlements.active ?? {});
                      showCustomerCenterNotification('onRestoreCompleted', {
                        originalAppUserId: customerInfo.originalAppUserId,
                        activeEntitlements,
                      });
                      console.log('✅ CUSTOMER CENTER - Restore completed successfully');
                      console.log('   • Active entitlements:', Object.keys(customerInfo.entitlements.active).join(', ') || 'none');
                      console.log('   • Original app user ID:', customerInfo.originalAppUserId);
                      console.log('   • Latest expiration date:', customerInfo.latestExpirationDate || 'none');
                    },
                    onRestoreFailed: ({error}: {error: PurchasesError}) => {
                      showCustomerCenterNotification('onRestoreFailed', {
                        code: error.code,
                        message: error.message,
                      });
                      console.log('❌ CUSTOMER CENTER - Restore failed', error);
                      console.log('   • Error code:', error.code);
                      console.log('   • Error message:', error.message);
                      console.log('   • Error underlying error:', error.underlyingErrorMessage || 'none');
                    },
                    onRefundRequestStarted: ({productIdentifier}: {productIdentifier: string}) => {
                      showCustomerCenterNotification('onRefundRequestStarted', {productIdentifier});
                      console.log('💰 CUSTOMER CENTER - Refund request started for product:', productIdentifier);
                    },
                    onRefundRequestCompleted: ({productIdentifier, refundRequestStatus}: {productIdentifier: string, refundRequestStatus: REFUND_REQUEST_STATUS}) => {
                      showCustomerCenterNotification('onRefundRequestCompleted', {
                        productIdentifier,
                        refundRequestStatus,
                      });
                      console.log('✅ CUSTOMER CENTER - Refund request completed for product:', productIdentifier, 'with status:', refundRequestStatus);
                    },
                    onManagementOptionSelected: ({option, url}: CustomerCenterManagementOptionEvent) => {
                      showCustomerCenterNotification('onManagementOptionSelected', {option, url: url ?? null});
                      if (option === 'custom_url') {
                        console.log('🔍 CUSTOMER CENTER - Management option selected:', option, 'with URL:', url);
                      } else {
                        console.log('🔍 CUSTOMER CENTER - Management option selected:', option);
                      }
                    },
                    onCustomActionSelected: ({actionId, purchaseIdentifier}: {actionId: string; purchaseIdentifier: string | null}) => {
                      showCustomerCenterNotification('onCustomActionSelected', {
                        actionId,
                        purchaseIdentifier: purchaseIdentifier ?? null,
                      });
                      console.log('🎯 CUSTOMER CENTER - Custom action selected:', actionId, 'purchaseIdentifier:', purchaseIdentifier);
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
          <TouchableOpacity onPress={() => navigation.navigate('CustomerCenterScreen', { shouldShowCloseButton: false })}>
            <Text style={styles.otherActions}>Go to Customer Center (push)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={styles.otherActions}>Go to Customer Center (modal)</Text>
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

      {customerCenterNotification && (
        <View style={styles.toastWrapper} pointerEvents="none">
          <View style={styles.toastContainer}>
            <Text style={styles.toastTitle}>{customerCenterNotification.title}</Text>
            {customerCenterNotification.message ? (
              <Text style={styles.toastMessage}>{customerCenterNotification.message}</Text>
            ) : null}
          </View>
        </View>
      )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white'
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
  toastContainer: {
    maxWidth: '90%',
    backgroundColor: 'rgba(33, 37, 41, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  toastTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  toastMessage: {
    color: '#f1f3f5',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default HomeScreen;
