import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Purchases from 'react-native-purchases';

export default class App extends React.Component {
  componentDidMount() {
    this.purchases = Purchases.setup();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up Fart.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
