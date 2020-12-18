
//
//  Created by RevenueCat.
//  Copyright © 2019 RevenueCat. All rights reserved.
//

#import "RNPurchases.h"

@import StoreKit;


@interface RNPurchases () <RCPurchasesDelegate>

@property(nonatomic, retain) NSMutableArray<RCDeferredPromotionalPurchaseBlock> *defermentBlocks;

@end

NSString *RNPurchasesPurchaserInfoUpdatedEvent = @"Purchases-PurchaserInfoUpdated";
NSString *RNPurchasesShouldPurchasePromoProductEvent = @"Purchases-ShouldPurchasePromoProduct";

@implementation RNPurchases

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[RNPurchasesPurchaserInfoUpdatedEvent, RNPurchasesShouldPurchasePromoProductEvent];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setupPurchases:(NSString *)apiKey
                  appUserID:(nullable NSString *)appUserID
                  observerMode:(BOOL)observerMode
                  userDefaultsSuiteName:(nullable NSString *)userDefaultsSuiteName
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [RCPurchases configureWithAPIKey:apiKey
                           appUserID:appUserID
                        observerMode:observerMode
               userDefaultsSuiteName:userDefaultsSuiteName
                      platformFlavor:self.platformFlavor
               platformFlavorVersion:self.platformFlavorVersion];
    RCPurchases.sharedPurchases.delegate = self;
    [RCCommonFunctionality configure];
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

RCT_EXPORT_METHOD(addAttributionData:(NSDictionary *)data
                  forNetwork:(NSInteger)network
                  forNetworkUserId:(nullable NSString *)networkUserId)
{
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
    [RCCommonFunctionality addAttributionData:data network:network networkUserId:networkUserId];
#pragma GCC diagnostic pop
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
                 signedDiscountTimestamp:(NSString *)signedDiscountTimestamp
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality purchaseProduct:productIdentifier
                   signedDiscountTimestamp:signedDiscountTimestamp
                           completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}


