import React, {useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Purchases from 'react-native-purchases';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'VirtualCurrency'>;

const VirtualCurrencyScreen: React.FC = () => {
  const [virtualCurrencies, setVirtualCurrencies] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVirtualCurrencies = async () => {
    setLoading(true);
    clearVirtualCurrencies();
    try {
      const virtualCurrencies = await Purchases.getVirtualCurrencies();
      setVirtualCurrencies(virtualCurrencies);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching virtual currencies:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const invalidateVirtualCurrenciesCache = async () => {
    setLoading(true);
    clearVirtualCurrencies();
    try {
      await Purchases.invalidateVirtualCurrenciesCache();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching virtual currencies:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCachedVirtualCurrencies = async () => {
    setLoading(true);
    clearVirtualCurrencies();
    try {
      const cachedVirtualCurrencies = await Purchases.getCachedVirtualCurrencies();
      if(cachedVirtualCurrencies === null) {
        setVirtualCurrencies('Cached virtual currencies are null.');
      } else {
        setVirtualCurrencies(cachedVirtualCurrencies);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching cached virtual currencies:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearVirtualCurrencies = () => {
    setVirtualCurrencies(null);
    setError(null);
  };

  const displayVirtualCurrencies = () => {
    if (!virtualCurrencies) {
      return <Text></Text>;
    }

    if (typeof virtualCurrencies === 'string') {
      return <Text>{virtualCurrencies}</Text>;
    }

    if (typeof virtualCurrencies === 'object' && Object.keys(virtualCurrencies).length === 0) {
      return <Text>Virtual currencies are empty.</Text>;
    }

    return (
      <View style={styles.vcContainer}>
        <Text style={styles.vcTitle}>Virtual Currencies:</Text>
        <Text style={styles.vcData}>
          {JSON.stringify(virtualCurrencies, null, 2)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Virtual Currency Screen</Text>
        <Text style={styles.description}>
          Use this screen to fetch and display virtual currencies from RevenueCat.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Loading...' : 'Fetch Virtual Currencies'}
            onPress={fetchVirtualCurrencies}
            disabled={loading}
          />

          <Button
            title={'Invalidate Virtual Currencies Cache'}
            onPress={invalidateVirtualCurrenciesCache}
            disabled={loading}
          />

          <Button
            title={'Fetch Cached Virtual Currencies'}
            onPress={fetchCachedVirtualCurrencies}
            disabled={loading}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {displayVirtualCurrencies()}

        {(virtualCurrencies || error) && (
          <View style={styles.buttonContainer}>
            <Button
              title="Clear"
              onPress={clearVirtualCurrencies}
              color="#ff6b6b"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lighter,
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  vcContainer: {
    marginTop: 16,
    padding: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  vcTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vcData: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});

export default VirtualCurrencyScreen;
