## 5.0.0-beta.3

⚠️⚠️ This is a pre-release version. ⚠️⚠️

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

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesStoreProductProduct.price_string` | `PurchasesStoreProductProduct.priceString` |
| `PurchasesStoreProductProduct.currency_code` | `PurchasesStoreProductProduct.currencyCode` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |
