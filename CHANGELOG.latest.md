**RevenueCat Purchases React Native v6** is here!! 😻

This latest release updates the Android SDK dependency from v5 to [v6](https://github.com/RevenueCat/purchases-android/releases/tag/6.0.0) to use BillingClient 5. This version of BillingClient brings an entire new subscription model which has resulted in large changes across the entire SDK.

### Migration Guides
- See [Android Native - 5.x to 6.x Migration](https://www.revenuecat.com/docs/android-native-5x-to-6x-migration) for a
  more thorough explanation of the new Google subscription model announced with BillingClient 5 and how to take
  advantage of it in V6. This guide includes tips on product setup with the new model.

### New `SubscriptionOption` concept

#### Purchasing
In v5, a Google Play Android `Package` or `StoreProduct` represented a single purchaseable entity, and free trials or intro
offers would automatically be applied to the purchase if the user was eligible.

Now, in React Native v6, an Google Play Android `Package` or `StoreProduct` represents a duration of a subscription and contains all the ways to
purchase that duration -- any offers and its base plan. Each of these purchase options are `SubscriptionOption`s.
When passing a `Package` to `purchasePackage()` or `StoreProduct` to `purchaseStoreProduct()`, the SDK will use the following logic to choose which
`SubscriptionOption` to purchase:
- Filters out offers with "rc-ignore-offer" tag
- Uses `SubscriptionOption` with the longest free trial or cheapest first phase
    - Only offers the user is eligible will be applied
- Falls back to base plan

For more control, purchase subscription options with the new `purchaseSubscriptionOption()` method.

#### Models

`StoreProduct` now has a few new properties use for Google Play Android:
- `defaultOption`
  - A subscription option that will automatically be applie when purchasing a `Package` or `StoreProduct`
- `subscriptionOptions`
  - A list of subscription options (could be null)

### Observer Mode

Observer mode is still supported in v6. Other than updating the SDK version, there are no changes required.
​
### Offline Entitlements

✨ With this new feature, even if our main and backup servers are down, the SDK can continue to process purchases. This is enabled transparently to the user, and when the servers come back online, the SDK automatically syncs the information so it can be visible in the dashboard.

### Offering Metadata

✨ Metadata allows attaching arbitrary information as key/value pairs to your Offering to control how to display your products inside your app. The metadata you configure in an Offering is available from the RevenueCat SDK. For example, you could use it to remotely configure strings on your paywall, or even URLs of images shown on the paywall.

See the [metadata documentation](https://www.revenuecat.com/docs/offering-metadata) for more info!
