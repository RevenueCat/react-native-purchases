import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Purchases from 'react-native-purchases';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [nativeModuleStatus, setNativeModuleStatus] = useState('Checking…');
  const [bridgeReady, setBridgeReady] = useState(false);
  const isNewArchitecture = Boolean(
    (globalThis as {nativeFabricUIManager?: unknown}).nativeFabricUIManager,
  );

  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO)
      .then(() => Purchases.isConfigured())
      .then(isConfigured => {
        setNativeModuleStatus(
          `RevenueCat native module linked (configured: ${isConfigured})`,
        );
        setBridgeReady(true);
      })
      .catch(error => {
        setNativeModuleStatus(`RevenueCat native module error: ${error}`);
      });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <Text style={styles.title}>RevenueCat Old Architecture Tester</Text>
        <Text style={styles.label}>React Native architecture</Text>
        <Text style={isNewArchitecture ? styles.error : styles.success}>
          {isNewArchitecture ? 'New Architecture (unexpected)' : 'Old Architecture'}
        </Text>
        <Text style={styles.label}>SDK bridge</Text>
        <Text style={styles.status}>{nativeModuleStatus}</Text>
        {!isNewArchitecture && bridgeReady && (
          <Text style={styles.success}>Old architecture bridge ready</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  success: {
    color: '#047857',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    color: '#1f2937',
    fontSize: 16,
  },
});

export default App;
