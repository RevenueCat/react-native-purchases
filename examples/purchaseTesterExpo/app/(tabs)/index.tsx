import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, Platform, Modal } from 'react-native';
import { Text, View } from '@/components/Themed';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import Constants from 'expo-constants';

export default function TabOneScreen() {
  const [lastResult, setLastResult] = useState<string>('No method called yet');
  const [showModalPaywall, setShowModalPaywall] = useState(false);

  const getPlatformInfo = (): string => {
    if (Platform.OS === 'web') {
      return 'Browser';
    } else if (Constants.appOwnership === 'expo') {
      return Platform.OS === 'ios' ? 'Expo Go iOS' : 'Expo Go Android';
    } else {
      return Platform.OS === 'ios' ? 'Native iOS' : 'Native Android';
    }
  };

  const PlatformBanner = () => (
    <View style={styles.platformBanner}>
      <Text style={styles.platformBannerText}>Running on: {getPlatformInfo()}</Text>
    </View>
  );

  const formatResult = (methodName: string, result: any, error?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    if (error) {
      return `[${timestamp}] ${methodName} ERROR:\n${JSON.stringify(error, null, 2)}`;
    }
    return `[${timestamp}] ${methodName} SUCCESS:\n${JSON.stringify(result, null, 2)}`;
  };

  const callMethod = async (methodName: string, method: () => Promise<any>, params?: any) => {
    try {
      setLastResult(`[${new Date().toLocaleTimeString()}] Calling ${methodName}...`);
      const result = await method();
      setLastResult(formatResult(methodName, result));
    } catch (error) {
      setLastResult(formatResult(methodName, null, error));
    }
  };

  const MethodButton = ({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) => (
    <View style={[styles.button, disabled && styles.disabledButton]}>
      <Text 
        style={[styles.buttonText, disabled && styles.disabledButtonText]} 
        onPress={disabled ? undefined : onPress}
      >
        {title}
      </Text>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      {/* Platform Banner */}
      <PlatformBanner />
      
      {/* Results Area */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Last Method Result:</Text>
        <ScrollView style={styles.resultsScroll}>
          <Text style={styles.resultsText}>{lastResult}</Text>
        </ScrollView>
      </View>

      {/* Methods */}
      <ScrollView style={styles.methodsContainer}>
        
        {/* Configuration & Info */}
        <SectionHeader title="Configuration & Info" />
        <MethodButton 
          title="getAppUserID" 
          onPress={() => callMethod('getAppUserID', () => Purchases.getAppUserID())} 
        />
        <MethodButton 
          title="isAnonymous" 
          onPress={() => callMethod('isAnonymous', () => Purchases.isAnonymous())} 
        />
        <MethodButton 
          title="isConfigured" 
          onPress={() => callMethod('isConfigured', () => Purchases.isConfigured())} 
        />
        <MethodButton 
          title="canMakePayments" 
          onPress={() => callMethod('canMakePayments', () => Purchases.canMakePayments())} 
        />
        <MethodButton 
          title="getStorefront" 
          onPress={() => callMethod('getStorefront', () => Purchases.getStorefront())} 
        />

        {/* Customer Info & Authentication */}
        <SectionHeader title="Customer Info & Authentication" />
        <MethodButton 
          title="getCustomerInfo" 
          onPress={() => callMethod('getCustomerInfo', () => Purchases.getCustomerInfo())} 
        />
        <MethodButton 
          title="invalidateCustomerInfoCache" 
          onPress={() => callMethod('invalidateCustomerInfoCache', () => Purchases.invalidateCustomerInfoCache())} 
        />
        <MethodButton 
          title="logIn (test_user)" 
          onPress={() => callMethod('logIn', () => Purchases.logIn('test_user_' + Date.now()))} 
        />
        <MethodButton 
          title="logOut" 
          onPress={() => callMethod('logOut', () => Purchases.logOut())} 
        />
        <MethodButton 
          title="restorePurchases" 
          onPress={() => callMethod('restorePurchases', () => Purchases.restorePurchases())} 
        />

        {/* Offerings & Products */}
        <SectionHeader title="Offerings & Products" />
        <MethodButton 
          title="getOfferings" 
          onPress={() => callMethod('getOfferings', () => Purchases.getOfferings())} 
        />
        <MethodButton 
          title="syncAttributesAndOfferingsIfNeeded" 
          onPress={() => callMethod('syncAttributesAndOfferingsIfNeeded', () => Purchases.syncAttributesAndOfferingsIfNeeded())} 
        />
        <MethodButton 
          title="getCurrentOfferingForPlacement (test)" 
          onPress={() => callMethod('getCurrentOfferingForPlacement', () => Purchases.getCurrentOfferingForPlacement('test_placement'))} 
        />
        <MethodButton 
          title="getProducts (example IDs)" 
          onPress={() => callMethod('getProducts', () => Purchases.getProducts(['example_product_1', 'example_product_2']))} 
        />

        {/* Purchasing */}
        <SectionHeader title="Purchasing" />
        <MethodButton 
          title="purchasePackage (first package for current offering)" 
          onPress={async () => {
            try {
              const offerings = await Purchases.getOfferings();
              const currentOffering = offerings.current;
              if (!currentOffering) {
                Alert.alert('Note', 'No current offering found. Skipping purchase.');
                return
              }
              callMethod('purchasePackage', () => Purchases.purchasePackage(currentOffering.availablePackages[0]));
            } catch (error) {
              Alert.alert('Error', 'Error getting offerings: ' + error);
            }
          }} 
        />
        <MethodButton 
          title="syncPurchases" 
          onPress={() => callMethod('syncPurchases', () => Purchases.syncPurchases())} 
        />

        {/* iOS-specific Purchase Methods */}
        {Platform.OS === 'ios' && (
          <>
            <SectionHeader title="iOS Purchase Features" />
            <MethodButton 
              title="checkTrialOrIntroductoryPriceEligibility" 
              onPress={() => callMethod('checkTrialOrIntroductoryPriceEligibility', () => 
                Purchases.checkTrialOrIntroductoryPriceEligibility(['example_product_1'])
              )} 
            />
            <MethodButton 
              title="presentCodeRedemptionSheet" 
              onPress={() => callMethod('presentCodeRedemptionSheet', () => Purchases.presentCodeRedemptionSheet())} 
            />
            <MethodButton 
              title="recordPurchase (example)" 
              onPress={() => callMethod('recordPurchase', () => Purchases.recordPurchase('example_product_1'))} 
            />
            <MethodButton 
              title="enableAdServicesAttributionTokenCollection" 
              onPress={() => callMethod('enableAdServicesAttributionTokenCollection', () => Purchases.enableAdServicesAttributionTokenCollection())} 
            />
          </>
        )}

        {/* Subscriber Attributes */}
        <SectionHeader title="Subscriber Attributes" />
        <MethodButton 
          title="setEmail (test@example.com)" 
          onPress={() => callMethod('setEmail', () => Purchases.setEmail('test@example.com'))} 
        />
        <MethodButton 
          title="setPhoneNumber (+1234567890)" 
          onPress={() => callMethod('setPhoneNumber', () => Purchases.setPhoneNumber('+1234567890'))} 
        />
        <MethodButton 
          title="setDisplayName (Test User)" 
          onPress={() => callMethod('setDisplayName', () => Purchases.setDisplayName('Test User'))} 
        />
        <MethodButton 
          title="setPushToken (mock_token)" 
          onPress={() => callMethod('setPushToken', () => Purchases.setPushToken('mock_push_token_123'))} 
        />
        <MethodButton 
          title="setAttributes (multiple)" 
          onPress={() => callMethod('setAttributes', () => Purchases.setAttributes({
            'custom_attribute_1': 'value1',
            'custom_attribute_2': 'value2',
            'test_timestamp': new Date().toISOString()
          }))} 
        />
        <MethodButton 
          title="collectDeviceIdentifiers" 
          onPress={() => callMethod('collectDeviceIdentifiers', () => Purchases.collectDeviceIdentifiers())} 
        />

        {/* Attribution IDs */}
        <SectionHeader title="Attribution Integration IDs" />
        <MethodButton 
          title="setAdjustID (mock_adjust_id)" 
          onPress={() => callMethod('setAdjustID', () => Purchases.setAdjustID('mock_adjust_id_123'))} 
        />
        <MethodButton 
          title="setAppsflyerID (mock_appsflyer_id)" 
          onPress={() => callMethod('setAppsflyerID', () => Purchases.setAppsflyerID('mock_appsflyer_id_123'))} 
        />
        <MethodButton 
          title="setFBAnonymousID (mock_fb_id)" 
          onPress={() => callMethod('setFBAnonymousID', () => Purchases.setFBAnonymousID('mock_fb_anon_id_123'))} 
        />
        <MethodButton 
          title="setMparticleID (mock_mparticle_id)" 
          onPress={() => callMethod('setMparticleID', () => Purchases.setMparticleID('mock_mparticle_id_123'))} 
        />
        <MethodButton 
          title="setFirebaseAppInstanceID (mock_firebase_id)" 
          onPress={() => callMethod('setFirebaseAppInstanceID', () => Purchases.setFirebaseAppInstanceID('mock_firebase_id_123'))} 
        />

        {/* Campaign Attribution */}
        <SectionHeader title="Campaign Attribution" />
        <MethodButton 
          title="setMediaSource (test_source)" 
          onPress={() => callMethod('setMediaSource', () => Purchases.setMediaSource('test_media_source'))} 
        />
        <MethodButton 
          title="setCampaign (test_campaign)" 
          onPress={() => callMethod('setCampaign', () => Purchases.setCampaign('test_campaign_123'))} 
        />
        <MethodButton 
          title="setAdGroup (test_ad_group)" 
          onPress={() => callMethod('setAdGroup', () => Purchases.setAdGroup('test_ad_group_123'))} 
        />
        <MethodButton 
          title="setAd (test_ad)" 
          onPress={() => callMethod('setAd', () => Purchases.setAd('test_ad_123'))} 
        />
        <MethodButton 
          title="setKeyword (test_keyword)" 
          onPress={() => callMethod('setKeyword', () => Purchases.setKeyword('test_keyword_123'))} 
        />
        <MethodButton 
          title="setCreative (test_creative)" 
          onPress={() => callMethod('setCreative', () => Purchases.setCreative('test_creative_123'))} 
        />

        {/* Management Features */}
        <SectionHeader title="Management Features" />
        {Platform.OS === 'ios' && (
          <>
            <MethodButton 
              title="showManageSubscriptions" 
              onPress={() => callMethod('showManageSubscriptions', () => Purchases.showManageSubscriptions())} 
            />
            <MethodButton 
              title="beginRefundRequestForActiveEntitlement" 
              onPress={() => callMethod('beginRefundRequestForActiveEntitlement', () => Purchases.beginRefundRequestForActiveEntitlement())} 
            />
          </>
        )}
        <MethodButton 
          title="showInAppMessages" 
          onPress={() => callMethod('showInAppMessages', () => Purchases.showInAppMessages())} 
        />

        {/* Logging & Debugging */}
        <SectionHeader title="Logging & Debugging" />
        <MethodButton 
          title="setLogLevel (DEBUG)" 
          onPress={() => callMethod('setLogLevel', () => Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG))} 
        />
        <MethodButton 
          title="setLogLevel (INFO)" 
          onPress={() => callMethod('setLogLevel', () => Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO))} 
        />
        <MethodButton 
          title="setLogLevel (ERROR)" 
          onPress={() => callMethod('setLogLevel', () => Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR))} 
        />

        {/* Web Purchase Redemption */}
        <SectionHeader title="Web Purchase Redemption" />
        <MethodButton 
          title="parseAsWebPurchaseRedemption (mock URL)" 
          onPress={() => callMethod('parseAsWebPurchaseRedemption', () => 
            Purchases.parseAsWebPurchaseRedemption('https://revenuecat.com/redeem?token=mock_token_123')
          )} 
        />

        {/* Virtual Currencies */}
        <SectionHeader title="Virtual Currencies" />
        <MethodButton 
          title="getVirtualCurrencies" 
          onPress={() => callMethod('getVirtualCurrencies', () => Purchases.getVirtualCurrencies())} 
        />
        <MethodButton 
          title="invalidateVirtualCurrenciesCache" 
          onPress={() => callMethod('invalidateVirtualCurrenciesCache', () => Purchases.invalidateVirtualCurrenciesCache())} 
        />
        <MethodButton 
          title="getCachedVirtualCurrencies" 
          onPress={() => callMethod('getCachedVirtualCurrencies', () => Purchases.getCachedVirtualCurrencies())} 
        />

        {/* RevenueCat UI - Paywall Methods */}
        <SectionHeader title="RevenueCat UI - Paywall Methods" />
        <MethodButton 
          title="presentPaywall (default)" 
          onPress={() => callMethod('presentPaywall', () => RevenueCatUI.presentPaywall())} 
        />
        <MethodButton 
          title="presentPaywallIfNeeded (requiredEntitlementIdentifier: pro)" 
          onPress={() => callMethod('presentPaywallIfNeeded', () => RevenueCatUI.presentPaywallIfNeeded({ 
            requiredEntitlementIdentifier: 'pro',
            displayCloseButton: false
          }))} 
        />
        <MethodButton 
          title="Show Modal Paywall (Fullscreen)" 
          onPress={() => {
            setLastResult('[' + new Date().toLocaleTimeString() + '] Opening modal paywall...');
            setShowModalPaywall(true);
          }} 
        />

        {/* RevenueCat UI - Customer Center */}
        <SectionHeader title="RevenueCat UI - Customer Center" />
        <MethodButton 
          title="presentCustomerCenter" 
          onPress={() => callMethod('presentCustomerCenter', () => RevenueCatUI.presentCustomerCenter())} 
        />
        <MethodButton 
          title="presentCustomerCenter (with callbacks)" 
          onPress={() => callMethod('presentCustomerCenter', () => RevenueCatUI.presentCustomerCenter({
            callbacks: {
              onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }) => {
                console.log('Feedback survey completed:', feedbackSurveyOptionId);
              },
              onShowingManageSubscriptions: () => {
                console.log('Showing manage subscriptions');
              },
              onRestoreCompleted: ({ customerInfo }) => {
                console.log('Restore completed:', customerInfo);
              },
              onRestoreFailed: ({ error }) => {
                console.log('Restore failed:', error);
              },
              onRestoreStarted: () => {
                console.log('Restore started');
              },
              onRefundRequestStarted: ({ productIdentifier }) => {
                console.log('Refund request started:', productIdentifier);
              },
              onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }) => {
                console.log('Refund request completed:', productIdentifier, refundRequestStatus);
              },
              onManagementOptionSelected: (event) => {
                console.log('Management option selected:', event);
              }
            }
          }))} 
        />

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modal Paywall */}
      <Modal
        visible={showModalPaywall}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowModalPaywall(false)}
      >
        <View style={styles.modalContainer}>
          <RevenueCatUI.Paywall
            options={{
              displayCloseButton: true,
              offering: null,
              fontFamily: null
            }}
            onPurchaseStarted={({ packageBeingPurchased }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase started for: ${packageBeingPurchased.identifier}`);
            }}
            onPurchaseCompleted={({ customerInfo, storeTransaction }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase completed! Transaction: ${storeTransaction.transactionIdentifier}`);
              setShowModalPaywall(false);
            }}
            onPurchaseError={({ error }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase error: ${error.message}`);
            }}
            onPurchaseCancelled={() => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase cancelled`);
            }}
            onRestoreStarted={() => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Restore started`);
            }}
            onRestoreCompleted={({ customerInfo }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Restore completed`);
            }}
            onRestoreError={({ error }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Restore error: ${error.message}`);
            }}
            onDismiss={() => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Modal paywall dismissed`);
              setShowModalPaywall(false);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  platformBanner: {
    backgroundColor: '#28A745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  platformBannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    height: 200,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultsScroll: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 8,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  methodsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#2f95dc',
    borderBottomWidth: 1,
    borderBottomColor: '#2f95dc',
    paddingBottom: 5,
  },
  button: {
    backgroundColor: '#2f95dc',
    padding: 12,
    marginVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#999',
  },
  bottomPadding: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
