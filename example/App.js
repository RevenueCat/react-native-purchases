import React from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Purchases from "react-native-purchases";
import InitialScreen from "./app/screens/InitialScreen";
import UpsellScreen from "./app/screens/UpsellScreen";
import CatsScreen from "./app/screens/CatsScreen";

const MainNavigator = createStackNavigator(
  {
    Initial: {
      screen: InitialScreen,
      navigationOptions: {
        header: null
      }
    },
    Upsell: {
      screen: UpsellScreen,
      navigationOptions: {
        header: null
      }
    },
    Cats: {
      screen: CatsScreen,
      navigationOptions: {
        header: null
      }
    }
  },
  {
    initialRouteName: "Initial"
  }
);

const AppContainer = createAppContainer(MainNavigator);

export default class App extends React.Component {
  componentWillMount() {
    Purchases.setDebugLogsEnabled(true);
    Purchases.setup("LQmxAoIaaQaHpPiWJJayypBDhIpAZCZN");
  }

  render() {
    return <AppContainer />;
  }
}
