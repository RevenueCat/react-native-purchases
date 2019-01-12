import React, {Component} from 'react';
import {StyleSheet, Button, ScrollView, View, Image, Text, TouchableOpacity} from 'react-native';
import Purchases from 'react-native-purchases';

type AppState = {
  currentStatus: string;
}

export default class App extends Component<any, AppState> {

  handlePurchaserInfo(purchaserInfo: any) {
    if (purchaserInfo.activeEntitlements.length == 0) {
      this.setState({
        currentStatus: "Unsubscribed"
      });
    } else {
      this.setState({
        currentStatus: "You're " + purchaserInfo.activeEntitlements
      });
    }
  }


  constructor(props) {
    super(props);
    this.state = {
      entitlements: [],
      error: "",
      currentStatus: "Unsubscribed",
      proAnnualPrice: "Loading",
      proMonthlyPrice: "Loading",
      currentID: ""
    };
  }

  setListeners = () => {
    return {
      'purchaseListenerID': Purchases.addPurchaseListener((productIdentifier, purchaserInfo, error) => {
        console.log("addPurchaseListener");
        if (error && !error.userCancelled) {
          this.setState({error: error.message});
          return;
        }
        this.handlePurchaserInfo(purchaserInfo);
      }),
      'purchaserInfoUpdatedListenerID': Purchases.addPurchaserInfoUpdateListener((purchaserInfo, error) => {
        console.log("addPurchaserInfoUpdateListener");
        if (purchaserInfo) {
          this.handlePurchaserInfo(purchaserInfo);
        }
      }),
      'restoreTransactionsListenerID': Purchases.addRestoreTransactionsListener((purchaserInfo, error) => {
        console.log("addRestoreTransactionsListener");
        if (purchaserInfo) {
          this.handlePurchaserInfo(purchaserInfo);
        }
      })
    }
  }


  async componentDidMount() {
    try {
      let purchases = await Purchases.setup("LQmxAoIaaQaHpPiWJJayypBDhIpAZCZN", "purchases_sample_id_4");
      let entitlements = await Purchases.getEntitlements();
      let appUserID = await Purchases.getAppUserID();
      const listenerIDs = this.setListeners()
      this.setState({
        entitlements,
        proAnnualPrice: "Buy Annual w/ Trial " + entitlements.pro.annual.price_string,
        proMonthlyPrice: "Buy Monthly w/ Trial " + entitlements.pro.monthly.price_string,
        currentID: appUserID,
        listenerIDs: listenerIDs
      });
    } catch (e) {
      this.setState({error: "Error " + e})
    }
  };

  async componentWillUnmount() {
    Purchases.removePurchaseListener(this.state.listenerIDs.purchaseListenerID);
    Purchases.removePurchaserInfoUpdatedListener(this.state.listenerIDs.purchaserInfoUpdatedListenerID);
    Purchases.removeRestoreTransactionsListener(this.state.listenerIDs.restoreTransactionsListenerID);
  }

  updateID = async() => {
    const currentID = await Purchases.getAppUserID();
    this.setState({currentID})
  }

  render() {
    return (
      <ScrollView >
        <View style = {styles.logo} >
          <Image
            style = {{width: 250,height: 250}}
            resizeMode = "contain"
            source = {require('./img/logo.png')} />
          </View>
          <View style = {styles.buttons} >
            <View
              style={styles.button}>
              <Button
                color="#f2545b"
                onPress = {() => {
                  Purchases.makePurchase(this.state.entitlements.pro.annual.identifier);
                }}
                title = {this.state.proAnnualPrice}/>
            </View>
            <View
              style={styles.button}>
              <Button
                color="#f2545b"
                onPress = {() => {
                  Purchases.makePurchase(this.state.entitlements.pro.monthly.identifier);
                }}
                title = {this.state.proMonthlyPrice}/>
            </View>
            <View
              style={styles.button}>
              <Button
                color="#f2545b"
                onPress = {() => {
                  Purchases.makePurchase(this.state.entitlements.pro.consumable.identifier);
                }}
                title = "Buy One Time Purchase"/>
            </View>
            <View style = {{ margin:10, alignItems: "center" }}>
              <TouchableOpacity
                onPress = {() => {
                  Purchases.restoreTransactions();
                  }}>
                <Text
                  style={styles.restorePurchases}>
                  Restore purchases
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={styles.button}>
              <Button
                color="#f2545b"
                onPress = {async () => {
                  await Purchases.createAlias("pedro");
                  this.updateID()
                }}
                title = "Create Alias"/>
            </View>
            <View
              style={styles.button}>
              <Button
                color="#f2545b"
                onPress = {() => {
                  Purchases.identify("cesarpedro");
                  this.updateID()
                }}
                title = "Identify"/>
            </View>
            <View
              style={styles.button}>
              <Button
                color="#f2545b"
                onPress = {() => {
                  Purchases.reset();
                  this.updateID()
                }}
                title = "Reset"/>
            </View>
            <View style = {{ margin:50, alignItems: "center" }}>
              <Text
                style={styles.currentStatus}>
                {this.state.currentID}
              </Text>
            </View>
            <View style = {{ margin:50, alignItems: "center" }}>
              <Text
                style={styles.currentStatus}>
                {this.state.currentStatus}
              </Text>
            </View>
            <View style = {{ margin:50, alignItems: "center" }}>
              <Text
                style={styles.currentStatus}>
                {this.state.error}
              </Text>
            </View>
          </View>
        </ScrollView>);
      }
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF'
  },
  logo: {
    alignItems: 'center',
    flex: 1
  },
  button: {
    margin:10
  },
  buttons: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  restorePurchases: {
    color: "#f2545b"
  },
  currentStatus: {
    color: "#30b296",
    fontSize: 15
  }
});
