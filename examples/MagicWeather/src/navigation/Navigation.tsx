import React, {createContext, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WeatherScreen from '../screens/WeatherScreen';
import UserScreen from '../screens/UserScreen';
import PaywallScreen from '../screens/PaywallScreen';

// Poor man's react router to avoid third party dependencies
const tabs: Record<string, React.ReactNode> = {
  Home: <WeatherScreen />,
  User: <UserScreen />,
};

const modals: Record<string, React.ReactNode> = {
  paywall: <PaywallScreen />,
};

export const NavigationContext = createContext<{
  navigate: (tab: keyof typeof tabs) => void;
  openModal: (modal: keyof typeof modals) => void;
  closeModal: () => void;
}>({
  navigate: () => {},
  openModal: () => {},
  closeModal: () => {},
});

export default function Navigation() {
  const [selectedTab, setSelectedTab] = useState<keyof typeof tabs>('Home');
  const [selectedModal, setSelectedModal] = useState<keyof typeof modals | null>(null);

  const navigationContextValue = {
    navigate: (tab: keyof typeof tabs) => {
      setSelectedTab(tab);
    },
    openModal: (modal: keyof typeof modals) => {
      setSelectedModal(modal);
    },
    closeModal: () => {
      setSelectedModal(null);
    },
  };

  return (
    <NavigationContext.Provider value={navigationContextValue}>
      <SafeAreaView style={styles.mainContainer}>
        {selectedModal ? (
          modals[selectedModal]
        ) : (
          <>
            <View style={styles.tabContainer}>
              {Object.keys(tabs).map(tab => (
                <Pressable
                  onPress={() => setSelectedTab(tab)}
                  style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
                  key={tab}>
                  <Text style={[styles.tabButtonText, selectedTab === tab && styles.tabButtonTextActive]}>{tab}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.contentContainer}>{tabs[selectedTab]}</View>
          </>
        )}
      </SafeAreaView>
    </NavigationContext.Provider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  tabContainer: {
    flex: 0,
    backgroundColor: '#303030',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#606060',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  tabButton: {
    flex: 0,
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  tabButtonText: {
    fontWeight: 'medium',
    color: 'white',
    fontSize: 16,
  },
  tabButtonTextActive: {
    fontWeight: 'bold',
    color: 'white',
  },
});
