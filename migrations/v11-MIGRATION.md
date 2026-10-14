## v11 API Changes

This release updates the Android SDK dependency from v10 to v11, which uses Google Play Billing Library 9.1.0 and Kotlin 2.2. The iOS SDK dependency does not change major version.

### Migration Guides

- See [Android Native - V11 API Migration Guide](https://github.com/RevenueCat/purchases-android/blob/main/migrations/v11-MIGRATION.md) for a more thorough explanation of the Android changes.

### New Minimum Versions

- React Native 0.80, previously 0.73. On Expo, SDK 54.
- Android: `compileSdkVersion` 35. React Native 0.80 projects already use 35 or higher.
- Android: Kotlin 2.1.0. React Native 0.80 projects already use a newer version.

iOS and Android minimum OS versions do not change.

### React Native 0.80 or newer

The Android SDK is now compiled with Kotlin 2.2. React Native 0.79 and older pin Kotlin 2.0.21, which cannot read it, and the Android build fails with:

```
Module was compiled with an incompatible version of Kotlin.
The binary version of its metadata is 2.2.0, expected version is 2.0.0.
```

Upgrade to React Native 0.80 or newer. On Expo, that is SDK 54 or newer.

If your app overrides the Kotlin version, it must be 2.1.0 or newer: `kotlinVersion` in `android/build.gradle`, or `android.kotlinVersion` in the `expo-build-properties` config plugin on Expo.

### `syncAmazonPurchase` takes an options object and requires `purchaseTime`

`syncAmazonPurchase` now takes a single `SyncAmazonPurchaseOptions` object. `purchaseTime` is required: pass the purchase time in milliseconds since epoch from the Amazon receipt.

```typescript
// Before
await Purchases.syncAmazonPurchase(productID, receiptID, amazonUserID, isoCurrencyCode, price);

// After
await Purchases.syncAmazonPurchase({
  productID,
  receiptID,
  amazonUserID,
  isoCurrencyCode,
  price,
  purchaseTime: receipt.purchaseTime,
});
```

On Android, the returned promise now rejects with code `InvalidArguments` if `productID`, `receiptID`, `amazonUserID` or `purchaseTime` is missing. The deprecated `syncObserverModeAmazonPurchase` keeps its previous signature.

### `PurchasesEntitlementInfo.periodType` is typed as `PeriodType`

`periodType` was typed as `string`. It is now the `PeriodType` union: `"NORMAL" | "INTRO" | "TRIAL" | "PREPAID"`. Values at runtime do not change. Comparisons against any other string, such as lowercase `"trial"`, no longer compile. They never matched, so once you fix the comparison, the code behind it runs for the first time. Check it before shipping.

### Jetpack Compose and `material-icons-core` on Android

If your app has native Android code that uses Jetpack Compose, `react-native-purchases-ui` raises your Compose libraries to BOM 2026.06.01. Those versions no longer bring in `material-icons-core`, so declare it if your native code uses `Icons`. See the [Android guide](https://github.com/RevenueCat/purchases-android/blob/main/migrations/v11-MIGRATION.md#jetpack-compose-revenuecatui).

### Blocked Play Store reports `PURCHASE_NOT_ALLOWED_ERROR`

When the Play Store is blocked on the device (for example in OEM kids modes), purchases now fail with `PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR` instead of `PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR`. `STORE_PROBLEM_ERROR` is still reported for other store failures, so handle the new code alongside it rather than replacing it.

### Other Play Billing libraries in your app

The Android SDK puts Play Billing Library 9.1.0 on your app's classpath. Any other in-app purchase plugin in the same app, for example one you use to complete purchases with your own code, must support Play Billing Library 9. Versions that use APIs it removed, such as `SkuDetails`, fail at build time or at runtime.

### Reporting undocumented issues:

Feel free to file an issue! [New RevenueCat Issue](https://github.com/RevenueCat/react-native-purchases/issues/new/).
