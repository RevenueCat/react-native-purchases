# Magic Weather React Native - RevenueCat Sample

Magic Weather is a sample app demonstrating the proper methods for using RevenueCat's _Purchases_ SDK. This sample uses only native platform components - no third-party SDK's other than the _Purchases_ SDK.

Sign up for a free RevenueCat account [here](https://www.revenuecat.com).

## Requirements

This sample uses:

- React Native 0.80.0
- [react-native-purchases: ^8.11.4](https://www.npmjs.com/package/react-native-purchases)

See minimum react-native version requirements for RevenueCat's _Purchases_ SDK [here](https://github.com/RevenueCat/react-native-purchases#requirements).

## Features

| Feature                           | Sample Project Location                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| 🕹 Configuring the _Purchases_ SDK | [App.tsx](App.tsx#L20)                                                                 |
| 💰 Building a basic paywall       | [src/screens/PaywallScreen.tsx](src/screens/PaywallScreen.tsx)                         |
| 🔐 Checking subscription status   | [src/screens/WeatherScreen.tsx](src/screens/WeatherScreen.tsx)                         |
| 🤑 Restoring transactions         | [src/components/RestorePurchasesButton.tsx](src/components/RestorePurchasesButton.tsx) |
| 👥 Identifying the user           | [src/components/LoginForm.tsx](src/components/LoginForm.tsx)                           |
| 🚪 Logging out the user           | [src/components/LogoutButton.tsx](src/components/LogoutButton.tsx)                     |

## Setup & Run

### Prerequisites

- Be sure to have an an [Apple Developer Account](https://developer.apple.com/account/) or [Google Play Console Account](https://play.google.com/console/developers).
- Be sure to set up at least one subscription on the [App Store](https://docs.revenuecat.com/docs/apple-app-store) or [Play Store](https://docs.revenuecat.com/docs/google-play-store) and link it to RevenueCat:
  - Add the [product](https://docs.revenuecat.com/docs/entitlements#products) (e.g. `rc_3999_1y`) to RevenueCat's dashboard. It should match the product ID on the App/Play Store.
  - Attach the product to an [entitlement](https://docs.revenuecat.com/docs/entitlements#creating-an-entitlement), e.g. `premium`.
  - Attach the product to a [package](https://docs.revenuecat.com/docs/entitlements#adding-packages) (e.g. `Annual`) inside an [offering](https://docs.revenuecat.com/docs/entitlements#creating-an-offering) (e.g. `sale` or `default`).
- Get your [API key](https://docs.revenuecat.com/docs/authentication#obtaining-api-keys) from your RevenueCat project.

### Steps to Run

1. Download or clone this repository

   > git clone https://github.com/RevenueCat/react-native-purchases.git

2. Ensure you have [node package manager (npm)](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed on your machine.

3. Navigate into the `MagicWeather` directory and install the dependencies using npm

   ```
   cd react-native-purchases/examples/MagicWeather
   npm install
   ```

4. Navigate into the `ios` directory and install the pod file.

   ```
   cd ios
   pod install
   ```

5. Open the `Xcode project` file (ios/MagicWeatherReactNative.xcodeproj) and match the `bundle ID` to your App Store package in App Store Connect and RevenueCat.

<img src="https://i.imgur.com/1z32GRo.png" alt="General tab in Xcode" width="250px" />

6. Open the `build.gradle` file (android/app/build.gradle#L134) and match `applicationId` to your Google Play package in Google Play Console and RevenueCat.

<img src="https://i.imgur.com/oZIAvOc.png" alt="Build Gradle with applicationId" width="250px" />

7. Open `constants/index.ts` (src/constants/index.ts):

   - Replace the values for `API_KEY` with the API keys from your RevenueCat project (for your App Store and Play Store app).
   - Replace the value for `entitlementID` with the entitlement ID of your product in RevenueCat's dashboard.
   - Comment out the error directives.

8. Run the app on a simulator or physical device.

```
npm run ios
```

or

```
npm run android
```

### Example Flow: Purchasing a Subscription

1. On the home page, select **Change the Weather**.
2. On the prompted payment sheet, select the product listed.
3. On the next modal, select **Subscribe**.
4. On the next modal, sign in with your Sandbox User ID.
5. On the next modal, select **Ok**.
6. Return to the home page and select **Change the Weather** to see the weather change!

## Support

For more technical resources, check out our [documentation](https://docs.revenuecat.com).

Looking for RevenueCat Support? Visit our [Help Center](https://support.revenuecat.com/hc/en-us).

## Credits

This React Native sample was created by RevenueCat, based on an initial version built by Vadim Savin from notjust.dev.
