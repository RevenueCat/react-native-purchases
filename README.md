<h3 align="center">😻 In-App Subscriptions Made Easy 😻</h3>

[![License](https://img.shields.io/cocoapods/l/RevenueCat.svg?style=flat)](http://cocoapods.org/pods/RevenueCat)

RevenueCat is a powerful, reliable, and free to use in-app purchase server with cross-platform support. Our open-source framework provides a backend and a wrapper around StoreKit, Google Play Billing and RevenueCat Web Billing to make implementing in-app purchases and subscriptions easy. 

Whether you are building a new app or already have millions of customers, you can use RevenueCat to:

  * Fetch products, make purchases, and check subscription status with our [native SDKs](https://docs.revenuecat.com/docs/installation). 
  * Host and [configure products](https://docs.revenuecat.com/docs/entitlements) remotely from our dashboard. 
  * Analyze the most important metrics for your app business [in one place](https://docs.revenuecat.com/docs/charts).
  * See customer transaction histories, chart lifetime value, and [grant promotional subscriptions](https://docs.revenuecat.com/docs/customers).
  * Get notified of real-time events through [webhooks](https://docs.revenuecat.com/docs/webhooks).
  * Send enriched purchase events to analytics and attribution tools with our easy integrations.

Sign up to [get started for free](https://app.revenuecat.com/signup).

## React Native Purchases

React Native Purchases is the client for the [RevenueCat](https://www.revenuecat.com/) subscription and purchase tracking system. It is an open source framework that provides a wrapper around StoreKit, Google Play Billing, RevenueCat Web Billing and the RevenueCat backend to make implementing in-app purchases in React Native easy.

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

The minimum React Native version this SDK requires is `0.80.0`.
In Android, minimum Kotlin version is `2.1.0`.

## SDK Reference
Our full SDK reference [can be found here](https://revenuecat.github.io/react-native-purchases-docs/).

---

## Installation

### Experimental Swift Package Manager support (iOS)

Both `react-native-purchases` and `react-native-purchases-ui` include Swift package
manifests for React Native's experimental Swift Package Manager integration.
This integration requires React Native **0.88.0 or later**. CocoaPods remains
supported, with a minimum React Native version of **0.80.0**.

Install or upgrade the SDK packages first, then follow
[React Native's SwiftPM setup instructions](https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/spm/__docs__/spm-scripts.md#quick-start)
to configure your app. Both SDK packages include the required SwiftPM manifests,
so you don't need to scaffold them.

For apps without a Podfile, React Native Community CLI **21.0.0-alpha.1** is
currently required for project discovery. Library podspecs are still required
for React Native's dependency discovery,
including when the app uses SwiftPM.

To convert an existing app, follow the
[CocoaPods to SwiftPM migration guide](migrations/COCOAPODS-TO-SPM.md).

### Expo

Expo supports in-app payments and is compatible with `react-native-purchases`. To use the SDK, [create a new project](https://docs.expo.dev/get-started/create-a-project/) and set up a [development build](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build). Development builds enable native code and provide a complete environment for testing purchases.

```
$ npx expo install react-native-purchases
```

In Expo Go, the SDK automatically runs in **Preview API Mode**, replacing native calls with JavaScript mocks so your app loads without errors. Real purchases, however, require a development build.

#### Using development builds

To fully test in-app purchases, you’ll need to create a [custom development build](https://docs.expo.dev/develop/development-builds/introduction/) with EAS. This ensures that all native dependencies, including `react-native-purchases`, are properly included.
