import React, {useEffect} from 'react';

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
  useEffect(() => {
    const trackImpression = async () => {
      await Purchases.trackCustomPaywallImpression({
        paywallId: 'custom-paywall-example',
      });
      console.log('[CustomPaywall] Tracked custom paywall impression');
    };
    trackImpression();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Custom Paywall</Text>
        <Text style={styles.subtitle}>
          This is a dummy custom paywall screen.
        </Text>
        <Text style={styles.description}>
          An impression event was tracked when this screen appeared.
        </Text>

        <View style={styles.productCard}>
          <Text style={styles.productTitle}>Pro Subscription</Text>
          <Text style={styles.productPrice}>$9.99 / month</Text>
          <Text style={styles.productDescription}>
            Unlock all premium features
          </Text>
        </View>

        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={() => console.log('[CustomPaywall] Purchase tapped')}>
          <Text style={styles.purchaseButtonText}>Subscribe Now</Text>
        </TouchableOpacity>

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
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#868e96',
    marginBottom: 24,
    textAlign: 'center',
  },
  productCard: {
    width: '100%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1971c2',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  purchaseButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#1971c2',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