RCT_REMAP_METHOD(purchasePackage,
                 purchasePackage:(NSString *)packageIdentifier
                 offeringIdentifier:(NSString *)offeringIdentifier
                 upgradeInfo:(NSDictionary *)upgradeInfo
                 signedDiscountTimestamp:(NSString *)signedDiscountTimestamp
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality purchasePackage:packageIdentifier
                                  offering:offeringIdentifier
                   signedDiscountTimestamp:signedDiscountTimestamp
                           completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
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

RCT_EXPORT_METHOD(createAlias:(nullable NSString *)newAppUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality createAlias:newAppUserID
                       completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(identify:(nullable NSString *)appUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality identify:appUserID
                    completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
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

RCT_EXPORT_METHOD(makeDeferredPurchase:(nonnull NSNumber *)callbackID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    RCDeferredPromotionalPurchaseBlock defermentBlock = [self.defermentBlocks objectAtIndex:[callbackID integerValue]];
    [RCCommonFunctionality makeDeferredPurchase:defermentBlock
                                completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(checkTrialOrIntroductoryPriceEligibility:(NSArray *)products
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality checkTrialOrIntroductoryPriceEligibility:products
                                                    completionBlock:^(NSDictionary<NSString *,RCIntroEligibility *> * _Nonnull responseDictionary) {
        resolve([NSDictionary dictionaryWithDictionary:responseDictionary]);
    }];
}

RCT_REMAP_METHOD(getPaymentDiscount,
                 getPaymentDiscountForProductIdentifier:(NSString *)productIdentifier
                 discountIdentifier:(nullable NSString *)discountIdentifier
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    [RCCommonFunctionality paymentDiscountForProductIdentifier:productIdentifier
                                                      discount:discountIdentifier
                                               completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(invalidatePurchaserInfoCache)
{
    [RCCommonFunctionality invalidatePurchaserInfoCache];
}

#pragma mark - Subscriber Attributes

RCT_EXPORT_METHOD(setProxyURLString:(nullable NSString *)proxyURLString)
{
    [RCCommonFunctionality setProxyURLString:proxyURLString];
}

RCT_EXPORT_METHOD(setAttributes:(NSDictionary *)attributes)
{
    [RCCommonFunctionality setAttributes:attributes];
}

RCT_EXPORT_METHOD(setEmail:(NSString *)email)
{
    [RCCommonFunctionality setEmail:email];
}

RCT_EXPORT_METHOD(setPhoneNumber:(NSString *)phoneNumber)
{
    [RCCommonFunctionality setPhoneNumber:phoneNumber];
}

RCT_EXPORT_METHOD(setDisplayName:(NSString *)displayName)
{
    [RCCommonFunctionality setDisplayName:displayName];
}

RCT_EXPORT_METHOD(setPushToken:(NSString *)pushToken)
{
    [RCCommonFunctionality setPushToken:pushToken];
}

# pragma mark Attribution IDs

RCT_EXPORT_METHOD(collectDeviceIdentifiers)
{
    [RCCommonFunctionality collectDeviceIdentifiers];
}

RCT_EXPORT_METHOD(setAdjustID:(NSString *)adjustID)
{
    [RCCommonFunctionality setAdjustID:adjustID];
}

RCT_EXPORT_METHOD(setAppsflyerID:(NSString *)appsflyerID)
{
    [RCCommonFunctionality setAppsflyerID:appsflyerID];
}

RCT_EXPORT_METHOD(setFBAnonymousID:(NSString *)fbAnonymousID)
{
    [RCCommonFunctionality setFBAnonymousID:fbAnonymousID];
}

RCT_EXPORT_METHOD(setMparticleID:(NSString *)mparticleID)
{
    [RCCommonFunctionality setMparticleID:mparticleID];
}

RCT_EXPORT_METHOD(setOnesignalID:(NSString *)onesignalID)
{
    [RCCommonFunctionality setOnesignalID:onesignalID];
}

# pragma mark Campaign parameters

RCT_EXPORT_METHOD(setMediaSource:(NSString *)mediaSource)
{
    [RCCommonFunctionality setMediaSource:mediaSource];
}

RCT_EXPORT_METHOD(setCampaign:(NSString *)campaign)
{
    [RCCommonFunctionality setCampaign:campaign];
}

RCT_EXPORT_METHOD(setAdGroup:(NSString *)adGroup)
{
    [RCCommonFunctionality setAdGroup:adGroup];
}

RCT_EXPORT_METHOD(setAd:(NSString *)ad)
{
    [RCCommonFunctionality setAd:ad];
}

RCT_EXPORT_METHOD(setKeyword:(NSString *)keyword)
{
    [RCCommonFunctionality setKeyword:keyword];
}

RCT_EXPORT_METHOD(setCreative:(NSString *)creative)
{
    [RCCommonFunctionality setCreative:creative];
}

    
#pragma mark -
#pragma mark Delegate Methods
- (void)purchases:(RCPurchases *)purchases didReceiveUpdatedPurchaserInfo:(RCPurchaserInfo *)purchaserInfo {
    [self sendEventWithName:RNPurchasesPurchaserInfoUpdatedEvent body:purchaserInfo.dictionary];
}

- (void)purchases:(RCPurchases *)purchases shouldPurchasePromoProduct:(SKProduct *)product defermentBlock:(RCDeferredPromotionalPurchaseBlock)makeDeferredPurchase {
    if (!self.defermentBlocks) {
        self.defermentBlocks = [NSMutableArray array];
    }
    [self.defermentBlocks addObject:makeDeferredPurchase];
    NSInteger position = [self.defermentBlocks count]-1;
    [self sendEventWithName:RNPurchasesShouldPurchasePromoProductEvent body:@{@"callbackID": @(position)}];
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
        } else if (responseDictionary) {
            resolve([NSDictionary dictionaryWithDictionary:responseDictionary]);
        } else {
            resolve(nil);
        }
    };
}

- (NSString *)platformFlavor {
    return @"react-native";
}

- (NSString *)platformFlavorVersion {
    return @"4.0.0";
}

@end
