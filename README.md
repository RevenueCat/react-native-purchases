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

Expo supports in-app payments and is compatible with react-native-purchases. To use the library, [create a new project](https://docs.expo.dev/get-started/create-a-project/) and set up a [development build](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build). A development build helps you iterate quickly and provides a complete development environment. After you've created the project, install the library:

```
$ npx expo install react-native-purchases
```

### Bare workflow
If you are using [bare workflow](https://docs.expo.dev/bare/overview/) (that is, your project is created using `react-native init`), [install `expo`](https://docs.expo.dev/bare/installing-expo-modules/) into your project and [leverage Expo CLI](https://docs.expo.dev/bare/using-expo-cli/) to use Expo tooling and services.
