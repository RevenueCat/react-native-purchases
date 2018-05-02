import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Purchases from 'react-native-purchases';

export default class App extends React.Component {
  state = {
    products: [],
    purchaserInfo: null
  }

  receivePurchaserInfo(purchaserInfo) {
    this.setState({purchaserInfo})
  }

  componentDidMount() {
    Purchases.setup("LQmxAoIaaQaHpPiWJJayypBDhIpAZCZN", null, (productIdentifier, purchaserInfo, error) => {
      if (error) {
        if (error.domain == "SKErrorDomain" && error.code == 2) {
          console.log("This is a normal cancel.");
        } else {
          this.setState({error: error.message})
        }
        return;
      }

      this.receivePurchaserInfo(purchaserInfo);
    });

    Purchases.getProducts(["onemonth_freetrial"]).then((products) => {
      this.setState({products})
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Available Products</Text>
        { 
          Object.values(this.state.products).map(
            product => 
            <TouchableOpacity style={styles.product} key={product.identifier} onPress={() => Purchases.makePurchase(product.identifier)}>
              <Text>
                {product.identifier} - {product.price_string}
              </Text>
            </TouchableOpacity>)
        }
        <Text>Purchaser Info</Text>
        {
          this.state.purchaserInfo && Object.keys(this.state.purchaserInfo.allExpirationDates).map( key => {
            let date = this.state.purchaserInfo.allExpirationDates[key];
            return <Text key={key}>{key} - {date}</Text>;
          })
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  product: {
    padding: 10,
    backgroundColor: '#AAA',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40
  }
});
