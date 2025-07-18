## RevenueCat SDK
This release updates the SDK to use Google Play Billing Library 8. This version of the Billing Library removed APIs to query for expired subscriptions and consumed one-time products, aside from other improvements. You can check the full list of changes here: https://developer.android.com/google/play/billing/release-notes#8-0-0

Additionally, we've also updated Kotlin to 2.0.21 and our new minimum version is Kotlin 1.8.0+. If you were using an older version of Kotlin, you will need to update it.

#### Play Billing Library 8: No expired subscriptions or consumed one-time products
Note: the following is only relevant if you recently integrated RevenueCat, and do not (yet) have all your transactions imported.

Play Billing Library 8 removed functionality to query expired subscriptions or consumed one-time products. This means that, for users migrating from a non-RevenueCat implementation of the Play Billing Library, the SDK will not be able to send purchase information from these purchases. We can still ingest historical data from these purchases through a backend historical import. See [docs](https://www.revenuecat.com/docs/migrating-to-revenuecat/migrating-existing-subscriptions). This doesn't affect developers that have all transactions in RevenueCat, which is true for the vast majority.

#### Using the SDK with your own IAP code (previously Observer Mode)
Using the SDK with your own IAP code is still supported in v9. Other than updating the SDK version, there are no changes required. Just make sure the version of the Play Billing Library is also version 8.0.0+.

### ✨ New features
* Add web target with fake data (#1307) via Toni Rico (@tonidero)

Now, our libraries will work when you try to run your react native app on web. However, they will just respond with hardcoded fakes for now. Full web support will arrive in future releases.

### 💥 Breaking Changes
* [AUTOMATIC BUMP] Updates purchases-hybrid-common to 15.0.0 (#1333) via RevenueCat Git Bot (@RCGitBot)
  * [Android 9.1.0](https://github.com/RevenueCat/purchases-android/releases/tag/9.1.0)
  * [Android 9.0.1](https://github.com/RevenueCat/purchases-android/releases/tag/9.0.1)
  * [Android 9.0.0](https://github.com/RevenueCat/purchases-android/releases/tag/9.0.0)
  * [iOS 5.33.0](https://github.com/RevenueCat/purchases-ios/releases/tag/5.33.0)

### 🔄 Other Changes
* Make hold job wait for tests to pass (#1332) via Cesar de la Vega (@vegaro)
