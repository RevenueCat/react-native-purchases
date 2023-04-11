<h3 align="center">😻 In-App Subscriptions Made Easy 😻</h3>

[![License](https://img.shields.io/cocoapods/l/RevenueCat.svg?style=flat)](http://cocoapods.org/pods/RevenueCat)

RevenueCat is a powerful, reliable, and free to use in-app purchase server with cross-platform support. Our open-source framework provides a backend and a wrapper around StoreKit and Google Play Billing to make implementing in-app purchases and subscriptions easy. 

Whether you are building a new app or already have millions of customers, you can use RevenueCat to:

  * Fetch products, make purchases, and check subscription status with our [native SDKs](https://docs.revenuecat.com/docs/installation). 
  * Host and [configure products](https://docs.revenuecat.com/docs/entitlements) remotely from our dashboard. 
  * Analyze the most important metrics for your app business [in one place](https://docs.revenuecat.com/docs/charts).
  * See customer transaction histories, chart lifetime value, and [grant promotional subscriptions](https://docs.revenuecat.com/docs/customers).
  * Get notified of real-time events through [webhooks](https://docs.revenuecat.com/docs/webhooks).
  * Send enriched purchase events to analytics and attribution tools with our easy integrations.

Sign up to [get started for free](https://app.revenuecat.com/signup).

## React Native Purchases

React Native Purchases is the client for the [RevenueCat](https://www.revenuecat.com/) subscription and purchase tracking system. It is an open source framework that provides a wrapper around `StoreKit`, `Google Play Billing` and the RevenueCat backend to make implementing in-app purchases in `React Native` easy.

## Migrating from React-Native Purchases v4 to v5
- See our [Migration guide](./v4_to_v5_migration_guide.md)

## RevenueCat SDK Features
|   | RevenueCat |
| --- | --- |
✅ | Server-side receipt validation
➡️ | [Webhooks](https://docs.revenuecat.com/docs/webhooks) - enhanced server-to-server communication with events for purchases, renewals, cancellations, and more   
🎯 | Subscription status tracking - know whether a user is subscribed whether they're on iOS, Android or web  
📊 | Analytics - automatic calculation of metrics like conversion, mrr, and churn  
📝 | [Online documentation](https://docs.revenuecat.com/docs) and [SDK reference](https://revenuecat.github.io/react-native-purchases-docs/) up to date  
🔀 | [Integrations](https://www.revenuecat.com/integrations) - over a dozen integrations to easily send purchase data where you need it  
💯 | Well maintained - [frequent releases](https://github.com/RevenueCat/purchases-ios/releases)  
📮 | Great support - [Help Center](https://revenuecat.zendesk.com) 

## Getting Started
For more detailed information, you can view our complete documentation at [docs.revenuecat.com](https://docs.revenuecat.com/docs).

Please follow the [Quickstart Guide](https://docs.revenuecat.com/docs/) for more information on how to install the SDK.

Or view our React Native sample app:
- [MagicWeather](examples/MagicWeather)

## Requirements

The minimum React Native version this SDK requires is `0.64`.

## SDK Reference
Our full SDK reference [can be found here](https://revenuecat.github.io/react-native-purchases-docs/).

---

## Installation

ExpoKit projects of version 33 or higher can successfully use react-native-purchases. If you haven't upgraded, you can follow [the instructions here to upgrade](https://docs.expo.io/versions/latest/expokit/expokit/#upgrading-expokit). 

> ❗️ If you're planning on ejecting from Expo, upgrade your expo version _first_, THEN eject. It'll save you a whole lot of hassle. ❗️

### 1. Add the library to the project

```
$ npm install react-native-purchases --save
```

or

```
$ yarn add react-native-purchases
```

### 2. Link library to the project

```
$ react-native link react-native-purchases
```

### Additional iOS Setup

#### If your project uses Cocoapods
If your project already uses Cocoapods to install iOS dependencies, common in ExpoKit projects, linking the library should have added it to the podfile. If it hasn't, add the following to your project's podfile to reference the library from your node_modules folder:

```ruby
pod 'RNPurchases', :path => '../node_modules/react-native-purchases'
    :inhibit_warnings => true
```

In your `ios` folder, run `pod install`. If you've just upgraded ExpoKit, you might need to upgrade cocoapods to the newest version: `sudo gem install cocoapods`. 

#### Migrating from manual installation (if your project doesn't use CocoapodsCreate)

##### Remove the Framework Reference from your project

1. Remove `Purchases.framework` and `PurchasesHybridCommon.framework` from the libraries section of the project. 

##### Remove iOS Frameworks to Embedded Binaries
1. In Xcode, in project manager, select your app target.
1. Select the general tab
1. Look for `Purchases.framework` and `PurchasesHybridCommon.framework` in the Embedded Binaries section and remove them.

Remove `$(PROJECT_DIR)/../node_modules/react-native-purchases/ios` from Framework Search paths in build settings

##### Remove Strip Frameworks Phase
During the old manual installation instructions, now deprecated, we indicated to add a build phase to strip fat frameworks. 
1. In Xcode, in project manager, select your app target.
2. Open the `Build Phases` tab
3. Remove the added `Strip Frameworks` phase
4. Clean `Derived Data` 

##### Link static library
The `react-native link` command should have added the `libRNPurchases.a` library to the _Linked Frameworks and Libraries_ section of your app target. If it hasn't add it like this:

![](https://media.giphy.com/media/U2MMgrdYlkRhEcy80J/giphy.gif)
