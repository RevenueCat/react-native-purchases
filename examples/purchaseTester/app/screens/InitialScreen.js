import React from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";

export default class InitialScreen extends React.Component {
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ margin: 50, alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>Loading</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
