import React, {useEffect, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Purchases, {
  PurchasesPackage,
  PurchasesStoreProduct,
  PurchasesWinBackOffer,
} from 'react-native-purchases';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'WinBackTesting'>;

const WinBackTestingScreen: React.FC = () => {
  const [product, setProduct] = useState<PurchasesStoreProduct>();
  const [productWinBackOffers, setProductWinBackOffers] = useState<
    PurchasesWinBackOffer[]
  >([]);
  const [aPackage, setPackage] = useState<PurchasesPackage>();
  const [packageWinBackOffers, setPackageWinBackOffers] = useState<
    PurchasesWinBackOffer[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      const products = await Purchases.getProducts(['winbackTesting']);
      if (products.length > 0) {
        setProduct(products[0]);
      } else {
        setError('No products available');
      }
    } catch (err) {
      setError('Failed to fetch products: ' + (err as Error).message);
    }
  };

  const purchaseProduct = async (product: PurchasesStoreProduct) => {
    try {
      const purchaseResult = await Purchases.purchaseStoreProduct(product);
      console.log('Purchase successful:', purchaseResult);
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  const fetchEligibleWinBackOffersForProduct = async (
    product: PurchasesStoreProduct,
  ) => {
    try {
      const offers = await Purchases.getEligibleWinBackOffersForProduct(
        product,
      );
      if (offers) {
        setProductWinBackOffers(offers); // Store win-back offers
      } else {
        setProductWinBackOffers([]); // Clear if no offers
      }
    } catch (err) {
      console.error('Error fetching win-back offers:', err);
      setProductWinBackOffers([]);
    }
  };

  const fetchEligibleWinBackOffersForPackage = async (
    aPackage: PurchasesPackage,
  ) => {
    try {
      const offers = await Purchases.getEligibleWinBackOffersForPackage(
        aPackage,
      );
      if (offers) {
        setPackageWinBackOffers(offers); // Store win-back offers
      } else {
        setPackageWinBackOffers([]); // Clear if no offers
      }
    } catch (err) {
      console.error('Error fetching win-back offers:', err);
      setPackageWinBackOffers([]);
    }
  };

  const purchaseWinBackOfferForProduct = async (
    product: PurchasesStoreProduct,
    offer: PurchasesWinBackOffer,
  ) => {
    try {
      const result = await Purchases.purchaseProductWithWinBackOffer(
        product,
        offer,
      );
      console.log('Win-Back Offer purchase successful:', result);
    } catch (err) {
      console.error('Win-Back Offer purchase failed:', err);
    }
  };

  const fetchPackage = async () => {
    const currentOffering = (await Purchases.getOfferings()).current;
    const monthlyPackage = currentOffering?.availablePackages.find(
      pkg => pkg.identifier === '$rc_monthly',
    );

    if (monthlyPackage) {
      setPackage(monthlyPackage);
    }
  };

  const purchasePackage = async (aPackage: PurchasesPackage) => {
    try {
      const purchaseResult = await Purchases.purchasePackage(aPackage);
      console.log('Purchase successful:', purchaseResult);
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  const purchaseWinBackOfferForPackage = async (
    aPackage: PurchasesPackage,
    offer: PurchasesWinBackOffer,
  ) => {
    try {
      const result = await Purchases.purchasePackageWithWinBackOffer(
        aPackage,
        offer,
      );
      console.log('Win-Back Offer purchase successful:', result);
    } catch (err) {
      console.error('Win-Back Offer purchase failed:', err);
    }
  };

  return (
    <ScrollView>
      <Text>
        Use this screen to fetch eligible win-back offers, purchase products
        without a win-back offer, and purchase products with an eligible
        win-back offer.
      </Text>
      <Text>
        This test relies on products and offers defined in the SKConfig file, so
        be sure to launch the PurchaseTester app from Xcode with the SKConfig
        file configured.
      </Text>

      <Button title="Fetch Product" onPress={fetchProduct} />

      {error && <Text style={{color: 'red'}}>{error}</Text>}

      {product && (
        <View style={styles.productContainer}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text>{product.description}</Text>
          <Text>{product.priceString}</Text>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => purchaseProduct(product)}>
            <Text style={styles.purchaseButtonText}>Purchase</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.getEligibleWinBackOffersButton}
            onPress={() => fetchEligibleWinBackOffersForProduct(product)}>
            <Text style={styles.purchaseButtonText}>
              Fetch Eligible Win-Back Offers for this Product
            </Text>
          </TouchableOpacity>

          {productWinBackOffers.length > 0 && (
            <View style={styles.winBackContainer}>
              <Text style={styles.winBackTitle}>
                Win-Back Offers for Product:
              </Text>
              {productWinBackOffers.map((offer, index) => (
                <View key={index} style={styles.winBackOffer}>
                  <Text>Identifier: {offer.identifier}</Text>
                  <Text>Price: {offer.priceString}</Text>
                  <Text>Cycles: {offer.cycles}</Text>
                  <Text>Period: {offer.period}</Text>
                  <Text>Period Unit: {offer.periodUnit}</Text>
                  <Text>
                    Period Number of Units: {offer.periodNumberOfUnits}
                  </Text>

                  <TouchableOpacity
                    style={styles.purchaseWinBackButton}
                    onPress={() =>
                      purchaseWinBackOfferForProduct(product, offer)
                    }>
                    <Text style={styles.purchaseWinBackButtonText}>
                      Purchase Win-Back Offer
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <Button title="Fetch Package" onPress={fetchPackage} />
      {aPackage && (
        <View style={styles.productContainer}>
          <Text style={styles.productTitle}>{aPackage.identifier}</Text>
          <Text>{aPackage.product.description}</Text>
          <Text>{aPackage.product.priceString}</Text>

          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => purchasePackage(aPackage)}>
            <Text style={styles.purchaseButtonText}>Purchase</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.getEligibleWinBackOffersButton}
            onPress={() => fetchEligibleWinBackOffersForPackage(aPackage)}>
            <Text style={styles.purchaseButtonText}>
              Fetch Eligible Win-Back Offers for this Package
            </Text>
          </TouchableOpacity>

          {packageWinBackOffers.map((offer, index) => (
            <View key={index} style={styles.winBackOffer}>
              <Text>Identifier: {offer.identifier}</Text>
              <Text>Price: {offer.priceString}</Text>
              <Text>Cycles: {offer.cycles}</Text>
              <Text>Period: {offer.period}</Text>
              <Text>Period Unit: {offer.periodUnit}</Text>
              <Text>Period Number of Units: {offer.periodNumberOfUnits}</Text>

              <TouchableOpacity
                style={styles.purchaseWinBackButton}
                onPress={() => purchaseWinBackOfferForPackage(aPackage, offer)}>
                <Text style={styles.purchaseWinBackButtonText}>
                  Purchase Win-Back Offer
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  productContainer: {
    marginTop: 16,
    padding: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  purchaseButton: {
    marginTop: 10,
    backgroundColor: 'lightcoral',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  getEligibleWinBackOffersButton: {
    marginTop: 10,
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  winBackContainer: {
    marginTop: 16,
    padding: 16,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  winBackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  winBackOffer: {
    marginBottom: 10,
  },
  purchaseWinBackButton: {
    marginTop: 10,
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseWinBackButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WinBackTestingScreen;
