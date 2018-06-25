
# react-native-purchases

## Getting started

`$ npm install react-native-purchases --save`

### Mostly automatic installation

`$ react-native link react-native-purchases`

#### Add iOS Framework to Copy Frameworks Phase

1. In Xcode, in project manager, select your app target.
2. Open the `Build Phases` tabe
3. Add a new `Copy Files Phase`, name it `Copy Frameworks`
4. Set destination to `Frameworks`
5. Add `node_modules/react-native-purchases/Purchases.framework` to the phase.

#### Add Strip Frameworks Phase
The App Store, in it's infinite wisdom, still rejects fat frameworks, so we need to strip our framework before it is deployed. To do this, add the following script phase to your build.
1. In Xcode, in project manager, select your app target.
2. Open the `Build Phases` tabe
3. Add a new `Run Script`, name it `Strip Frameworks`
4. Add the following command `"${PROJECT_DIR}/node_modules/react-native-purchases/ios/strip-frameworks.sh"` (quotes included)

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-purchases` and add `RNPurchases.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNPurchases.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNPurchasesPackage;` to the imports at the top of the file
  - Add `new RNPurchasesPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-purchases'
  	project(':react-native-purchases').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-purchases/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-purchases')
  	```

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

Purchases.getProducts(["onemonth_freetrial"]).then((products) => {
  this.setState({products})

  Purchases.makePurchase("onemonth_freetrial");
});

```

Take a look at the example app in the `example` folder.

Support for entitlements is coming soon.
  