## RevenueCat SDK
> [!WARNING]  
> If you don't have a login system in your app, please make sure your one-time purchase products have been correctly configured in the RevenueCat dashboard as either consumable or non-consumable. If they're incorrectly configured as consumables, RevenueCat will consume these purchases. This means that users won't be able to restore them from version 9.0.0 onward.
> Non-consumables are products that are meant to be bought only once, for example, lifetime subscriptions.

### ✨ New Features
* Add override preferred locale methods (#1392) via Antonio Pallares (@ajpallares)
* Support automaticDeviceIdentifierCollectionEnabled when configuring the SDK (#1390) via Toni Rico (@tonidero)
### 📦 Dependency Updates
* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 17.5.1 (#1394) via RevenueCat Git Bot (@RCGitBot)
  * [Android 9.5.0](https://github.com/RevenueCat/purchases-android/releases/tag/9.5.0)
  * [iOS 5.37.0](https://github.com/RevenueCat/purchases-ios/releases/tag/5.37.0)
* [RENOVATE] Update dependency com.android.tools.build:gradle to v8.13.0 (#1393) via RevenueCat Git Bot (@RCGitBot)
* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 17.5.0 (#1391) via RevenueCat Git Bot (@RCGitBot)
  * [Android 9.5.0](https://github.com/RevenueCat/purchases-android/releases/tag/9.5.0)
  * [iOS 5.37.0](https://github.com/RevenueCat/purchases-ios/releases/tag/5.37.0)
* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 17.4.0 (#1387) via RevenueCat Git Bot (@RCGitBot)
  * [Android 9.5.0](https://github.com/RevenueCat/purchases-android/releases/tag/9.5.0)
  * [iOS 5.37.0](https://github.com/RevenueCat/purchases-ios/releases/tag/5.37.0)

## RevenueCatUI SDK
### Customer Center
#### ✨ New Features
* Add support for iOS close button in customer center (#1384) via Facundo Menzella (@facumenzella)

### 🔄 Other Changes
* Passing the PresentedOfferingContext from the Offering to the PHC APIs when navigating to a paywall (#1371) via Rick (@rickvdl)
