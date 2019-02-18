import React from "react";

import {
    StyleSheet,
    Button,
    ScrollView,
    View,
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
    button: {
        margin: 10
    },
    buttons: {
        flex: 2,
        justifyContent: "flex-start"
    },
    textButton: {
        color: "#f2545b"
    },
});

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
            this.setState({ error: `Error ${e}` });
        }
    }

    async makePurchase(product) {
        try {
            const purchaseMade = await Purchases.makePurchase(product);
            if (purchaseMade.purchaserInfo.activeEntitlements !== 'undefined' && purchaseMade.purchaserInfo.activeEntitlements.includes("pro")) {
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({ routeName: 'Cats'})
                    ]
                  }))
            }
        } catch (e) {
            if (!e.userCancelled) {
                this.setState({ error: `Error ${e}` });
            }
        }
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.buttons}>
                    <View style={styles.button}>
                        <Button
                            color="#f2545b"
                            onPress={() => { this.makePurchase(this.state.entitlements.pro.annual.identifier); }}
                            title={this.state.proAnnualPrice}
                        />
                    </View>
                    <View style={styles.button}>
                        <Button
                            color="#f2545b"
                            onPress={() => { this.makePurchase(this.state.entitlements.pro.monthly.identifier); }}
                            title={this.state.proMonthlyPrice}
                        />
                    </View>
                    <View style={{ margin: 10, alignItems: "center" }}>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('Cats')}
                        >
                            <Text style={styles.textButton}>Not now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }
}
