# react-native-purchases

The RevenueCat SDK for React Native and Expo. It wraps StoreKit, Google Play Billing, and RevenueCat Billing to handle purchases and subscriptions.

[![npm version](https://img.shields.io/npm/v/react-native-purchases.svg)](https://www.npmjs.com/package/react-native-purchases) [![License: MIT](https://img.shields.io/npm/l/react-native-purchases.svg)](https://github.com/RevenueCat/react-native-purchases/blob/main/LICENSE)

[Docs](https://www.revenuecat.com/docs?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases) · [Install guide](https://www.revenuecat.com/docs/getting-started/installation/reactnative?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases) · [SDK reference](https://revenuecat.github.io/react-native-purchases-docs/) · [Sample app](https://github.com/RevenueCat/react-native-purchases/tree/main/examples/MagicWeather) · [Changelog](https://github.com/RevenueCat/react-native-purchases/releases) · [Migration guide](https://github.com/RevenueCat/react-native-purchases/blob/main/migrations/v12-MIGRATION.md)

## Requirements

| Requirement | Minimum |
|---|---|
| React Native | 0.88 (0.80 if you don't build for iOS) |
| Expo SDK | 58 (54 if you don't build for iOS) |
| iOS (bare React Native) | 15.1 |
| iOS (Expo SDK 58) | 16.4, with Xcode 26.4 |
| Android | 7.0 (API level 24) |
| Android compile SDK | API 35 |
| Kotlin | 2.1.0 |

## Installation

Install the SDK and the UI package with npm. React Native links the native code automatically.

```shell
npm install --save react-native-purchases react-native-purchases-ui
```

In an Expo project, add `expo-dev-client` for a [development build](https://www.revenuecat.com/docs/getting-started/installation/expo?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#create-an-expo-development-build), then install both packages.

```shell
npx expo install expo-dev-client
npx expo install react-native-purchases react-native-purchases-ui
```

In Expo Go, the SDK runs in [Preview API Mode](https://www.revenuecat.com/docs/getting-started/installation/expo?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#expo-go) and simulates purchases. Real store purchases need a development build.

Then set up each platform:

- iOS: the SDK installs through Swift Package Manager (SPM) only; CocoaPods isn't supported. SPM needs React Native 0.88 or later and is experimental in React Native. Every React Native library with native iOS code must support it; other native dependencies can stay on CocoaPods ([Keeping other pods](https://www.revenuecat.com/docs/sdk-guides/react-native-cocoapods-to-spm-migration?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#keeping-other-pods)). To set up your Xcode project, or to move an app from CocoaPods, follow [Migrate to Swift Package Manager](https://www.revenuecat.com/docs/sdk-guides/react-native-cocoapods-to-spm-migration?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases). RevenueCat autolinks from the npm packages, so don't add its Swift packages in Xcode.
- iOS in Expo apps: SPM needs Expo SDK 58 or later, where Expo's SPM support is a preview. If a native dependency in your app still needs CocoaPods, use version 11 of this SDK ([Expo apps](https://www.revenuecat.com/docs/sdk-guides/react-native-cocoapods-to-spm-migration?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#expo-apps)).
- iOS: add the [In-App Purchase capability](https://www.revenuecat.com/docs/getting-started/installation/ios?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#3-enable-the-in-app-purchase-capability) in Xcode before you make App Store purchases, including in sandbox. Test Store purchases work without it.
- Android: set the `launchMode` of the Activity that starts purchases to `standard` or `singleTop`. New React Native projects use `singleTask`, which can cancel a purchase while the user verifies payment in another app ([details](https://www.revenuecat.com/docs/getting-started/installation/reactnative?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#set-your-activitys-launchmode)).

| Package | What it's for | When you need it |
|---|---|---|
| `react-native-purchases` | Purchases, entitlements, subscription status | Always |
| `react-native-purchases-ui` | Paywalls and Customer Center | You show RevenueCat Paywalls or Customer Center |
| `react-native-purchases-store-galaxy` | Galaxy Store purchases | You sell through the Galaxy Store |
| `react-native-purchases-admob` | Tracks AdMob ad events in RevenueCat | You show ads with `react-native-google-mobile-ads` 17 on the New Architecture |

Keep every add-on package on the same version as `react-native-purchases`.

## Quick start

Before you start, create a RevenueCat project, connect your store or start with the Test Store, and add an entitlement. See the [Quickstart](https://www.revenuecat.com/docs/getting-started/quickstart?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases).

Configure the SDK once at app launch with the public API key for each platform (the Test Store key while you test). In Expo Go, pass your Test Store API key on both iOS and Android; Apple and Google keys throw an error there, so use them when you test real store purchases in a development build.

```js
import { Platform } from 'react-native';
import { useEffect } from 'react';
import Purchases from 'react-native-purchases';

//...

export default function App() {

  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    if (Platform.OS === 'web') {
      // Only needed if you're targeting web
      Purchases.configure({ apiKey: <public_web_billing_api_key> });
    } else if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: <public_apple_api_key> });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: <public_google_api_key> });
    }

  }, []);
}
```

Check whether the user has an active entitlement before you show a paywall:

```js
try {
  const customerInfo = await Purchases.getCustomerInfo();
  if(typeof customerInfo.entitlements.active[<my_entitlement_identifier>] !== "undefined") {
    // Grant user "pro" access
  }
} catch (e) {
 // Error fetching purchaser info
}
```

## What's included

- [Paywalls](https://www.revenuecat.com/docs/tools/paywalls?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): build single-screen or multi-step paywalls in the dashboard and change them without an app update.
- [Customer Center](https://www.revenuecat.com/docs/tools/customer-center?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): a self-service screen where users cancel subscriptions and restore purchases, and on iOS request refunds and change plans.
- [Placements](https://www.revenuecat.com/docs/tools/targeting/placements?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): serve a different Offering at each paywall location in your app.
- [Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): make test purchases before you connect the App Store or Google Play.
- [In-app currency](https://www.revenuecat.com/docs/offerings/in-app-currency?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): read the current Customer's in-app currency balances.
- [iOS subscription offers](https://www.revenuecat.com/docs/subscription-guidance/subscription-offers/ios-subscription-offers?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): promotional offers, the offer code redemption sheet, and win-back offers.
- [Your own purchase code](https://www.revenuecat.com/docs/migrating-to-revenuecat/sdk-or-not/finishing-transactions?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): set `purchasesAreCompletedBy` to keep completing purchases with your existing in-app purchase code.
- [Offline entitlements](https://www.revenuecat.com/docs/customers/customer-info?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#offline-entitlements): the SDK grants entitlements for new App Store, Google Play, and Amazon subscription purchases while RevenueCat's servers are down. It's unavailable when your app completes purchases itself.
- [Trusted Entitlements](https://www.revenuecat.com/docs/customers/trusted-entitlements?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): informational by default on iOS and Android. The SDK checks a signature on entitlement data and reports the result without blocking access, so your app decides how to handle tampered responses.
- [Amazon Appstore and Galaxy Store](https://www.revenuecat.com/docs/getting-started/installation/reactnative?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#other-stores): for Amazon, configure with `useAmazon: true` and add Amazon's `.pem` public key. The Galaxy Store needs the `react-native-purchases-store-galaxy` package.
- [Web purchases](https://www.revenuecat.com/docs/getting-started/installation/reactnative?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#react-native-web): in React Native Web apps, the SDK sells through RevenueCat Billing. [Redemption Links](https://www.revenuecat.com/docs/web/redemption-links?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases) unlock a web purchase in your app from a deep link.
- [Ad Monetization](https://www.revenuecat.com/docs/ad-monetization?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): report ad impressions, clicks, and revenue next to subscription data. The [AdMob adapter](https://www.revenuecat.com/docs/getting-started/adapter-sdks/admob?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases) tracks AdMob events automatically.

## Documentation

- [Install guide](https://www.revenuecat.com/docs/getting-started/installation/reactnative?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): npm and yarn commands, iOS and Android setup, other stores, and React Native Web.
- [Expo guide](https://www.revenuecat.com/docs/getting-started/installation/expo?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): development builds, Expo Go, and test builds with EAS.
- [Configure the SDK](https://www.revenuecat.com/docs/getting-started/configuring-sdk?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): API keys, debug logs, and switching between Test Store and real stores.
- [Displaying paywalls](https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#react-native): present a paywall with `react-native-purchases-ui`.
- [Testing purchases](https://www.revenuecat.com/docs/test-and-launch/sandbox?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): Test Store and sandbox testing.
- [Migration guide](https://github.com/RevenueCat/react-native-purchases/blob/main/migrations/v12-MIGRATION.md): changes in the current major version.
- [Troubleshooting](https://www.revenuecat.com/docs/test-and-launch/debugging/troubleshooting-the-sdks?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases#react-native): fixes for build and compile problems.
- [SDK reference](https://revenuecat.github.io/react-native-purchases-docs/): every public class and method in `react-native-purchases`.

## Using an AI coding agent

Your agent's training data is likely older than the current version of this SDK. Point it at current sources:

- [llms.txt](https://www.revenuecat.com/docs/llms.txt?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): an index of the docs. Add `.md` to any docs URL for a Markdown version.
- [RevenueCat MCP server](https://www.revenuecat.com/docs/tools/mcp?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases): lets your agent read and change your RevenueCat project configuration.
- [AI Toolkit](https://github.com/RevenueCat/ai-toolkit): installs RevenueCat skills and the MCP server in one step.
- [Releases](https://github.com/RevenueCat/react-native-purchases/releases): check the latest version before adding the dependency.

## Sample apps

- [MagicWeather](https://github.com/RevenueCat/react-native-purchases/tree/main/examples/MagicWeather): a React Native app that configures the SDK, builds a custom paywall from the current Offering, checks subscription status, restores purchases, and logs users in and out.

## Getting help

- Bugs: open an issue in [this repo](https://github.com/RevenueCat/react-native-purchases/issues).
- Account or configuration questions: [RevenueCat Support](https://www.revenuecat.com/docs/revenuecat-support/support-first-steps?utm_source=github&utm_medium=sdk_readme&utm_content=react-native-purchases).
- Discussion: [RevenueCat Community](https://community.revenuecat.com/).

## Contributing

This repository is published from the `main` branch and release tags of RevenueCat's internal development repository. Issues are tracked here. Pull requests are welcome: a maintainer reviews them here and brings accepted changes into the internal repository, so they can't be merged directly.

See the [contributing guide](https://github.com/RevenueCat/react-native-purchases/blob/main/CONTRIBUTING.md).

## License

MIT. See [LICENSE](https://github.com/RevenueCat/react-native-purchases/blob/main/LICENSE).
