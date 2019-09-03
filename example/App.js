import React from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Purchases from "react-native-purchases";
import InitialScreen from "./app/screens/InitialScreen";
import UpsellScreen from "./app/screens/UpsellScreen";
import CatsScreen from "./app/screens/CatsScreen";

const createRootNavigator = (load = "<Your Initial Screen>") => {
  return createStackNavigator(
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
      initialRouteName: load
    }
  );
};

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      load: "Initial"
    };
  }

  async componentDidMount() {
    Purchases.setDebugLogsEnabled(true);
    Purchases.setup("VtDdmbdWBySmqJeeQUTyrNxETUVkhuaJ", "cesarsandbox1");
    try {
      const purchaserInfo = await Purchases.getPurchaserInfo();
      if (typeof purchaserInfo.entitlements.active.pro_cat !== "undefined") {
        this.setState({
          load: "Cats",
          loading: false
        });
      } else {
        this.setState({
          load: "Upsell",
          loading: false
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`Error ${JSON.stringify(e)}`);
    }
  }

  render() {
    const AppContainer = createAppContainer(
      createRootNavigator(this.state.load)
    );
    return <AppContainer />;
  }
}
