## 5.0.3
### Other Changes
* Updated main and MagicWeather README to match purchases-ios (#433) via rglanz-rc (@rglanz-rc)
* Move prepare_next_version job to different workflow (#434) via Toni Rico (@tonidero)
* Switch to main before preparing next release (#432) via Cesar de la Vega (@vegaro)

## 5.0.2
### Other Changes
* Add link to reference docs at the bottom (#426) via Andy Boedo (@aboedo)

## 5.0.1
### Bugfixes
* `presentCodeRedemptionSheet`: fixed Catalyst build (#425) via NachoSoto (@NachoSoto)
* `purchaseProduct` not working when SK2 is enabled (#402)
### Other Changes
* Updated purchases-hybrid-common to 4.2.1
* Configures Danger (#421) via Cesar de la Vega (@vegaro)
* Add link to SDK reference to README (#419) via Jens-Fabian Goetzmann (@jefago)
* Specify branch for deployment dependencies (#418) via Toni Rico (@tonidero)

## 5.0.0
#### Amazon store support
We have introduced support for using the Amazon Store. You can enable Amazon Store support by configuring the SDK using the new configure function:
```
Purchases.configure({ apiKey: "AMAZON_API_KEY", useAmazon: true });
```

For more information around configuration please take a look at the [Amazon Store section in our docs](https://docs.revenuecat.com/docs/amazon-platform-resources). The official [Amazon In-App Purchasing docs](https://developer.amazon.com/docs/in-app-purchasing/iap-overview.html) also contain very valuable information, specially around testing and best practices.

#### Apple AdServices support
New method for automatic collecting of attribution tokens on iOS and macOS using AdServices - `Purchases.enableAdServicesAttributionTokenCollection()`

#### StoreKit 2 support
This version of the SDK automatically uses StoreKit 2 APIs under the hood only for APIs that the RevenueCat team has determined work better than StoreKit 1.

#### New types and cleaned up naming
New types that wrap native types from Apple, Google and Amazon, and we cleaned up the naming of other types and methods for a more consistent experience.

### Removed APIs
- `setUp` has been removed in favor of `configure`
- `configure` now expects an Object for the different parameters. Example:
```javascript
Purchases.configure({
    apiKey: "key",
    appUserID: "user ID",
    observerMode: false,
    userDefaultsSuiteName: "suite name",
    usesStoreKit2IfAvailable: true,
    useAmazon: true
});
```
- `identify` and `createAlias` have been removed in favor of `logIn`.
- `reset` has been removed in favor of `logOut`.
- `addAttributionData` has been removed in favor of `set<NetworkID> methods`.
- `PurchasesStoreProduct`: removed `intro_price_string`, `intro_price_period`, `intro_price_cycles`, `intro_price_period_unit`, `intro_price_period_number_of_units` in favor of new `introPrice: PurchasesIntroPrice`.
- `PurchasesStoreTransaction`: removed `revenueCatId` and `productId` in favor of `transactionIdentifier` and `productIdentifier` respectively.

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesStoreProductProduct.price_string` | `PurchasesStoreProductProduct.priceString` |
| `PurchasesStoreProductProduct.currency_code` | `PurchasesStoreProductProduct.currencyCode` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesTransaction.revenueCatId` | `PurchasesStoreTransaction.transactionIdentifier` |
| `PurchasesTransaction.productId` | `PurchasesStoreTransaction.productIdentifier` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |


## 5.0.0-beta.6

⚠️⚠️ This is a pre-release version. ⚠️⚠️

* Bump purchases-hybrid-common version to 4.1.2 (#408) via Toni Rico (@tonidero)

## 5.0.0-beta.5

⚠️⚠️ This is a pre-release version. ⚠️⚠️

- Bumped purchases-hybrid-common dependency to [4.1.1](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/4.1.1)

## 5.0.0-beta.4

⚠️⚠️ This is a pre-release version. ⚠️⚠️

#### Apple AdServices support
New method for automatic collecting of attribution tokens on iOS and macOS using AdServices - `Purchases.enableAdServicesAttributionTokenCollection()`

#### StoreKit 2 support
This version of the SDK automatically uses StoreKit 2 APIs under the hood only for APIs that the RevenueCat team has determined work better than StoreKit 1.

#### New types and cleaned up naming
New types that wrap native types from Apple, Google and Amazon, and we cleaned up the naming of other types and methods for a more consistent experience.

### Removed APIs
- `setUp` has been removed in favor of `configure`
- `configure` now expects an Object for the different parameters. Example:
```javascript
Purchases.configure({
    apiKey: "key",
    appUserID: "user ID",
    observerMode: false,
    userDefaultsSuiteName: "suite name",
    usesStoreKit2IfAvailable: true,
    useAmazon: true
});
```
- `identify` and `createAlias` have been removed in favor of `logIn`.
- `reset` has been removed in favor of `logOut`.
- `addAttributionData` has been removed in favor of `set<NetworkID> methods`.
- `PurchasesStoreProduct`: removed `intro_price_string`, `intro_price_period`, `intro_price_cycles`, `intro_price_period_unit`, `intro_price_period_number_of_units` in favor of new `introPrice: PurchasesIntroPrice`.

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesStoreProductProduct.price_string` | `PurchasesStoreProductProduct.priceString` |
| `PurchasesStoreProductProduct.currency_code` | `PurchasesStoreProductProduct.currencyCode` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |

## 5.0.0-beta.3

⚠️⚠️ This is a pre-release version. ⚠️⚠️

#### StoreKit 2 support
This version of the SDK automatically uses StoreKit 2 APIs under the hood only for APIs that the RevenueCat team has determined work better than StoreKit 1.

#### New types and cleaned up naming
New types that wrap native types from Apple, Google and Amazon, and we cleaned up the naming of other types and methods for a more consistent experience.

### Removed APIs
- `setUp` has been removed in favor of `configure`
- `configure` now expects an Object for the different parameters. Example:
```javascript
Purchases.configure({
    apiKey: "key",
    appUserID: "user ID",
    observerMode: false,
    userDefaultsSuiteName: "suite name",
    usesStoreKit2IfAvailable: true,
    useAmazon: true
});
```
- `identify` and `createAlias` have been removed in favor of `logIn`.
- `reset` has been removed in favor of `logOut`.
- `addAttributionData` has been removed in favor of `set<NetworkID> methods`.
- `PurchasesStoreProduct`: removed `intro_price_string`, `intro_price_period`, `intro_price_cycles`, `intro_price_period_unit`, `intro_price_period_number_of_units` in favor of new `introPrice: PurchasesIntroPrice`.

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesStoreProductProduct.price_string` | `PurchasesStoreProductProduct.priceString` |
| `PurchasesStoreProductProduct.currency_code` | `PurchasesStoreProductProduct.currencyCode` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |

## 5.0.0-beta.2

⚠️⚠️ This is a pre-release version. ⚠️⚠️

#### StoreKit 2 support
This version of the SDK automatically uses StoreKit 2 APIs under the hood only for APIs that the RevenueCat team has determined work better than StoreKit 1.

#### New types and cleaned up naming
New types that wrap native types from Apple, Google and Amazon, and we cleaned up the naming of other types and methods for a more consistent experience.

### Removed APIs
- `setUp` has been removed in favor of `configure`
- `identify` and `createAlias` have been removed in favor of `logIn`.
- `reset` has been removed in favor of `logOut`.
- `addAttributionData` has been removed in favor of `set<NetworkID> methods`.
- `PurchasesStoreProduct`: removed `intro_price_string`, `intro_price_period`, `intro_price_cycles`, `intro_price_period_unit`, `intro_price_period_number_of_units` in favor of new `introPrice: PurchasesIntroPrice`.

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesStoreProductProduct.price_string` | `PurchasesStoreProductProduct.priceString` |
| `PurchasesStoreProductProduct.currency_code` | `PurchasesStoreProductProduct.currencyCode` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |

## 5.0.0-beta.1

⚠️⚠️ This is a pre-release version. ⚠️⚠️

#### StoreKit 2 support
This version of the SDK automatically uses StoreKit 2 APIs under the hood only for APIs that the RevenueCat team has determined work better than StoreKit 1.

#### New types and cleaned up naming
New types that wrap native types from Apple, Google and Amazon, and we cleaned up the naming of other types and methods for a more consistent experience.

### Removed APIs
- `setUp` has been removed in favor of `configure`
- `identify` and `createAlias` have been removed in favor of `logIn`.
- `reset` has been removed in favor of `logOut`.
- `addAttributionData` has been removed in favor of `set<NetworkID> methods`.
- `PurchasesStoreProduct`: removed `intro_price_string`, `intro_price_period`, `intro_price_cycles`, `intro_price_period_unit`, `intro_price_period_number_of_units` in favor of new `introPrice: PurchasesIntroPrice`.

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesStoreProductProduct.price_string` | `PurchasesStoreProductProduct.priceString` |
| `PurchasesStoreProductProduct.currency_code` | `PurchasesStoreProductProduct.currencyCode` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |

### Known issues:
- Amazon support currently doesn't work correctly.

## 4.6.1

- Replaced `jcenter` with `mavenCentral` (https://github.com/RevenueCat/react-native-purchases/pull/369)

## 4.6.0

- Export MakePurchaseResult (https://github.com/RevenueCat/react-native-purchases/pull/351)

## 4.5.3

- Fix warnings regarding `new NativeEventEmitter()` being called without the required `addListener` and `removeListeners` methods, which fixes [this issue](https://github.com/RevenueCat/react-native-purchases/issues/309)

## 4.5.2

- Fix [an issue](https://github.com/RevenueCat/react-native-purchases/issues/328) where calling `checkTrialOrIntroductoryPriceEligibility` could cause a log in prompt
- Bump `purchases-hybrid-common` to 2.0.1. [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/2.0.1)
- Bump `purchases-ios` to 3.14.1. [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.14.1))
- Bump `purchases-android` to 4.6.1. [Changelog here](https://github.com/RevenueCat/purchases-android/releases/4.6.1)
    https://github.com/RevenueCat/react-native-purchases/pull/329

## 4.5.1

- Fix Expo 44 compatibility by fixing `RCTEventEmitter` import [PR](https://github.com/RevenueCat/react-native-purchases/commit/75e3c5a99430168fac3a2a28c17238408580fcb3) [Issue](https://github.com/RevenueCat/react-native-purchases/issues/160)

## 4.5.0

This release has some changes that should help prevent "There is no singleton instance" errors [issue](https://github.com/RevenueCat/react-native-purchases/issues/101), [PR](https://github.com/RevenueCat/react-native-purchases/pull/310).
- Added `isConfigured` function to be able to check if the instance of Purchases has been configured before calling any function that accesses the singleton instance.
- These functions that were returning `void`, now return `Promise<void>`:

| Integrations         | Subscriber attributes      | Configuration and other |
| :------------------: | :------------------------: | :----------------------------: |
| `addAttributionData` | `collectDeviceIdentifiers` | `invalidatePurchaserInfoCache` |
| `setAd`              | `setAttributes`            | `presentCodeRedemptionSheet` |
| `setAdGroup`         | `setDisplayName`           | `setAllowSharingStoreAccount` |
| `setAdjustID`        | `setEmail`                 | `setAutomaticAppleSearchAdsAttributionCollection` |
| `setAirshipChannelID`| `setPhoneNumber`           | `setDebugLogsEnabled` |
| `setAppsflyerID`     | `setPushToken`             | `setFinishTransactions` |
| `setCampaign`        |                            | `setSimulatesAskToBuyInSandbox` |
| `setCreative`        |                            | `syncPurchases` |
| `setFBAnonymousID`   |                            |                 |
| `setKeyword`         |                            |                 |
| `setMediaSource`     |                            |                 |
| `setMparticleID`     |                            |                 |
| `setOnesignalID`     |                            |                 |

- Accessing a function that accesses the singleton instance before it has been setup will now reject with a `UninitializedPurchasesError`.

- Bump`purchases-hybrid-common` to `1.11.1` [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.10.1)
- Bump `purchases-ios` to `3.13.1` ([Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.13.1))
- Bump `purchases-android` to `4.6.0` ([Changelog here](https://github.com/RevenueCat/purchases-android/releases/4.6.0))

## 4.4.1

- Fixed declared type in `getAppUserId`
     https://github.com/RevenueCat/react-native-purchases/pull/306

## 4.4.0

- Bump`purchases-hybrid-common` to `1.10.0` [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.10.0)
- Bump `purchases-ios` to `3.13.0` ([Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.13.0))
- Bump `purchases-android` to `4.4.0` ([Changelog here](https://github.com/RevenueCat/purchases-android/releases/4.4.0))
- Added support for Airship integration via `setAirshipChannelID`
     https://github.com/RevenueCat/react-native-purchases/pull/307

## 4.3.3

- Bump `purchases-ios` to 3.12.8
   [3.12.8 Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.12.8)
   [3.12.7 Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.12.7)
   [3.12.6 Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.12.6)
   [3.12.5 Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.12.5)
   [3.12.4 Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.12.4)
- Bump `purchases-android` to 4.3.3
   [4.3.3 Changelog here](https://github.com/RevenueCat/purchases-android/releases/tag/4.3.3)
   [4.3.2 Changelog here](https://github.com/RevenueCat/purchases-android/releases/tag/4.3.2)

## 4.3.2

- Fixed return type of `isAnonymous`
    https://github.com/RevenueCat/react-native-purchases/pull/302
- Fix `EntitlementInfo.store` type
    https://github.com/RevenueCat/react-native-purchases/pull/296

## 4.3.1

- Bumped purchases-android to 4.3.1 [Changelog here](https://github.com/RevenueCat/purchases-android/releases/4.3.1),
which fixes canMakePayments not returning (see related issue: https://github.com/RevenueCat/purchases-unity/issues/61)
- Bumped purchases-ios to 3.12.3 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.12.3)
- Bumped purchases-hybrid-common to 1.9.1 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.9.1)
- Extracted readableErrorCode to userInfo (https://github.com/RevenueCat/react-native-purchases/pull/268)

## 4.3.0

### Identity V3:

In this version, we’ve redesigned the way that user identification works.
Detailed docs about the new system are available [here](https://docs.revenuecat.com/v3.2/docs/user-ids).

#### New methods
- Introduces `logIn`, a new way of identifying users, which also returns whether a new user has been registered in the system.
`logIn` uses a new backend endpoint.
- Introduces `logOut`, a replacement for `reset`.

#### Deprecations
- deprecates `createAlias` in favor of `logIn`.
- deprecates `identify` in favor of `logIn`.
- deprecates `reset` in favor of `logOut`.
- deprecates `setAllowSharingStoreAccount` in favor of dashboard-side configuration.
    https://github.com/RevenueCat/react-native-purchases/pull/229/

#### Other
- Updated BillingClient to version [4.0.0](https://developer.android.com/google/play/billing/release-notes#4-0).
     https://github.com/RevenueCat/purchases-android/commit/f6554bbf7376c3fd492f0bc67183a9f35889ae78
- Fixed build issues MagicWeather example for Xcode 12.5
    https://github.com/RevenueCat/react-native-purchases/pull/267
- Dependency security updates
    https://github.com/RevenueCat/react-native-purchases/pull/271
    https://github.com/RevenueCat/react-native-purchases/pull/273
- Bumped purchases-ios to 3.12.2 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.12.2)
- Bumped purchases-android to 4.3.0 [Changelog here](https://github.com/RevenueCat/purchases-android/releases/4.3.0)

## 4.2.0

- Add canMakePayments method (https://github.com/RevenueCat/react-native-purchases/pull/244)
- Add PR template (https://github.com/RevenueCat/react-native-purchases/pull/263)

## 4.1.4

- Bumped purchases-hybrid-common to 1.7.1 in Android [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/1.7.1)

## 4.1.3

- Bumped purchases-hybrid-common to 1.7.1 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/1.7.1)
- Bumped purchases-android to 4.2.1 [Changelog here](https://github.com/RevenueCat/purchases-android/releases/4.2.1)

## 4.1.2

- Fix wrong types specified in TypeScript
    https://github.com/RevenueCat/react-native-purchases/pull/231
- Cleaned up directory structure
    https://github.com/RevenueCat/react-native-purchases/pull/235
    https://github.com/RevenueCat/react-native-purchases/pull/237
    https://github.com/RevenueCat/react-native-purchases/pull/232
- Updated example apps dependencies
    https://github.com/RevenueCat/react-native-purchases/pull/240
    https://github.com/RevenueCat/react-native-purchases/pull/239
    https://github.com/RevenueCat/react-native-purchases/pull/233
    https://github.com/RevenueCat/react-native-purchases/pull/227
    https://github.com/RevenueCat/react-native-purchases/pull/226
    https://github.com/RevenueCat/react-native-purchases/pull/234
- Bumped purchases-hybrid-common to 1.6.3 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/1.6.3)
- Bumped purchases-ios to 3.11.1 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.11.1)
    https://github.com/RevenueCat/react-native-purchases/pull/243

## 4.1.1

- Updated example app to the latest React-Native version
    https://github.com/RevenueCat/react-native-purchases/pull/222
- Updated `y18n` version
    https://github.com/RevenueCat/react-native-purchases/pull/227
    https://github.com/RevenueCat/react-native-purchases/pull/226
- Bumped purchases-hybrid-common to 1.6.2 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/1.6.2)
- Bumped purchases-ios to 3.10.7 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.10.7)
- Bumped purchases-android to 4.0.5 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/4.0.5)
    https://github.com/RevenueCat/react-native-purchases/pull/225

## 4.1.0

- Added a new sample project available at `/Examples/WeatherApp`
    https://github.com/RevenueCat/react-native-purchases/pull/212
- iOS:
    - Added a new method `setSimulatesAskToBuyInSandbox`, that allows developers to test deferred purchases easily.
- Bumped purchases-hybrid-common to 1.6.1 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/1.6.1)
- Bumped purchases-ios to 3.10.6 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.10.6)
- Bumped purchases-android to 4.0.4 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/4.0.4)
    https://github.com/RevenueCat/react-native-purchases/pull/216
- Fixed issues with CI builds in Android
    https://github.com/RevenueCat/react-native-purchases/pull/214
    https://github.com/RevenueCat/react-native-purchases/pull/217

## 4.0.1

- Update npm description for better discoverability
    https://github.com/RevenueCat/react-native-purchases/pull/207

## 4.0.0

- removes deprecated `makePurchase`, replaced by `purchaseProduct`
- iOS:
    - added new method, `syncPurchases`, that enables syncing the purchases in the local receipt with the backend without risking a password prompt. The method was already available on Android.
    - added a new method, `presentCodeRedemptionSheet`, for offer codes redemption.
    - Updated `React` dependency to `React-Core` and set `DEFINES_MODULE` to fix issues when building in Xcode 12
- Bumped `purchases-hybrid-common` to 1.5.0 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.5.0)
- Bumped `purchases-ios` to 3.9.2 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.9.2)
- Bumped `purchases-android` to 4.0.1 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/4.0.1)

## 3.4.3

- Bumped common files to 1.4.5 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.4.5)
- Bumped iOS SDK to 3.7.5 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.7.5)

## 3.4.2

- Bumped common files to 1.4.4 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.4.4)
  - Should include the following Android changes:
  https://github.com/RevenueCat/purchases-android/releases/tag/3.5.2
  https://github.com/RevenueCat/purchases-android/releases/tag/3.5.1

## 3.4.1

- Bumped common files to 1.4.3 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.4.3)
- Bumped iOS to 3.7.2 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.7.2)

## 3.4.0

- Removes usage of BuildConfig [#171](https://github.com/RevenueCat/react-native-purchases/pull/171)
- Bumped common files to 1.4.2 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.4.2)
- Bumped iOS to 3.7.1 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.7.1)
- Bumped Android to 3.5.0 [Changelog here](https://github.com/RevenueCat/purchases-android/releases/tag/3.5.0)
- Added a new property `nonSubscriptionTransactions` in `PurchaserInfo` to better manage non-subscriptions
- Attribution V2:
 - Deprecated addAttribution in favor of setAdjustId, setAppsflyerId, setFbAnonymousId, setMparticleId.
 - Added support for OneSignal via setOnesignalId
 - Added setMediaSource, setCampaign, setAdGroup, setAd, setKeyword, setCreative, and collectDeviceIdentifiers

## 3.3.3

- Removes usage of BuildConfig [#171](https://github.com/RevenueCat/react-native-purchases/pull/171)
- Bumped common files to 1.3.1 [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.3.1)
- Bumped iOS to 3.5.1 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases/tag/3.5.1)
- Bumped Android to 3.3.0 [Changelog here](https://github.com/RevenueCat/purchases-android/releases/tag/3.3.0)

## 3.3.2

- Fixes purchaseDiscountedPackage and purchaseDiscountedProduct [#167](https://github.com/RevenueCat/react-native-purchases/pull/167)

## 3.3.1

- Renames setProxyURLString with setProxyURL [#148](https://github.com/RevenueCat/react-native-purchases/pull/148)
- Adds instructions to include the PurchasesHybridCommon framework [#150](https://github.com/RevenueCat/react-native-purchases/pull/150)

## 3.3.0

- Bumped iOS to 3.4.0 [Changelog here](https://github.com/RevenueCat/purchases-ios/releases)
- Bumped Android to 3.2.0 [Changelog here](https://github.com/RevenueCat/purchases-android/releases)
- Added managementURL to PurchaserInfo
- Added setProxyURLString
- Added originalPurchaseDate to PurchaserInfo
- Update invalidatePurchaserInfoCache docs [#137](https://github.com/RevenueCat/react-native-purchases/pull/137)
- Changes the way the common dependency is managed [#144](https://github.com/RevenueCat/react-native-purchases/pull/144) [#145](https://github.com/RevenueCat/react-native-purchases/pull/145)
- Adds new headers for platformFlavor and platformFlavorVersion
- Adds userDefaultsSuiteName as an option when setting up the SDK

## 3.2.0

- Adds Subscriber Attributes, which allow developers to store additional, structured information
for a user in RevenueCat. More info: https://docs.revenuecat.com/docs/user-attributes.

## 3.1.0

- Properly scope Android package [#114](https://github.com/RevenueCat/react-native-purchases/pull/114)
  - ⚠️**IMPORTANT**⚠️: You might need to relink the plugin since the Android package name has changed. All references to `com.reactlibrary.RNPurchasesPackage` in the code should be replace with `com.revenuecat.purchases.react.RNPurchasesPackage`.
- Apply correct array notation: [type] to type[] [#117](https://github.com/RevenueCat/react-native-purchases/pull/117)
- Adds subscription offers support for iOS https://docs.revenuecat.com/docs/ios-subscription-offers
- Introductory Price is now an object inside the PurchasesProduct object

## 3.0.6

- Exports enums

## 3.0.5

- Exports interfaces and types

## 3.0.4

- Renames introEligibilityStatus to status in IntroEligibility

## 3.0.3

- Adds `Purchases.checkTrialOrIntroductoryPriceEligibility`. Note that Android always returns INTRO_ELIGIBILITY_STATUS_UNKNOWN.
- Updates iOS to 3.0.1 and Android to 3.0.4

## 3.0.2

- Adds `Purchases.addShouldPurchasePromoProduct` to be able to handle purchases started from the Apple App Store.

## 3.0.1

- Updates Android SDK to 3.0.3 which should fix issues with restores and syncs.

## 3.0.0

- Support for new Offerings system.
- Deprecates `makePurchase` methods. Replaces with `purchasePackage`
- Deprecates `getEntitlements` method. Replaces with `getOfferings`
- See our migration guide for more info: https://docs.revenuecat.com/v3.0/docs/offerings-migration
- Updates to BillingClient 2.0.3. If finishTransactions is set to false (or observerMode is true when configuring the SDK),
this SDK won't acknowledge any purchase and you have to do it yourself.
- Adds proration mode support on upgrades/downgrades
- Adds more PurchaserInfo missing properties. `activeEntitlements`, `expirationsForActiveEntitlements`
and `purchaseDatesForActiveEntitlements` have been removed from PurchaserInfo
- `intro_price`, `intro_price_period_number_of_units` and `intro_price_cycles` are a number now or null instead of empty
 strings, `intro_price_period_unit` can also be null.
- Added Typescript types (#72)
- New identity changes:
  - The .createAlias() method is no longer required, use .identify() instead
  - .identify() will create an alias if being called from an anonymous ID generated by RevenueCat
  - Added an isAnonymous property to Purchases.sharedInstance
  - Improved offline use


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
