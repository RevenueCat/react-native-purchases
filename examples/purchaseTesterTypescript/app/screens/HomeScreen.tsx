import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Purchases, { PurchaserInfo, PurchasesOfferings } from 'react-native-purchases';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import APIKeys from '../APIKeys';
import CustomerInfoHeader from '../components/CustomerInfoHeader';
import RootStackParamList from '../RootStackParamList'

interface State {
  appUserID: String | null;
  purchaserInfo: PurchaserInfo | null;
  offerings: PurchasesOfferings | null;
  isAnonymous: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerInfo'>;

const HomeScreen: React.FC<Props> = ({
  navigation
}) => {
  const initialState: State = {
    appUserID: null,
    purchaserInfo: null,
    offerings: null,
    isAnonymous: true
  }
  const [state, setState] = useState(initialState);

  // The functional way of componentDidMount
  useEffect(() => {
    if (!isSetup()) { return }

    Purchases.setDebugLogsEnabled(true);
    if (Platform.OS == "android") {
      Purchases.setup(APIKeys.google);
    } else {
      Purchases.setup(APIKeys.apple);
    }

    // Refetch data when purchaser info is updated (login, logout)
    // Fetches new data, updates state, and updates
    // props in subviews and components
    Purchases.addPurchaserInfoUpdateListener((purchaserInfo) => {
      fetchData();
    })
    fetchData();

    return () => {
      // Unmount but we won't use
    };
  }, []);

  // Gets purchaser info, app user id, if user is anonymous, and offerings
  const fetchData = async () => {
    try {
      const purchaserInfo = await Purchases.getPurchaserInfo();
      const appUserID = await Purchases.getAppUserID();
      const isAnonymous = await Purchases.isAnonymous();
      const offerings = await Purchases.getOfferings();

      setState((prevState) => (
        { appUserID, purchaserInfo, offerings, isAnonymous }
      ));
    } catch (e) {
      console.log("Purchases Error", e);
    }
  };

  const displayOfferings = () => {
    const offerings = Object.values(state.offerings?.all ?? {});
    
    const sections = offerings.sort((a, b) => {
      return a.identifier.localeCompare(b.identifier)
    }).map((offering) => {
      const titleParts = [offering.serverDescription];
      if (offering.identifier === state.offerings?.current?.identifier) {
        titleParts.push('(current)');
      }
      const title = titleParts.join(' ');

      return (
        <TouchableOpacity
          key={offering.identifier}
          onPress={() => navigation.navigate('OfferingDetail', { offering: offering })}>
          <View style={styles.offerContainer}>
            <Text style={styles.offerTitle}>{ title }</Text>
            <Text style={styles.offerDescription}>{ offering.identifier }</Text>
            <Text style={styles.offerDescription}>{ offering.availablePackages.length } package(s)</Text>
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

  const makePurchase = async () => {
    Alert.prompt(
      "Purchase Product",
      "Enter Product ID for purchasing",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancel")
          },
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async (text) => {
            if (text && text.length > 0) {
              await Purchases.purchaseProduct(text)
            }
          }
        }
      ]
    );
  }
  
  const redeemCode = async() => {
    try {
      const rtn = await Purchases.presentCodeRedemptionSheet();
    } catch {
      console.log("error")
    }
  }

  const isSetup = () => {
    return APIKeys.apple.length > 0 || APIKeys.google.length > 0;
  }
  
  return !isSetup() ? (
      <Text>Update RevenueCat API Keys in APIKeys.tsx</Text>
    ) : (
      <SafeAreaView>
        <ScrollView
            contentInsetAdjustmentBehavior="automatic">

            <View>
              <TouchableOpacity
                onPress={() => navigation.navigate('CustomerInfo', { appUserID: state.appUserID, purchaserInfo: state.purchaserInfo })}>
                <CustomerInfoHeader 
                  appUserID={state.appUserID}
                  customerInfo={state.purchaserInfo} 
                  isAnonymous={state.isAnonymous}
                  />
              </TouchableOpacity>
            </View>

            <Divider />

            <View>
              { displayOfferings() }
            </View>

            <Divider />

            <View>
              <TouchableOpacity
                onPress={makePurchase} >
                  <Text style={styles.otherActions}>
                    Purchase by Product ID
                  </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={redeemCode} >
                  <Text style={styles.otherActions}>
                    Redeem Code
                  </Text>
              </TouchableOpacity>
            </View>
        </ScrollView>
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
        marginVertical: 20
      }}
    />
  );
}

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
    textAlign: "center",
    color: "dodgerblue",
    marginVertical: 5
  }
});

export default HomeScreen;