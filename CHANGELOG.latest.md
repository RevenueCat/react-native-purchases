- This release has some changes that should help prevent "There is no singleton instance" errors.
    - Added `isConfigured` function to be able to check if the instance of Purchases has been configured before calling any function that accesses the singleton instance.
    - Some functions that were returning `void`, now return `Promise<void>`: `setAllowSharingStoreAccount`, `setFinishTransactions`, `setSimulatesAskToBuyInSandbox`, `addAttributionData`, `setDebugLogsEnabled`, `syncPurchases`, `setAutomaticAppleSearchAdsAttributionCollection`, `invalidatePurchaserInfoCache`, `presentCodeRedemptionSheet`, and all the subscriber attributes related functions.
    - Accessing a function that accesses the singleton instance before it has been setup will now reject with a `UninitializedPurchasesError`.
    - Related issue: https://github.com/RevenueCat/react-native-purchases/issues/101
    - Related PR: https://github.com/RevenueCat/react-native-purchases/pull/310

- Bump`purchases-hybrid-common` to `1.11.1` [Changelog here](https://github.com/RevenueCat/purchases-hybrid-common/releases/tag/1.10.1)
- Bump `purchases-ios` to `3.13.1` ([Changelog here](https://github.com/RevenueCat/purchases-ios/releases/3.13.1))
- Bump `purchases-android` to `4.6.0` ([Changelog here](https://github.com/RevenueCat/purchases-android/releases/4.6.0))
