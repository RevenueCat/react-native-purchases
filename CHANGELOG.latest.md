## RevenueCat SDK
> [!WARNING]  
> If you don't have any login system in your app, please make sure your one-time purchase products have been correctly configured in the RevenueCat dashboard as either consumable or non-consumable. If they're incorrect as consumables, RevenueCat will consume these purchases. This means that customers won't be able to restore them from version 10.0.0 onward.
> Non-consumables are products that are meant to be bought only once, for example, lifetime subscriptions. Please see more information in our [docs](https://www.revenuecat.com/docs/known-store-issues/play-billing-library/restore-consumable-purchases-bc8)

### 💥 Breaking Changes
This release updates to Billing Library 8.3.0 with min SDK supported of Android 6 (API 23), previously min was 21. It also removes a previous workaround used to be able to restore consumed one time products which is not available anymore.

* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 18.0.0 (#1729) via RevenueCat Git Bot (@RCGitBot)
  * [Android 10.1.2](https://github.com/RevenueCat/purchases-android/releases/tag/10.1.2)
  * [Android 10.1.1](https://github.com/RevenueCat/purchases-android/releases/tag/10.1.1)
  * [Android 10.1.0](https://github.com/RevenueCat/purchases-android/releases/tag/10.1.0)
  * [Android 10.0.2](https://github.com/RevenueCat/purchases-android/releases/tag/10.0.2)
  * [Android 10.0.1](https://github.com/RevenueCat/purchases-android/releases/tag/10.0.1)
  * [Android 9.29.1](https://github.com/RevenueCat/purchases-android/releases/tag/9.29.1)
  * [Android 10.0.0](https://github.com/RevenueCat/purchases-android/releases/tag/10.0.0)
  * [iOS 5.67.2](https://github.com/RevenueCat/purchases-ios/releases/tag/5.67.2)

### 🔄 Other Changes
* Skip test cases list in maestro tests using launch arguments (#1722) via Antonio Pallares (@ajpallares)
* Add CircleCI job for maestro E2E tests (#1637) via Antonio Pallares (@ajpallares)
* Bump fastlane-plugin-revenuecat_internal from `894bb1b` to `20911d1` (#1728) via dependabot[bot] (@dependabot[bot])
* Bump fastlane-plugin-revenuecat_internal from `ceecf91` to `894bb1b` (#1726) via dependabot[bot] (@dependabot[bot])
* Update CODEOWNERS default owner to @RevenueCat/sdk (#1725) via Antonio Pallares (@ajpallares)
* Add maestro E2E test for purchase through paywall (#1636) via Antonio Pallares (@ajpallares)
* Add maestro E2E test app (#1635) via Antonio Pallares (@ajpallares)
* Bump addressable from 2.8.9 to 2.9.0 (#1723) via dependabot[bot] (@dependabot[bot])
* Bump addressable from 2.8.7 to 2.9.0 in /examples/purchaseTesterTypescript (#1721) via dependabot[bot] (@dependabot[bot])
* Bump addressable from 2.8.7 to 2.9.0 in /examples/MagicWeather (#1720) via dependabot[bot] (@dependabot[bot])
