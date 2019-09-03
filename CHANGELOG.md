## 2.4.1

- Fixes expirationDate in the EntitlementInfo object in iOS

## 2.4.0

- Deprecates activeEntitlements in PurchaserInfo and adds entitlements object to RCPurchaserInfo. For more info check out https://docs.revenuecat.com/docs/purchaserinfo
- Fixes trial info being lost in Android. Access intro_price in the product information to get information around the trial period.
- Fixes exception when trying to purchase a product that doesn't exist.

## 2.3.4

- Fixes permissions of install scripts

## 2.3.3

- Upgrades Android SDK to https://github.com/RevenueCat/purchases-android/releases/tag/2.3.1

## 2.3.2

- Fixes a bug when normalizing intro_price_period.
- **BREAKING_CHANGE** All `intro_price` related fields in the product are strings, or empty strings if inexistent, in both iOS and Android. There were some discrepancies between platforms released in https://github.com/RevenueCat/react-native-purchases/releases/tag/2.3.0.

## 2.3.1

- Upgrades iOS SDK to https://github.com/RevenueCat/purchases-ios/releases/tag/2.5.0

## 2.3.0

- Upgrades SDKs to iOS https://github.com/RevenueCat/purchases-ios/releases/tag/2.4.0 and Android to https://github.com/RevenueCat/purchases-android/releases/tag/2.3.0.
- Adds Facebook as supported attribution network.
- Adds automatic Apple Search Ads attribution collection. Disabled by default.
- Adds introductory pricing to the iOS product.

## 2.2.2

- Removes wrong import referring to support library instead of androidx.

## 2.2.1

- Removes console.log statement

## 2.2.0

- Updates iOS SDK to 2.3.0. Check out the changelog for a full list of changes https://github.com/RevenueCat/purchases-ios/releases/tag/2.3.0
- Updates Android SDK to 2.2.2. Check out the changelog for a full list of changes https://github.com/RevenueCat/purchases-android/releases/tag/2.2.2
- ** BREAKING CHANGE ** makePurchase parameter oldSKUs is not an array anymore, it only accepts a string now. This is due to changes in the BillingClient.
- AddAttributionData can be called before the SDK has been setup. A network user identifier can be send to the addAttribution function, replacing the previous rc_appsflyer_id parameter.
- Adds an optional configuration boolean observerMode. This will set the value of finishTransactions at configuration time.

### Android only:

- addAttribution will automatically add the rc_gps_adid parameter.
- ** ANDROID BREAKING CHANGE ** Call syncTransactions to send purchases information to RevenueCat after any restore or purchase if you are using the SDK in observerMode. See our guide on Migrating Subscriptions for more information on syncTransactions: https://docs.revenuecat.com/docs/migrating-existing-subscriptions

### iOS only

- addAttribution will automatically add the rc_idfa and rc_idfv parameters if the AdSupport and UIKit frameworks are included, respectively.
- Apple Search Ad attribution can be automatically collected by setting the automaticAttributionCollection boolean to true before the SDK is configured.

## 2.1.2

- Updates iOS SDK to 2.1.1

## 2.1.1

- If using an app ejected from Expo, the Android project wouldn't build since it couldn't find the react-native dependency. This release should fix it.

## 2.1.0

- Updates SDK versions to 2.1.0 to include new error handling
- **BREAKING CHANGE** errors now contain a `userInfo` object with the message, an underlying error and a readable error code. The error codes have completely changed too and updated to the SDK 2.1.0.
- Updates RN and React versions.
- Fixes Windows installation

## 2.0.0

- Updates native SDKs to versions iOS 2.0.0 and Android 2.0.1
- Checks that the user ID sent to setup, identify or create alias is actually a string #28
- BREAKING CHANGE restoreTransactions returns a promise, the RestoreTransactionsListener has been removed
- BREAKING CHANGE makePurchase returns a promise, the PurchaseListener has been removed
- BREAKING CHANGE PurchaserInfoListener has been replaced with PurchaserInfoUpdateListener and it now only sends a purchaser info object. This listener is used to listen to changes in the purchaser info.
- Added support for Tenjin
- BREAKING CHANGE When failure making a purchase, the productIdentifier of the failed purchase is not sent to the rejected promise. Before, the PurchaseListener received both productIdentifier and error objects.
- Added setDebugLogsEnabled to display debug logs.
- Added getPurchaserInfo function to get the latest purchaser info known by the SDK

## 1.5.4

- Removes unnecessary debugger statement https://github.com/RevenueCat/react-native-purchases/issues/47
- Runs Linter and prettifier
- Adds missing setup call in the example

## 1.5.3

- Fix android setup on a null appuserid
- Adds listener removal methods

## 1.5.2

- Changes setIsUsingAnonymousID to allowSharingStoreAccount

## 1.5.1

- Fixes compilation in iOS

## 1.5.0

- Adds create alias, identify and reset

## 1.4.4

- Fixes download script issue

## 1.4.3

- Fixes build issue on the Android bridge

## 1.4.2

- Adds requestDate to the purchaser info to avoid edge cases
