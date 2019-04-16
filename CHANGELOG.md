## 2.1.2
- Updates iOS SDK to 2.1.1

## 2.1.1
- If using an app ejected from Expo, the Android project wouldn't build since it couldn't find the react-native dependency. This release should fix it.

## 2.1.0
- Updates SDK versions to 2.1.0 to include new error handling
- **BREAKING CHANGE** errors now contain a `userInfo` object with the message, an underlying error and a readable error code. The error codes have completely changed too and updated to the SDK 2.1.0.
- Updates RN and React versions.
- Fixes Windows installation

## 2.0.0
- Updates native SDKs to versions iOS 2.0.0 and Android 2.0.1
- Checks that the user ID sent to setup, identify or create alias is actually a string #28
- BREAKING CHANGE restoreTransactions returns a promise, the RestoreTransactionsListener has  been removed
- BREAKING CHANGE makePurchase returns a promise, the PurchaseListener has been removed
- BREAKING CHANGE PurchaserInfoListener has been replaced with PurchaserInfoUpdateListener and it now only sends a purchaser info object. This listener is used to listen to changes in the purchaser info.
- Added support for Tenjin
- BREAKING CHANGE When failure making a purchase, the productIdentifier of the failed purchase is not sent to the rejected promise. Before, the PurchaseListener received both productIdentifier and error objects.
- Added setDebugLogsEnabled to display debug logs.
- Added getPurchaserInfo function to get the latest purchaser info known by the SDK

## 1.5.4
- Removes unnecessary debugger statement https://github.com/RevenueCat/react-native-purchases/issues/47
- Runs Linter and prettifier
- Adds missing setup call in the example

## 1.5.3
- Fix android setup on a null appuserid 
- Adds listener removal methods

## 1.5.2
- Changes setIsUsingAnonymousID to allowSharingStoreAccount

## 1.5.1
- Fixes compilation in iOS

## 1.5.0
- Adds create alias, identify and reset

## 1.4.4
- Fixes download script issue

## 1.4.3
- Fixes build issue on the Android bridge

## 1.4.2
- Adds requestDate to the purchaser info to avoid edge cases
