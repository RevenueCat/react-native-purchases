
# react-native-purchases

React Native Purchases is a cross platform solution for in-app subscription. A backend is also provided via [RevenueCat](https://www.revenuecat.com)

## Getting started

`$ npm install react-native-purchases --save`

### Mostly automatic installation

`$ react-native link react-native-purchases`

#### Additional iOS Setup

##### Create a Framework Reference in your project
1. Copy `Purchases.framework` from the `RNPurchases` sub-project and create a reference in the outer project

##### Add iOS Framework to Embedded Binaries
1. In Xcode, in project manager, select your app target.
1. Select the general tab
1. Drag `Purchases.framework` from your project to the Embedded Binaries section
1. Add `$(PROJECT_DIR)/../node_modules/react-native-purchases/ios` to Framework Search paths in build settings

##### Add Strip Frameworks Phase
The App Store, in it's infinite wisdom, still rejects fat frameworks, so we need to strip our framework before it is deployed. To do this, add the following script phase to your build.
1. In Xcode, in project manager, select your app target.
2. Open the `Build Phases` tab
3. Add a new `Run Script`, name it `Strip Frameworks`
4. Add the following command `"${PROJECT_DIR}/../node_modules/react-native-purchases/ios/strip-frameworks.sh"` (quotes included)

## Usage
```javascript
import Purchases from 'react-native-purchases';

Purchases.setup("revenuecat_api_key", "app_user_id", (productIdentifier, purchaserInfo, error) => {
  if (error) {
    this.setState({error: error.message});
    return;
  }

  this.setState({purchaserInfo})
});

Purchases.getEntitlements().then((entitlements) => {
  this.setState({entitlements})

  Purchases.makePurchase(entitlements.pro.monthly.identifier);
});

```

Take a look at the example app in the `example` folder.
  