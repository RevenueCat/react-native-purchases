import React from "react";
import Purchases from "react-native-purchases";
import { StackActions, NavigationActions } from "react-navigation";

export default class InitialScreen extends React.Component {
  async componentDidMount() {
    const purchaserInfo = await Purchases.getPurchaserInfo();
    if (
      purchaserInfo.activeEntitlements !== "undefined" &&
      purchaserInfo.activeEntitlements.includes("pro")
    ) {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Cats" })]
        })
      );
    } else {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Upsell" })]
        })
      );
    }
  }
  render() {
    return null;
  }
}
