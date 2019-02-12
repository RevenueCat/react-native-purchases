import React from "react";
import {createStackNavigator, createAppContainer} from 'react-navigation';
import Purchases from "react-native-purchases";
import InitialScreen from "./app/screens/InitialScreen";
import UpsellScreen from "./app/screens/UpsellScreen";
// import CatsScreen from "./app/screens/CatsScreen";

const MainNavigator = createStackNavigator({
  Initial: InitialScreen,
  Upsell: UpsellScreen,
  // Cats: CatsScreen,
},
{
  initialRouteName: "Initial"
});

const AppContainer = createAppContainer(MainNavigator);

export default class App extends React.Component {
  async componentWillMount() {
    Purchases.setDebugLogsEnabled(true);
    await Purchases.setup("LQmxAoIaaQaHpPiWJJayypBDhIpAZCZN");
  }

  render() {
    return <AppContainer />;
  }
}