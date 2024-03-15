### New Features
* Add `displayCloseButton` option to `PaywallView` (#913) via Cesar de la Vega (@vegaro)
  * This changes the behavior of the PaywallView and FooterPaywallView in iOS, which were being dismissed automatically after a successful purchase. After this change, iOS matches existing Android's behavior, in which the `onDismiss` callback will get called whenever the paywall should be dismissed: after the user presses the close button, or after a successful purchase.
### Dependency Updates
* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 10.2.0 (#940) via RevenueCat Git Bot (@RCGitBot)
  * [Android 7.7.2](https://github.com/RevenueCat/purchases-android/releases/tag/7.7.2)
  * [iOS 4.39.0](https://github.com/RevenueCat/purchases-ios/releases/tag/4.39.0)
  * [iOS 4.38.1](https://github.com/RevenueCat/purchases-ios/releases/tag/4.38.1)
  * [iOS 4.38.0](https://github.com/RevenueCat/purchases-ios/releases/tag/4.38.0)
* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 10.1.0 (#938) via RevenueCat Git Bot (@RCGitBot)
  * [Android 7.7.2](https://github.com/RevenueCat/purchases-android/releases/tag/7.7.2)
  * [iOS 4.39.0](https://github.com/RevenueCat/purchases-ios/releases/tag/4.39.0)
  * [iOS 4.38.1](https://github.com/RevenueCat/purchases-ios/releases/tag/4.38.1)
  * [iOS 4.38.0](https://github.com/RevenueCat/purchases-ios/releases/tag/4.38.0)
### Other Changes
* Make hotfixes not deploy with the latest tag nor update latest docs (#937) via Toni Rico (@tonidero)
* Update RELEASING.md (#936) via Cesar de la Vega (@vegaro)
* Add 6.7.2 to changelog (#935) via Cesar de la Vega (@vegaro)
