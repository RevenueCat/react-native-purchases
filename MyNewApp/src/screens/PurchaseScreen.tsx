import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
  Text,
  ActivityIndicator,
} from 'react-native';
import Purchases, {
  PurchasesOffering,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import {Colors} from 'react-native/Libraries/NewAppScreen';

function PurchaseScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    async function fetchOfferings() {
      try {
        const offerings = await Purchases.getOfferings();
        console.log('Offerings:', offerings);
        if (offerings.current) {
          setOffering(offerings.current);
        }
      } catch (error) {
        console.error('Error fetching offerings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOfferings();
  }, []);

  const handlePurchaseProduct = async (identifier: string) => {
    try {
      const {customerInfo} = await Purchases.purchaseProduct(identifier);
      console.log('Purchase successful:', customerInfo);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const handlePurchaseStoreProduct = async (
    storeProduct: PurchasesStoreProduct,
  ) => {
    try {
      const {customerInfo} = await Purchases.purchaseStoreProduct(storeProduct);
      console.log('Purchase successful:', customerInfo);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.safeArea]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          },
        ]}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text
              style={[
                styles.text,
                {color: isDarkMode ? Colors.white : Colors.black},
              ]}>
              {offering
                ? `Available yearly product: ${offering.annual?.product.identifier}`
                : 'No yearly product available'}
            </Text>
            {offering && (
              <Button
                title="Purchase yearly product"
                onPress={() => {
                  const identifier = offering.annual?.product.identifier;
                  if (identifier) {
                    handlePurchaseProduct(identifier);
                  }
                }}
              />
            )}
            {offering && (
              <Button
                title="Purchase yearly storeProduct"
                onPress={() => {
                  const storeProduct = offering.annual?.product;
                  if (storeProduct) {
                    handlePurchaseStoreProduct(storeProduct);
                  }
                }}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default PurchaseScreen;
