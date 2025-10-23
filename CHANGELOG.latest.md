> [!WARNING]  
> If you don't have any login system in your app, please make sure your one-time purchase products have been correctly configured in the RevenueCat dashboard as either consumable or non-consumable. If they're incorrectly configured as consumables, RevenueCat will consume these purchases. This means that users won't be able to restore them from version 9.0.0 onward.
> Non-consumables are products that are meant to be bought only once, for example, lifetime subscriptions.


## RevenueCatUI SDK
### Customer Center
#### ✨ New Features
* Add missing handlers for Customer Center (#1411) via Facundo Menzella (@facumenzella)

### 🔄 Other Changes
* Bump fastlane-plugin-revenuecat_internal from `25c7fb8` to `525d48c` (#1455) via dependabot[bot] (@dependabot[bot])
* Update Xcode versions to avoid CircleCI deprecation (#1454) via Antonio Pallares (@ajpallares)
* Update React Native to v0.82 and RevenueCat to 9.5.4 (#1452) via Jens-Fabian Goetzmann (@jefago)
* Improve API key validation error for native API key when running on Expo GO (#1447) via Rick (@rickvdl)
* Removed the async keyword from setupPurchases since no async calls are being made (#1451) via Rick (@rickvdl)
* Bump rexml from 3.4.1 to 3.4.2 in /examples/MagicWeather (#1410) via dependabot[bot] (@dependabot[bot])
