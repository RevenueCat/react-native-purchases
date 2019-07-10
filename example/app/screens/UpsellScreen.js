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

const makePurchase = navigation => async product => {
  try {
    const purchaseMade = await Purchases.makePurchase(product);
    if (
      purchaseMade.purchaserInfo.activeEntitlements !== "undefined" &&
      purchaseMade.purchaserInfo.activeEntitlements.includes("pro_cat")
    ) {
      navigation.dispatch(
        StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Cats" })]
        })
      );
    }
  } catch (e) {
    if (!e.userCancelled) {
      // eslint-disable-next-line no-console
      console.log(`Error handling ${JSON.stringify(e)}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`User cancelled ${JSON.stringify(e)}`);
    }
  }
};

export default class UpsellScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      entitlements: [],
      proAnnualPrice: "Loading",
      proMonthlyPrice: "Loading"
    };
  }

  async componentDidMount() {
    try {
      const entitlements = await Purchases.getEntitlements();
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(entitlements));
      this.setState({
        entitlements,
        proAnnualPrice: `Buy Annual w/ Trial ${
          entitlements.pro_cat.annual_cats.price_string
        }`,
        proMonthlyPrice: `Buy Monthly w/ Trial ${
          entitlements.pro_cat.monthly_cats.price_string
        }`
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Error handling");
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.buttons}>
            <View style={styles.button}>
              <Button
                color="#f2545b"
                onPress={() => {
                  makePurchase(this.props.navigation)(
                    this.state.entitlements.pro_cat.annual_cats.identifier
                  );
                }}
                title={this.state.proAnnualPrice}
              />
            </View>
            <View style={styles.button}>
              <Button
                color="#f2545b"
                onPress={() => {
                  makePurchase(
                    this.state.entitlements.pro_cat.monthly_cats.identifier
                  );
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
