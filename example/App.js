import React, { Component } from "react";
import {
  StyleSheet,
  Button,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity
} from "react-native";
import Purchases from "react-native-purchases";
import logo from "./img/logo.png";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#F5FCFF"
  },
  logo: {
    alignItems: "center",
    flex: 1
  },
  button: {
    margin: 10
  },
  buttons: {
    flex: 2,
    justifyContent: "flex-start"
  },
  restorePurchases: {
    color: "#f2545b"
  },
  currentStatus: {
    color: "#30b296",
    fontSize: 15
  }
});

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      entitlements: [],
      error: "",
      currentStatus: "Unsubscribed",
      proAnnualPrice: "Loading",
      proMonthlyPrice: "Loading",
      currentID: ""
    };
  }

  async componentDidMount() {
    try {
      await Purchases.setup("LQmxAoIaaQaHpPiWJJayypBDhIpAZCZN", "purchases_sample_id_4");
      debugger;
      const entitlements = await Purchases.getEntitlements();
      const appUserID = await Purchases.getAppUserID();
      const listeners = this.setListeners();
      this.setState({
        entitlements,
        proAnnualPrice: `Buy Annual w/ Trial ${
          entitlements.pro.annual.price_string
        }`,
        proMonthlyPrice: `Buy Monthly w/ Trial ${
          entitlements.pro.monthly.price_string
        }`,
        currentID: appUserID,
        listeners
      });
    } catch (e) {
      this.setState({ error: `Error ${e}` });
    }
  }

  componentWillUnmount() {
    const { listeners } = this.state;
    Purchases.removePurchaserInfoUpdateListener(
      listeners.purchaserInfoUpdatedListener
    );
  }

  setListeners = () => {
    const listeners = {
      purchaserInfoUpdatedListener: purchaserInfo => {
        if (purchaserInfo) {
          this.handlePurchaserInfo(purchaserInfo);
        }
      }
    };

    Purchases.addPurchaserInfoUpdateListener(
      listeners.purchaserInfoUpdatedListener
    );

    return listeners;
  };

  updateID = async () => {
    const currentID = await Purchases.getAppUserID();
    this.setState({ currentID });
  };

  handlePurchaserInfo(purchaserInfo) {
    if (purchaserInfo.activeEntitlements.length === 0) {
      this.state.currentStatus = "Unsubscribed";
    } else {
      this.state.currentStatus = `You're ${purchaserInfo.activeEntitlements}`;
    }
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.logo}>
          <Image
            style={{ width: 250, height: 250 }}
            resizeMode="contain"
            source={logo}
          />
        </View>
        <View style={styles.buttons}>
          <View style={styles.button}>
            <Button
              color="#f2545b"
              onPress={() => {
                try {
                  Purchases.makePurchase(
                    this.state.entitlements.pro.annual.identifier
                  );
                } catch (e) {
                  console.log(e);
                }
              }}
              title={this.state.proAnnualPrice}
            />
          </View>
          <View style={styles.button}>
            <Button
              color="#f2545b"
              onPress={() => {
                Purchases.makePurchase(
                  this.state.entitlements.pro.monthly.identifier
                );
              }}
              title={this.state.proMonthlyPrice}
            />
          </View>
          <View style={styles.button}>
            <Button
              color="#f2545b"
              onPress={() => {
                Purchases.makePurchase(
                  this.state.entitlements.pro.consumable.identifier
                );
              }}
              title="Buy One Time Purchase"
            />
          </View>
          <View style={{ margin: 10, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                Purchases.restoreTransactions();
              }}
            >
              <Text style={styles.restorePurchases}>Restore purchases</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.button}>
            <Button
              color="#f2545b"
              onPress={async () => {
                await Purchases.createAlias("pedro");
                this.updateID();
              }}
              title="Create Alias"
            />
          </View>
          <View style={styles.button}>
            <Button
              color="#f2545b"
              onPress={() => {
                Purchases.identify("cesarpedro");
                this.updateID();
              }}
              title="Identify"
            />
          </View>
          <View style={styles.button}>
            <Button
              color="#f2545b"
              onPress={() => {
                Purchases.reset();
                this.updateID();
              }}
              title="Reset"
            />
          </View>
          <View style={{ margin: 50, alignItems: "center" }}>
            <Text style={styles.currentStatus}>{this.state.currentID}</Text>
          </View>
          <View style={{ margin: 50, alignItems: "center" }}>
            <Text style={styles.currentStatus}>{this.state.currentStatus}</Text>
          </View>
          <View style={{ margin: 50, alignItems: "center" }}>
            <Text style={styles.currentStatus}>{this.state.error}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
