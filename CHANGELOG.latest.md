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
