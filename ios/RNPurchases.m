
//
//  Created by RevenueCat.
//  Copyright © 2019 RevenueCat. All rights reserved.
//

#import "RNPurchases.h"

@import StoreKit;

#import "RCPurchaserInfo+HybridAdditions.h"
#import "RCEntitlement+HybridAdditions.h"
#import "SKProduct+HybridAdditions.h"

@interface RNPurchases () <RCPurchasesDelegate>

@property (nonatomic, retain) NSMutableDictionary *products;

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
    self.products = [NSMutableDictionary new];
    [RCPurchases configureWithAPIKey:apiKey appUserID:appUserID observerMode:observerMode];
    RCPurchases.sharedPurchases.delegate = self;
    resolve(nil);
}

RCT_EXPORT_METHOD(setAllowSharingStoreAccount:(BOOL)allowSharingStoreAccount)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    RCPurchases.sharedPurchases.allowSharingAppStoreAccount = allowSharingStoreAccount;
}

RCT_EXPORT_METHOD(setFinishTransactions:(BOOL)finishTransactions)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    RCPurchases.sharedPurchases.finishTransactions = finishTransactions;
}

RCT_REMAP_METHOD(addAttributionData, 
                 addAttributionData:(NSDictionary *)data 
                 forNetwork:(NSInteger)network
                 forNetworkUserId:(NSString * _Nullable)networkUserId)
{
    [RCPurchases addAttributionData:data fromNetwork:(RCAttributionNetwork)network forNetworkUserId:networkUserId];
}

RCT_REMAP_METHOD(getEntitlements,
                 getEntitlementsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases entitlementsWithCompletionBlock:^(RCEntitlements * _Nullable entitlements, NSError * _Nullable error) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else {
            NSMutableDictionary *result = [NSMutableDictionary new];
            for (NSString *entId in entitlements) {
                RCEntitlement *entitlement = entitlements[entId];
                result[entId] = entitlement.dictionary;
            }
            
            for (RCEntitlement *entitlement in entitlements.allValues) {
                for (RCOffering *offering in entitlement.offerings.allValues)
                {
                    SKProduct *product = offering.activeProduct;
                    if (product != nil) {
                        self.products[product.productIdentifier] = product;
                    }
                }
            }
            
            resolve([NSDictionary dictionaryWithDictionary:result]);
        }
    }];
}

RCT_EXPORT_METHOD(getProductInfo:(NSArray *)products
                  type:(NSString *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    
    [RCPurchases.sharedPurchases productsWithIdentifiers:products
                                         completionBlock:^(NSArray<SKProduct *> * _Nonnull products) {
                                             NSMutableArray *productObjects = [NSMutableArray new];
                                             for (SKProduct *p in products) {
                                                 self.products[p.productIdentifier] = p;
                                                 [productObjects addObject:p.dictionary];
                                             }
                                             resolve(productObjects);
                                         }];
}

RCT_REMAP_METHOD(makePurchase,
                 makePurchase:(NSString *)productIdentifier
                 oldSku:(NSString *)oldSku
                 type:(NSString *)type
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    
    void (^completionBlock)(SKPaymentTransaction * _Nullable, RCPurchaserInfo * _Nullable, NSError * _Nullable, BOOL) = ^(SKPaymentTransaction * _Nullable transaction, RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error, BOOL userCancelled) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else {
            resolve(@{
                      @"productIdentifier":transaction.payment.productIdentifier,
                      @"purchaserInfo": purchaserInfo.dictionary
                      });
        }
    };
    
    if (self.products[productIdentifier] == nil) {
        [RCPurchases.sharedPurchases productsWithIdentifiers:[NSArray arrayWithObjects:productIdentifier, nil]
                                             completionBlock:^(NSArray<SKProduct *> * _Nonnull products) {
                                                 NSMutableArray *productObjects = [NSMutableArray new];
                                                 for (SKProduct *p in products) {
                                                     self.products[p.productIdentifier] = p;
                                                     [productObjects addObject:p.dictionary];
                                                 }
                                                 if (self.products[productIdentifier]) {
                                                     [RCPurchases.sharedPurchases makePurchase:self.products[productIdentifier]
                                                                           withCompletionBlock:completionBlock];
                                                 } else {
                                                     [self rejectPromiseWithBlock:reject error:[NSError errorWithDomain:RCPurchasesErrorDomain
                                                                                                                   code:RCProductNotAvailableForPurchaseError
                                                                                                               userInfo:@{
                                                                                                                          NSLocalizedDescriptionKey: @"Couldn't find product."
                                                                                                                          }]];
                                                 }
                                             }];
    } else {
        [RCPurchases.sharedPurchases makePurchase:self.products[productIdentifier]
                              withCompletionBlock:completionBlock];
    }
}

RCT_REMAP_METHOD(restoreTransactions,
                 restoreTransactionsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases restoreTransactionsWithCompletionBlock:^(RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else {
            resolve(purchaserInfo.dictionary);
        }
    }];
}

RCT_REMAP_METHOD(getAppUserID,
                 getAppUserIDWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    resolve(RCPurchases.sharedPurchases.appUserID);
}

RCT_EXPORT_METHOD(createAlias:(NSString * _Nullable)newAppUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases createAlias:newAppUserID completionBlock:^(RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else {
            resolve(purchaserInfo.dictionary);
        }
    }];
}

RCT_EXPORT_METHOD(identify:(NSString * _Nullable)appUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases identify:appUserID completionBlock:^(RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else {
            resolve(purchaserInfo.dictionary);
        }
    }];
}

RCT_REMAP_METHOD(reset,
                 resetWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases resetWithCompletionBlock:^(RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else {
            resolve(purchaserInfo.dictionary);
        }
    }];
}

RCT_REMAP_METHOD(setDebugLogsEnabled,
                debugLogsEnabled:(BOOL)enabled) {
    RCPurchases.debugLogsEnabled = enabled;
}

RCT_REMAP_METHOD(getPurchaserInfo,
                   purchaserInfoWithResolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject) {
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases purchaserInfoWithCompletionBlock:^(RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else {
            resolve(purchaserInfo.dictionary);
        }
    }];
}

RCT_EXPORT_METHOD(setAutomaticAppleSearchAdsAttributionCollection:(BOOL)automaticAppleSearchAdsAttributionCollection)
{
    RCPurchases.automaticAppleSearchAdsAttributionCollection = automaticAppleSearchAdsAttributionCollection;
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

@end
  
