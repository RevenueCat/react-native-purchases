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
      purchaseMade.purchaserInfo.activeEntitlements.includes("pro")
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
      console.log("Error handling " + JSON.stringify(e));
    } else {
      console.log("User cancelled " + JSON.stringify(e));
    }
  }
};

export default class UpsellScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      entitlements: [],
      error: "",
      proAnnualPrice: "Loading",
      proMonthlyPrice: "Loading",
      currentID: ""
    };
  }

  async componentDidMount() {
    try {
      const entitlements = await Purchases.getEntitlements();
      console.log(JSON.stringify(entitlements));
      this.setState({
        entitlements,
        proAnnualPrice: `Buy Annual w/ Trial ${
          entitlements.pro.annual.price_string
        }`,
        proMonthlyPrice: `Buy Monthly w/ Trial ${
          entitlements.pro.monthly.price_string
        }`
      });
    } catch (e) {
      console.log("Error handling");
    }
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView style={{flex: 1}}>
          <View style={styles.buttons}>
            <View style={styles.button}>
              <Button
                color="#f2545b"
                onPress={() => {
                  makePurchase(this.props.navigation)(this.state.entitlements.pro.annual.identifier);
                }}
                title={this.state.proAnnualPrice}
              />
            </View>
            <View style={styles.button}>
              <Button
                color="#f2545b"
                onPress={() => {
                  makePurchase(this.state.entitlements.pro.monthly.identifier);
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
