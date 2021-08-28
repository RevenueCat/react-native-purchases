import React from "react";

import {
  StyleSheet,
  SafeAreaView,
  Button,
  ScrollView,
  View,
  Text,
  TouchableOpacity
} from "react-native";
import Purchases from "react-native-purchases";
import { StackActions, NavigationActions } from "react-navigation";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#F5FCFF"
  },
  button: {
    margin: 10
  },
  buttons: {
    flex: 2,
    justifyContent: "flex-start"
  },
  textButton: {
    color: "#f2545b"
  }
});

export default class UpsellScreen extends React.Component {
  
  constructor() {
    super();
    this.state = {
      offerings: {},
      proAnnualPrice: "Loading",
      proMonthlyPrice: "Loading"
    };
  }

  async componentDidMount() {
    try {
      this.purchaserInfoUpdateListener = (info) => {
        checkIfPro(info, this.props.navigation);
      };
      this.shouldPurchasePromoProduct = async deferredPurchase => {
        this.deferredPurchase = deferredPurchase;
      };
      Purchases.addPurchaserInfoUpdateListener(this.purchaserInfoUpdateListener);
      Purchases.addShouldPurchasePromoProductListener(this.shouldPurchasePromoProduct);
      const offerings = await Purchases.getOfferings();
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(offerings));
      this.setState({
        offerings,
        proAnnualPrice: `Buy weekly w/ Trial ${
          offerings.current.weekly.product.price_string
        }`,
        proMonthlyPrice: `Buy Monthly w/ Trial ${
          offerings.current.monthly.product.price_string
        }`
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Error handling " + JSON.stringify(e));
    }
  }

  async componentWillUnmount() {
    Purchases.removePurchaserInfoUpdateListener(this.purchaserInfoUpdateListener);
    Purchases.removeShouldPurchasePromoProductListener(this.shouldPurchasePromoProduct);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.buttons}>
            <View style={styles.button}>
              <Button
                color="#f2545b"
                onPress={async () => {
                  const aPackage = this.state.offerings.current.weekly;
                  try {
                    const purchaseMade = await Purchases.purchasePackage(aPackage);
                    checkIfPro(purchaseMade.purchaserInfo, this.props.navigation);
                  } catch (e) {
                    if (!e.userCancelled) {
                      // eslint-disable-next-line no-console
                      console.log(`Error handling ${JSON.stringify(e)}`);
                    } else {
                      // eslint-disable-next-line no-console
                      console.log(`User cancelled ${JSON.stringify(e)}`);
                    }
                  }
                }}
                title={this.state.proAnnualPrice}
              />
            </View>
            <View style={styles.button}>
              <Button
                color="#f2545b"
                onPress={async () => {
                  const aPackage = this.state.offerings.current.monthly;
                  try {
                    const purchaseMade = await Purchases.purchasePackage(aPackage);
                    checkIfPro(purchaseMade.purchaserInfo, this.props.navigation);
                  } catch (e) {
                    if (!e.userCancelled) {
                      // eslint-disable-next-line no-console
                      console.log(`Error handling ${JSON.stringify(e)}`);
                    } else {
                      // eslint-disable-next-line no-console
                      console.log(`User cancelled ${JSON.stringify(e)}`);
                    }
                  }
                }}
                title={this.state.proMonthlyPrice}
              />
            </View>
            <View style={{ margin: 10, alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Cats")}
              >
                <Text style={styles.textButton}>Not now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function checkIfPro(purchaserInfo, navigation) {
  if (typeof purchaserInfo.entitlements.active.pro_cat !== "undefined") {
    navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Cats" })]
    }));
  }
}

