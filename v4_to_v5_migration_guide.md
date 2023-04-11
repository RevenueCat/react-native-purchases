### New features

#### Amazon store support
We have introduced support for using the Amazon Store. You can enable Amazon Store support by configuring the SDK using the new configure function:
```
Purchases.configure({ apiKey: "AMAZON_API_KEY", useAmazon: true });
```

For more information around configuration please take a look at the [Amazon Store section in our docs](https://docs.revenuecat.com/docs/amazon-platform-resources). The official [Amazon In-App Purchasing docs](https://developer.amazon.com/docs/in-app-purchasing/iap-overview.html) also contain very valuable information, specially around testing and best practices.


#### Apple AdServices support
New method for automatic collecting of attribution tokens on iOS and macOS using AdServices - `Purchases.enableAdServicesAttributionTokenCollection()`

#### StoreKit 2 support
This version of the SDK automatically uses StoreKit 2 APIs under the hood only for APIs that the RevenueCat team has determined work better than StoreKit 1.

#### New types and cleaned up naming
New types that wrap native types from Apple, Google and Amazon, and we cleaned up the naming of other types and methods for a more consistent experience.

### Removed APIs
- `setUp` has been removed in favor of `configure`
- `configure` now expects an Object for the different parameters. Example:
```javascript
Purchases.configure({
    apiKey: "key",
    appUserID: "user ID",
    observerMode: false,
    userDefaultsSuiteName: "suite name",
    usesStoreKit2IfAvailable: true,
    useAmazon: true
});
```
- `identify` and `createAlias` have been removed in favor of `logIn`.
- `reset` has been removed in favor of `logOut`.
- `addAttributionData` has been removed in favor of `set<NetworkID> methods`.
- `PurchasesStoreProduct`: removed `intro_price_string`, `intro_price_period`, `intro_price_cycles`, `intro_price_period_unit`, `intro_price_period_number_of_units` in favor of new `introPrice: PurchasesIntroPrice`.
- `PurchasesStoreTransaction`: removed `revenueCatId` and `productId` in favor of `transactionIdentifier` and `productIdentifier` respectively.

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesStoreProductProduct.price_string` | `PurchasesStoreProductProduct.priceString` |
| `PurchasesStoreProductProduct.currency_code` | `PurchasesStoreProductProduct.currencyCode` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesTransaction.revenueCatId` | `PurchasesStoreTransaction.transactionIdentifier` |
| `PurchasesTransaction.productId` | `PurchasesStoreTransaction.productIdentifier` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |

