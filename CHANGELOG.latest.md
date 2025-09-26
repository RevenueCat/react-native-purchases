> [!WARNING]  
> If you don't have any login system in your app, please make sure your one-time purchase products have been correctly configured in the RevenueCat dashboard as either consumable or non-consumable. If they're incorrectly configured as consumables, RevenueCat will consume these purchases. This means that users won't be able to restore them from version 9.0.0 onward.
> Non-consumables are products that are meant to be bought only once, for example, lifetime subscriptions.


### 🔄 Other Changes
* [V8] Pass current version to determine next version action (#1424) via Antonio Pallares (@ajpallares)
* [V8] [CI] `bump` pipeline action won't trigger `deploy` workflow (#1422) via Antonio Pallares (@ajpallares)
* [V8] Update PHC dependency to v14.3.0 (#1421) via Antonio Pallares (@ajpallares)
* [v8] Bump fastlane-plugin-revenuecat_internal from `7d97553` to `1593f78` (#1418) via Antonio Pallares (@ajpallares)
