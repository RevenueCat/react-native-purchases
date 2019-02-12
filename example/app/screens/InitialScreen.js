import React from "react";
import Purchases from "react-native-purchases";

export default class InitialScreen extends React.Component {
    async componentDidMount() {
        const info = await Purchases.getPurchaserInfo();
        debugger;
        if (info.activeEntitlements !== 'undefined' && info.activeEntitlements.includes("pro")) {
            this.props.navigation.navigate('Cats');
        } else {
            this.props.navigation.navigate('Upsell');
        }
    }

    render() {
        return null;
    }
}
