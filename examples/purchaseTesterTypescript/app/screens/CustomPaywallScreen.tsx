import React, {useState} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Purchases from 'react-native-purchases';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomPaywall'>;

const CustomPaywallScreen: React.FC<Props> = ({navigation}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [paywallId, setPaywallId] = useState('');
  const [offeringId, setOfferingId] = useState('');

  const trackImpression = async () => {
    try {
      const trimmedPaywallId = paywallId.trim() || undefined;
      const trimmedOfferingId = offeringId.trim() || undefined;

      if (!trimmedPaywallId && !trimmedOfferingId) {
        await Purchases.trackCustomPaywallImpression();
      } else {
        await Purchases.trackCustomPaywallImpression({
          paywallId: trimmedPaywallId,
          offeringId: trimmedOfferingId,
        });
      }
      setStatus(`Tracked (paywallId: ${trimmedPaywallId ?? 'nil'}, offeringId: ${trimmedOfferingId ?? 'nil'})`);
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

        <TextInput
          style={styles.input}
          placeholder="Paywall ID (optional)"
          placeholderTextColor="#868e96"
          value={paywallId}
          onChangeText={setPaywallId}
        />

        <TextInput
          style={styles.input}
          placeholder="Offering ID (optional)"
          placeholderTextColor="#868e96"
          value={offeringId}
          onChangeText={setOfferingId}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={trackImpression}>
          <Text style={styles.buttonText}>
            Track Custom Paywall Impression
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
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 12,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#ffffff',
    marginBottom: 12,
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
