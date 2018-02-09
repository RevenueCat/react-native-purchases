
# react-native-purchases

## Getting started

`$ npm install react-native-purchases --save`

### Mostly automatic installation

`$ react-native link react-native-purchases`

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

#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the `RNPurchases.sln` in `node_modules/react-native-purchases/windows/RNPurchases.sln` folder to their solution, reference from their app.
2. Open up your `MainPage.cs` app
  - Add `using Purchases.RNPurchases;` to the usings at the top of the file
  - Add `new RNPurchasesPackage()` to the `List<IReactPackage>` returned by the `Packages` method


## Usage
```javascript
import RNPurchases from 'react-native-purchases';

// TODO: What to do with the module?
RNPurchases;
```
  