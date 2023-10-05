**RevenueCat React Native SDK v7** is here!! 😻

This latest release updates the SDK to use BillingClient 6 in Android. This version of BillingClient brings little change compared with BillingClient 5 which brought an entire new subscription model which resulted in large changes across the entire SDK.

The only modification at the API level involves replacing "ProrationMode" with "ReplacementMode". The specific replacement modes remain unchanged.

If your app doesn't currently use DEFERRED replacement modes, then you should be safe to upgrade to this version without changes in behavior.

If your app supports product changes using [DEFERRED replacement mode](https://www.revenuecat.com/docs/managing-subscriptions#google-play), then you can either stick with the previous major version until support for DEFERRED is re-introduced in this major version, or you can remove DEFERRED replacement options from your app.

If you are using the SDK in observer mode, you should only use v7 in Android if you're using BillingClient 6.

See the [Android Native - 6.x to 7.x Migration](https://github.com/RevenueCat/purchases-android/blob/main/migrations/v7-MIGRATION.md) for more details.

If you come from an older version of the RevenueCat SDK, see [Android Native - 5.x to 6.x Migration](https://www.revenuecat.com/docs/android-native-5x-to-6x-migration) for a more thorough explanation of the new Google subscription model announced with BillingClient 5 and how to take advantage of it.

### Bumped minimum Android SDK version

RevenueCat SDK v7 bumps minimum Android SDK version from Android 4.0 (API level 16) to Android 4.4 (API level 19).

### Support for InApp Messages

We've added new APIs to support InApp messages both in Android and iOS. You can read more about:
* [Google Play InApp Messages](https://rev.cat/googleplayinappmessaging) which will show users a snackbar message during grace period and account hold once per day and provide them an opportunity to fix their payment without leaving the app. 
* [App Store InApp messages](https://rev.cat/storekit-message) which will show a modal during grace period once per subscription.

InApp Messages are shown by default in both platforms. If you want to disable this behaviour during configuration of the RevenueCat SDK, setup the `shouldShowInAppMessagesAutomatically` property during configuration to `false`:

```typescript
  Purchases.configure({
    apiKey,
    appUserID,
    observerMode,
    userDefaultsSuiteName,
    usesStoreKit2IfAvailable,
    useAmazon,
    shouldShowInAppMessagesAutomatically
  });
```

### Dependency Updates
* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 7.0.0 and temporarily removes `DEFERRED` proration mode (#747) via RevenueCat Git Bot (@RCGitBot)
  * [Android 7.0.0](https://github.com/RevenueCat/purchases-android/releases/tag/7.0.0)
  * [iOS 4.27.0](https://github.com/RevenueCat/purchases-ios/releases/tag/4.27.0)
  * [iOS 4.26.2](https://github.com/RevenueCat/purchases-ios/releases/tag/4.26.2)
* Bump cocoapods from 1.12.1 to 1.13.0 (#740) via dependabot[bot] (@dependabot[bot])

