> [!WARNING]
> This release fixes a bug where device identifiers (`$idfa`, `$idfv`, `$ip`, `$deviceVersion`) were collected on iOS when setting an attribution ID, even with `automaticDeviceIdentifierCollectionEnabled` set to `false`. Identifiers already collected are not cleared automatically; the app must clear them.

## RevenueCat SDK
### 🐞 Bugfixes
* Fix iOS ignoring `automaticDeviceIdentifierCollectionEnabled` in `configure` (RevenueCat/purchases-hybrid-common#1956) via Álvaro Brey (@AlvaroBrey)
### 📦 Dependency Updates
* Updates purchases-hybrid-common to 17.55.2 (#2011) via Álvaro Brey (@AlvaroBrey)
  * [Android 9.29.0](https://github.com/RevenueCat/purchases-android/releases/tag/9.29.0)
  * [iOS 5.67.1](https://github.com/RevenueCat/purchases-ios/releases/tag/5.67.1)
