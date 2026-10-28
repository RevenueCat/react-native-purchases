## RevenueCat SDK
### CocoaPods
Because of the CocoaPods trunk freeze (November 1 to 7), the `PurchasesHybridCommon` 20.1.0 pod this release depends on is not published yet; it will be after November 7. Until then, iOS projects that install through CocoaPods can't resolve this version. Use the new experimental Swift Package Manager integration (React Native 0.88+, see [Migrate the React Native SDK from CocoaPods to Swift Package Manager](https://www.revenuecat.com/docs/sdk-guides/react-native-cocoapods-to-spm-migration)), or stay on 10.x until the pod is available. Expo apps should stay on 10.x for now.

CocoaPods trunk becomes permanently read-only on December 2, 2026, so a later major release will drop CocoaPods support. We recommend moving to Swift Package Manager.

This release updates the Android SDK to v11, which uses Google Play Billing Library 9.1.0, Kotlin 2.2 and Jetpack Compose BOM 2026.06.01. The iOS SDK dependency does not change major version. See the [v11 migration guide](https://github.com/RevenueCat/react-native-purchases/blob/main/migrations/v11-MIGRATION.md).

#### New minimum versions
React Native 0.80 (previously 0.73). On Android, Kotlin 2.1.0 (previously 1.8.0) and `compileSdkVersion` 35. React Native 0.80 projects already satisfy both. Minimum iOS and Android OS versions do not change.

#### API changes
- `syncAmazonPurchase` takes a single `SyncAmazonPurchaseOptions` object; `purchaseTime` (milliseconds since epoch, from the Amazon receipt) is required. On Android the promise rejects with `InvalidArguments` when `productID`, `receiptID`, `amazonUserID` or `purchaseTime` is missing.
- `PurchasesEntitlementInfo.periodType` is typed as `PeriodType` instead of `string`. Runtime values do not change.

#### Behavior changes
- iOS paywalls no longer call `onPurchaseCompleted` for purchases completed by your own `purchaseLogic` (`PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP`). This matches Android.
- iOS: when offerings fail to load during a package purchase, the promise rejects with the offerings error (for example `NETWORK_ERROR`) instead of `PRODUCT_NOT_AVAILABLE_FOR_PURCHASE`. This matches Android.
- Android: a blocked Play Store (for example OEM kids modes) now reports `PURCHASE_NOT_ALLOWED_ERROR` instead of `STORE_PROBLEM_ERROR`.
- Android: Play Billing Library 9.1.0 is on your app's classpath. Any other billing code in the app must support Play Billing Library 9; `SkuDetails` APIs were removed.
- Android: `react-native-purchases-ui` raises your Compose dependencies to at least BOM 2026.06.01.

### 💥 Breaking Changes
* Make syncAmazonPurchase take an options object with required purchaseTime (#1980) via Toni Rico (@tonidero)
* build: prepare for the purchases-android v11 Kotlin floor (#1925) via Álvaro Brey (@AlvaroBrey)

### ✨ New Features
* [Experimental] Add Swift Package Manager support (#1907) via Antonio Pallares (@ajpallares)

### 🔄 Other Changes
* ci: run Maestro flows on SwiftPM-converted MaestroTestApp (#1999) via Antonio Pallares (@ajpallares)
* refactor(checkpoints): use the PHC checkpoint bridge and migrate iOS to Objective-C (#2081) via Cesar de la Vega (@vegaro)
* docs: mention SPM support and link its migration guide in the v11 guide (#2071) via Antonio Pallares (@ajpallares)
* ci: release through SPM during the CocoaPods freeze (#2073) via Antonio Pallares (@ajpallares)
* ci: build SwiftPM test app with packaged SDKs (#1997) via Antonio Pallares (@ajpallares)
* docs: cover the iOS offerings error change in the v11 migration guide (#2063) via Álvaro Brey (@AlvaroBrey)
* Build against purchases-hybrid-common 20.0.0-SNAPSHOT (#2047) via Álvaro Brey (@AlvaroBrey)
* Add the v11 migration guide (#2031) via Álvaro Brey (@AlvaroBrey)
* Use PHC 20.0-dev TypeScript types via a temporary tarball (#1978) via Álvaro Brey (@AlvaroBrey)
