import React from "react";

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignItems: "stretch",
        backgroundColor: "#F5FCFF"
    },
    buttons: {
        flex: 2,
        justifyContent: "flex-start"
    },
    textButton: {
        color: "#f2545b"
    },
    currentStatus: {
        color: "#30b296",
        fontSize: 15
    }
});

export default class CatsScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            isPro: false,
            error: "",
            currentStatus: "😿",
            purchaseDate: "",
            expirationDate: "",
        };
    }

    async componentWillMount() {
        try {
            const info = await Purchases.getPurchaserInfo();
            const isPro = info.activeEntitlements !== 'undefined' && info.activeEntitlements.includes("pro");
            this.setState({
                isPro,
                currentStatus: isPro ? "😻" : "😿",
                purchaseDate: isPro ? "Purchase Date: " + info.purchaseDatesForActiveEntitlements["pro"] : "",
                expirationDate: isPro ? "Expiration Date: " + info.expirationsForActiveEntitlements["pro"] : ""
            });
        } catch (e) {
            this.setState({ error: `Error ${e}` });
        }
    }

    renderNotPro() {
        return (
            <React.Fragment>
                <View style={{ margin: 10, alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={async () => {
                            Purchases.restoreTransactions();
                        }}
                    >
                        <Text style={styles.restorePurchases}>Restore purchases</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ margin: 10, alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.navigate('Upsell');
                        }}
                    >
                        <Text style={styles.restorePurchases}>Go Premium</Text>
                    </TouchableOpacity>
                </View>
            </React.Fragment>
        );
    }

    renderPro() {
        return (
            <React.Fragment>
                <View style={{  margin: 10, alignItems: "center" }}>
                    <Text style={styles.textButton}>{this.state.purchaseDate}</Text>
                </View>
                <View style={{  margin: 10, alignItems: "center" }}>
                    <Text style={styles.textButton}>{this.state.expirationDate}</Text>
                </View>
            </React.Fragment>
        );
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.buttons}>
                    <View style={{ margin: 50, alignItems: "center" }}>
                        <Text style={{ fontSize: 70 }}>{this.state.currentStatus}</Text>
                    </View>
                    {!this.state.isPro ? this.renderNotPro() : this.renderPro()}
                    <View style={{ alignItems: "center" }}>
                        <Text style={styles.textButton}>{this.state.error}</Text>
                    </View>
                </View>
            </ScrollView>
        );
    }

}