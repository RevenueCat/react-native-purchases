## v8 API Changes

This latest release updates the Android SDK dependency from v7 to [v8](https://github.com/RevenueCat/purchases-android/releases/tag/6.0.0) to use BillingClient 7 and updates the iOS SDK dependency from v4 to v5 to use StoreKit 2 by default in the SDK.

### Migration Guides

- See [Android Native - V8 API Migration Guide](https://github.com/RevenueCat/purchases-android/blob/main/migrations/v8-MIGRATION.md) for a more thorough explanation of the Android changes.
- See [iOS Native - V5 Migration Guide](https://github.com/RevenueCat/purchases-ios/blob/main/Sources/DocCDocumentation/DocCDocumentation.docc/V5_API_Migration_guide.md) for a more thorough explanation of the iOS changes. Notably, this version uses StoreKit 2 to process purchases by default.

### New Minimum OS Versions

This release raises the minumum required OS versions to the following:

- iOS 13.0
- tvOS 13.0
- watchOS 6.2
- macOS 10.15
- Android: SDK 21 (Android 5.0)

### In-App Purchase Key Required for StoreKit 2

In order to use StoreKit 2, you must configure your In-App Purchase Key in the RevenueCat dashboard. You can find instructions describing how to do this [here](https://www.revenuecat.com/docs/in-app-purchase-key-configuration).

### `usesStoreKit2IfAvailable` is now `storeKitVersion`

When configuring the SDK, the `usesStoreKit2IfAvailable` parameter has been replaced by an optional `storeKitVersion: STOREKIT_VERSION` parameter. It defaults to letting the iOS SDK determine the most appropriate version of StoreKit at runtime. If you'd like to use a specific version of StoreKit, you may provide a value for `storeKitVersion` like so:

```typescript
Purchases.configure({
    apiKey,
    STOREKIT_VERSION.STOREKIT_1,
});
```

### Observer Mode is now PurchasesAreCompletedBy

Version 8.0 of the SDK deprecates the term "Observer Mode" (and the APIs where this term was used), and replaces it with `PurchasesAreCompletedBy` (either RevenueCat or your app). When specifying that your app will complete purchases, you must provide the StoreKit version that your app is using to make purchases on iOS. If your app is only available on Android, you may provide any value since the native Android SDK ignores this value.

You can enable it when configuring the SDK:

```typescript
Purchases.configure({
    apiKey,
    appUserID,
    {
        type: PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP,
        storeKitVersion: STOREKIT_VERSION.STOREKIT_2,
    },
});
```

#### ⚠️ Observing Purchases Completed by Your App on macOS

By default, when purchases are completed by your app using StoreKit 2 on macOS, the SDK does not detect a user's purchase until after the user foregrounds the app after the purchase has been made. If you'd like RevenueCat to immediately detect the user's purchase, call `Purchases.recordPurchase(productID)` for any new purchases, like so:

```typescript
await Purchases.recordPurchase(productID);
```

#### Observing Purchases Completed by Your App with StoreKit 1

If purchases are completed by your app using StoreKit 1, you will need to explicitly configure the SDK to use StoreKit 1:

```typescript
Purchases.configure({
    apiKey,
    appUserID,
    {
        type: PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP,
        storeKitVersion: STOREKIT_VERSION.STOREKIT_1,
    },
});
```

### Reporting undocumented issues:

Feel free to file an issue! [New RevenueCat Issue](https://github.com/RevenueCat/purchases-flutter/issues/new/).
