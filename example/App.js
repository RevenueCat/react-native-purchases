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
    Purchases.setup("LQmxAoIaaQaHpPiWJJayypBDhIpAZCZN", "jerry", (productIdentifier, purchaserInfo, error) => {
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
        <Text>Purchaser Info - {this.state.purchaserInfo ? "Received" : "Null"}</Text>
        {
          this.state.purchaserInfo && Object.keys(this.state.purchaserInfo.allExpirationDates).sort().map( key => {
            let date = this.state.purchaserInfo.allExpirationDates[key];
            let parsedDate = Date.parse(date);

            let subscribed = parsedDate > Date.now();
            let expiredIcon = subscribed ? "✅" : "❌";

            return <Text key={key}>{key} - {expiredIcon}</Text>;
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
