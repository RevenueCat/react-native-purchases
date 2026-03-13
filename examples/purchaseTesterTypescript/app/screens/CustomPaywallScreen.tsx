import React, {useState} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Purchases from 'react-native-purchases';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomPaywall'>;

const CustomPaywallScreen: React.FC<Props> = ({navigation}) => {
  const [status, setStatus] = useState<string | null>(null);

  const trackImpressionNoId = async () => {
    try {
      await Purchases.trackCustomPaywallImpression();
      setStatus('trackCustomPaywallImpression (no id) succeeded');
      console.log('[CustomPaywall] Tracked custom paywall impression (no id)');
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  const trackImpressionWithId = async () => {
    try {
      await Purchases.trackCustomPaywallImpression({
        paywallId: 'my-test-paywall',
      });
      setStatus('trackCustomPaywallImpression (with id) succeeded');
      console.log('[CustomPaywall] Tracked custom paywall impression (with id)');
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Custom Paywall Impression</Text>
        <Text style={styles.description}>
          Use this screen to test tracking custom paywall impressions.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={trackImpressionNoId}>
          <Text style={styles.buttonText}>
            Track custom paywall impression (no id)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={trackImpressionWithId}>
          <Text style={styles.buttonText}>
            Track custom paywall impression (with id)
          </Text>
        </TouchableOpacity>

        {status && (
          <View
            style={[
              styles.statusContainer,
              status.startsWith('Error')
                ? styles.errorContainer
                : styles.successContainer,
            ]}>
            <Text
              style={
                status.startsWith('Error')
                  ? styles.errorText
                  : styles.successText
              }>
              {status}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#212529',
  },
  description: {
    fontSize: 14,
    color: '#868e96',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 16,
    backgroundColor: '#1971c2',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  successContainer: {
    backgroundColor: '#d3f9d8',
    borderColor: '#69db7c',
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#ffe3e3',
    borderColor: '#ff8787',
    borderWidth: 1,
  },
  successText: {
    color: '#2b8a3e',
    fontSize: 14,
  },
  errorText: {
    color: '#c92a2a',
    fontSize: 14,
  },
  closeButton: {
    padding: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#868e96',
  },
});

export default CustomPaywallScreen;
