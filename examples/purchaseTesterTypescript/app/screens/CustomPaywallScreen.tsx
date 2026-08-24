import React, {useEffect, useState} from 'react';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Purchases, {
  PurchasesOffering,
  TrackedEvent,
} from 'react-native-purchases';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomPaywall'>;

const CustomPaywallScreen: React.FC<Props> = ({navigation}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [lastTrackedEvent, setLastTrackedEvent] = useState<string | null>(null);
  const [currentOfferingId, setCurrentOfferingId] = useState<string | null>(null);
  const [paywallId, setPaywallId] = useState('');

  const getPaywallId = () => paywallId.trim() || undefined;

  const loadOfferings = async () => {
    const offerings = await Purchases.getOfferings();
    setCurrentOfferingId(offerings.current?.identifier ?? null);
    return offerings;
  };

  useEffect(() => {
    const listener = (event: TrackedEvent) => {
      setLastTrackedEvent(JSON.stringify(event.eventDictionary, null, 2));
    };

    Purchases.addTrackedEventListener(listener).catch(e => {
      setStatus(`Error: ${e}`);
    });

    return () => Purchases.removeTrackedEventListener(listener);
  }, []);

  useEffect(() => {
    loadOfferings().catch(e => {
      console.log('[RCCustomPaywallTester] Could not preload offerings:', e);
    });
  }, []);

  const trackImpressionWithoutOffering = async () => {
    try {
      const trimmedPaywallId = getPaywallId();
      const offerings = await loadOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        setStatus(
          'No current offering configured. The native SDK cannot infer an offering for this call.',
        );
        Alert.alert(
          'No current offering configured',
          'The native SDK can only infer an offering when getOfferings().current is non-null. Use Track with Offering for this project.',
        );
        return;
      }

      if (trimmedPaywallId) {
        await Purchases.trackCustomPaywallImpression({
          paywallId: trimmedPaywallId,
        });
      } else {
        await Purchases.trackCustomPaywallImpression();
      }

      setStatus(
        `Tracked without offering (paywallId: ${trimmedPaywallId ?? 'nil'}, current offering: ${currentOffering.identifier})`,
      );
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  const trackImpressionWithOffering = async (offering: PurchasesOffering) => {
    try {
      const trimmedPaywallId = getPaywallId();

      await Purchases.trackCustomPaywallImpression({
        paywallId: trimmedPaywallId,
        offering,
      });

      setStatus(
        `Tracked with offering: ${offering.identifier} (paywallId: ${trimmedPaywallId ?? 'nil'})`,
      );
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  const showOfferingPicker = async () => {
    try {
      setStatus('Loading offerings...');

      const offerings = await loadOfferings();
      const offeringOptions = Object.values(offerings.all).sort((a, b) =>
        a.identifier.localeCompare(b.identifier),
      );

      if (offeringOptions.length === 0) {
        setStatus('No offerings available');
        Alert.alert('No offerings available');
        return;
      }

      Alert.alert(
        'Select Offering',
        'Choose the offering to send with the custom paywall impression.',
        [
          ...offeringOptions.map(offering => ({
            text: offering.identifier,
            onPress: () => trackImpressionWithOffering(offering),
          })),
          {
            text: 'Cancel',
            style: 'cancel' as const,
            onPress: () => setStatus(null),
          },
        ],
        {cancelable: true, onDismiss: () => setStatus(null)},
      );
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Custom Paywall Impression</Text>
        <Text style={styles.description}>
          Use this screen to test tracking custom paywall impressions.
        </Text>
        <Text style={styles.currentOfferingText}>
          Current offering: {currentOfferingId ?? 'nil'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Paywall ID (optional)"
          placeholderTextColor="#868e96"
          value={paywallId}
          onChangeText={setPaywallId}
        />

        <TouchableOpacity
          accessibilityLabel="Track custom paywall impression without offering"
          accessibilityRole="button"
          style={styles.button}
          onPress={trackImpressionWithoutOffering}>
          <Text style={styles.buttonText}>
            Track without Offering
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Track custom paywall impression with offering"
          accessibilityRole="button"
          style={styles.button}
          onPress={showOfferingPicker}>
          <Text style={styles.buttonText}>
            Track with Offering
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

        {lastTrackedEvent && (
          <View style={styles.eventContainer}>
            <Text style={styles.eventTitle}>Last tracked event</Text>
            <Text style={styles.eventText}>{lastTrackedEvent}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flexGrow: 1,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  currentOfferingText: {
    color: '#495057',
    fontSize: 13,
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
  eventContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderColor: '#ced4da',
    borderWidth: 1,
    marginBottom: 12,
  },
  eventTitle: {
    color: '#212529',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  eventText: {
    color: '#495057',
    fontFamily: 'Menlo',
    fontSize: 11,
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
