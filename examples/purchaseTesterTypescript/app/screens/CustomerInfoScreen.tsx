import React, { useEffect, useState } from 'react';

import {
  Alert,
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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList'

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerInfo'>;

const Section: React.FC<{
  title: String;
  value: String | string | null | undefined;
}> = ({title, value}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {value ?? 'N/A'}
      </Text>
    </View>
  );
};

const InfoTab: React.FC<{
  appUserID: String | null;
  purchaserInfo: PurchaserInfo | null;
}> = ({appUserID, purchaserInfo}) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Section title='App User ID' value={appUserID} />
        <Section title='Original App User ID' value={purchaserInfo?.originalAppUserId} />
        <Section title='First Seen' value={purchaserInfo?.firstSeen} />
        <Section title='Original Application Version' value={purchaserInfo?.originalApplicationVersion} />
        <Section title='Original Purchase Date' value={purchaserInfo?.originalPurchaseDate} />
        <Section title='Latest Expiration Date' value={purchaserInfo?.latestExpirationDate} />
        <Section title='Request Date' value={purchaserInfo?.requestDate} />
    </ScrollView>
  );
};

const EntitlementsTab: React.FC<{
  purchaserInfo: PurchaserInfo | null;
}> = ({purchaserInfo}) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const entitlements = Object.values(purchaserInfo?.entitlements.all ?? []);
  const activeEntitlementIdentifiers = entitlements.filter((entitlement) => {
    return entitlement.isActive;
  }).map((entitlement) => {return entitlement.identifier});
  const inactiveEntitlementIdentifiers = entitlements.filter((entitlement) => {
    return !entitlement.isActive;
  }).map((entitlement) => {return entitlement.identifier});

  const displayString = (activeEntitlementIdentifiers: string[]) => {
    if (activeEntitlementIdentifiers.length > 0) {
      return activeEntitlementIdentifiers.join(', ');
    } else {
      return 'N/A';
    }
  }

  return (
    <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Section title="Active" value={displayString(activeEntitlementIdentifiers)} />
        <Section title="Inactive" value={displayString(inactiveEntitlementIdentifiers)} />
    </ScrollView>
  );
};

const TransactionsTab: React.FC<{
  purchaserInfo: PurchaserInfo | null;
}> = ({purchaserInfo}) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const transactions = purchaserInfo?.nonSubscriptionTransactions ?? []

  return (
    <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        
        {
          transactions.length === 0 ? (
            <Text>No transactions</Text>
          ) : (
            transactions.map((transaction) => {
              return (
                <Section title={transaction.productId} value={transaction.purchaseDate}>
                </Section>
              )
            })
          )
        }

    </ScrollView>
  );
};

const AttributesTab: React.FC<{
  purchaserInfo: PurchaserInfo | null;
}> = ({purchaserInfo}) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const transactions = purchaserInfo?.nonSubscriptionTransactions || [];

  return (
    <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        
        {
          transactions.length === 0 ? (
            <Text>No transactions</Text>
          ) : (
            transactions.map((transaction) => {
              <Section
                key={transaction.revenueCatId}
                title={transaction.productId}
                value={transaction.purchaseDate}></Section>
            })
          )
        }

    </ScrollView>
  );
};

const Tab = createBottomTabNavigator();

const CustomerInfoScreen: React.FC<Props> = ({ route, navigation }: Props) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <Tab.Navigator>
      <Tab.Screen name="Info" options={{headerShown: false}} children={() => <InfoTab appUserID={route.params.appUserID} purchaserInfo={route.params.purchaserInfo}></InfoTab>}/>
      <Tab.Screen name="Entitlements" options={{headerShown: false}} children={() => <EntitlementsTab purchaserInfo={route.params.purchaserInfo}></EntitlementsTab>}/>
      <Tab.Screen name="Transactions" options={{headerShown: false}} children={() => <TransactionsTab purchaserInfo={route.params.purchaserInfo}></TransactionsTab>}/>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default CustomerInfoScreen;