
//
//  Created by RevenueCat.
//  Copyright © 2019 RevenueCat. All rights reserved.
//

#import "RNPurchases.h"

@import StoreKit;

#import "RCPurchaserInfo+HybridAdditions.h"
#import "RCCommonFunctionality.h"
#import "RCErrorContainer.h"

@interface RNPurchases () <RCPurchasesDelegate>

@end

NSString *RNPurchasesPurchaserInfoUpdatedEvent = @"Purchases-PurchaserInfoUpdated";

@implementation RNPurchases

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[RNPurchasesPurchaserInfoUpdatedEvent];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setupPurchases:(NSString *)apiKey
                  appUserID:(NSString *)appUserID
                  observerMode:(BOOL)observerMode
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [RCPurchases configureWithAPIKey:apiKey appUserID:appUserID observerMode:observerMode];
    RCPurchases.sharedPurchases.delegate = self;
    resolve(nil);
}

RCT_EXPORT_METHOD(setAllowSharingStoreAccount:(BOOL)allowSharingStoreAccount)
{
    [RCCommonFunctionality setAllowSharingStoreAccount:allowSharingStoreAccount];
}

RCT_EXPORT_METHOD(setFinishTransactions:(BOOL)finishTransactions)
{
    [RCCommonFunctionality setFinishTransactions:finishTransactions];
}

RCT_REMAP_METHOD(addAttributionData, 
                 addAttributionData:(NSDictionary *)data 
                 forNetwork:(NSInteger)network
                 forNetworkUserId:(NSString * _Nullable)networkUserId)
{
    [RCCommonFunctionality addAttributionData:data network:network networkUserId:networkUserId];
}

RCT_REMAP_METHOD(getOfferings,
                 getOfferingsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality getOfferingsWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(getProductInfo:(NSArray *)products
                  type:(NSString *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality getProductInfo:products completionBlock:^(NSArray<NSDictionary *> *productObjects) {
        resolve(productObjects);
    }];
}

RCT_REMAP_METHOD(purchaseProduct,
                 purchaseProduct:(NSString *)productIdentifier
                 upgradeInfo:(NSDictionary *)upgradeInfo
                 type:(NSString *)type
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality purchaseProduct:productIdentifier completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}


RCT_REMAP_METHOD(purchasePackage,
                 purchasePackage:(NSString *)packageIdentifier
                 offeringIdentifier:(NSString *)offeringIdentifier
                 upgradeInfo:(NSDictionary *)upgradeInfo
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality purchasePackage:packageIdentifier offering:offeringIdentifier completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_REMAP_METHOD(restoreTransactions,
                 restoreTransactionsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality restoreTransactionsWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_REMAP_METHOD(getAppUserID,
                 getAppUserIDWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    resolve([RCCommonFunctionality appUserID]);
}

RCT_EXPORT_METHOD(createAlias:(NSString * _Nullable)newAppUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality createAlias:newAppUserID completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(identify:(NSString * _Nullable)appUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality identify:appUserID completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_REMAP_METHOD(reset,
                 resetWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality resetWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_REMAP_METHOD(setDebugLogsEnabled,
                 debugLogsEnabled:(BOOL)enabled) {
    [RCCommonFunctionality setDebugLogsEnabled:enabled];
}

RCT_REMAP_METHOD(getPurchaserInfo,
                   purchaserInfoWithResolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality getPurchaserInfoWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(setAutomaticAppleSearchAdsAttributionCollection:(BOOL)automaticAppleSearchAdsAttributionCollection)
{
    [RCCommonFunctionality setAutomaticAppleSearchAdsAttributionCollection:automaticAppleSearchAdsAttributionCollection];
}

RCT_REMAP_METHOD(isAnonymous,
                 isAnonymousWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    resolve(@([RCCommonFunctionality isAnonymous]));
}
    
#pragma mark -
#pragma mark Delegate Methods
- (void)purchases:(RCPurchases *)purchases didReceiveUpdatedPurchaserInfo:(RCPurchaserInfo *)purchaserInfo {
    [self sendEventWithName:RNPurchasesPurchaserInfoUpdatedEvent body:purchaserInfo.dictionary];
}

#pragma mark -
#pragma mark Helper Methods

- (void)rejectPromiseWithBlock:(RCTPromiseRejectBlock)reject error:(NSError *)error {
    reject([NSString stringWithFormat: @"%ld", (long)error.code], error.localizedDescription, error);
}

- (void (^)(NSDictionary *, RCErrorContainer *))getResponseCompletionBlockWithResolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
    return ^(NSDictionary *_Nullable responseDictionary, RCErrorContainer *_Nullable error) {
        if (error) {
            reject([NSString stringWithFormat: @"%ld", (long)error.code], error.message, error.error);
        } else {
            resolve([NSDictionary dictionaryWithDictionary:responseDictionary]);
        }
    };
}

@end
  
