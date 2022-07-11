## 5.0.0-beta.1

⚠️⚠️ This is a pre-release version. ⚠️⚠️

#### StoreKit 2 support
This version of the SDK automatically uses StoreKit 2 APIs under the hood only for APIs that the RevenueCat team has determined work better than StoreKit 1.

#### New types and cleaned up naming
New types that wrap native types from Apple, Google and Amazon, and we cleaned up the naming of other types and methods for a more consistent experience. 

### Removed APIs
- `identify` and `createAlias` have been removed in favor of `logIn`.
- `reset` has been removed in favor of `logOut`.
- `addAttributionData` has been removed in favor of `set<NetworkID> methods`.

### Renamed APIs

| 4.x | 5.0.0 |
| :-: | :-: |
| `PurchaserInfo` | `CustomerInfo` |
| `PurchasesProduct` | `PurchasesStoreProduct` |
| `PurchasesTransaction` | `PurchasesStoreTransaction` |
| `PurchasesDiscount` | `PurchasesStoreProductDiscount` |
| `PurchasesPaymentDiscount` | `PurchasesPromotionalOffer` |
| `Purchases.restoreTransactions` | `Purchases.restorePurchases` |
| `Purchases.getPaymentDiscount` | `Purchases.getPromotionalOffer` |
| `Purchases.invalidatePurchaserInfoCache` | `Purchases.invalidateCustomerInfoCache` |
| `Purchases.addPurchaserInfoUpdateListener` | `Purchases.addCustomerInfoUpdateListener` |
| `Purchases.removePurchaserInfoUpdateListener` | `Purchases.removeCustomerInfoUpdateListener` |
| `PurchasesStoreProduct.introPrice` | `PurchasesStoreProduct.intro_price` |

### Known issues:
- Amazon support currently doesn't work correctly.
