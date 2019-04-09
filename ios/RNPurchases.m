
#import "RNPurchases.h"

@import StoreKit;

#import "RCPurchaserInfo+RNPurchases.h"
#import "RCEntitlement+RNPurchases.h"
#import "SKProduct+RNPurchases.h"

@interface RNPurchases () <RCPurchasesDelegate>

@property (nonatomic, retain) NSMutableDictionary *products;

@end

NSString *RNPurchasesPurchaseCompletedEvent = @"Purchases-PurchaseCompleted";
NSString *RNPurchasesPurchaserInfoUpdatedEvent = @"Purchases-PurchaserInfoUpdated";

@implementation RNPurchases

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[RNPurchasesPurchaseCompletedEvent,
             RNPurchasesPurchaserInfoUpdatedEvent];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setupPurchases:(NSString *)apiKey
                  appUserID:(NSString *)appUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{    
    RCPurchases.sharedPurchases.delegate = nil;
    self.products = [NSMutableDictionary new];
    [RCPurchases configureWithAPIKey:apiKey appUserID:appUserID];
    RCPurchases.sharedPurchases.delegate = self;
    resolve(nil);
}

RCT_EXPORT_METHOD(setAllowSharingStoreAccount:(BOOL)allowSharingStoreAccount)
{
    RCPurchases.sharedPurchases.allowSharingAppStoreAccount = allowSharingStoreAccount;
}

RCT_EXPORT_METHOD(setFinishTransactions:(BOOL)finishTransactions)
{
    RCPurchases.sharedPurchases.finishTransactions = finishTransactions;
}

RCT_REMAP_METHOD(addAttributionData, 
                 addAttributionData:(NSDictionary *)data 
                 forNetwork:(NSInteger)network)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases addAttributionData:data fromNetwork:(RCAttributionNetwork)network];
}

RCT_REMAP_METHOD(getEntitlements,
                 getEntitlementsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases entitlementsWithCompletionBlock:^(RCEntitlements * _Nullable entitlements, NSError * _Nullable error) {
        if (error) {
            reject(@"ERROR_GETTING_ENTITLEMENTS", @"There was an error getting entitlements", error);
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
                 oldSkus:(NSArray *)oldSkus
                 type:(NSString *)type
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");

    if (self.products[productIdentifier] == nil) {
        NSLog(@"Purchases cannot find product. Did you call getProductInfo first?");
        return;
    }
    [RCPurchases.sharedPurchases makePurchase:self.products[productIdentifier]
                          withCompletionBlock:^(SKPaymentTransaction * _Nullable transaction, RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error) {
                              if (error) {
                                  [self sendEventWithName:RNPurchasesPurchaseCompletedEvent body:[self payloadForError:error]];
                              } else {
                                  [self sendEventWithName:RNPurchasesPurchaseCompletedEvent body:@{ @"productIdentifier":transaction.payment.productIdentifier,@"purchaserInfo": purchaserInfo.dictionary
                                                                                                    }];
                              }
                          }];
}

RCT_REMAP_METHOD(restoreTransactions,
                 restoreTransactionsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSAssert(RCPurchases.sharedPurchases, @"You must call setup first.");
    [RCPurchases.sharedPurchases restoreTransactionsWithCompletionBlock:^(RCPurchaserInfo * _Nullable purchaserInfo, NSError * _Nullable error) {
        if (error) {
            reject(@"ERROR_RESTORING_TRANSACTIONS", @"There was an error restoring transactions", error);
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
            reject(@"ERROR_ALIASING", @"There was an error aliasing", error);
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
            reject(@"ERROR_IDENTIFYING", @"There was an error identifying", error);
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
            reject(@"ERROR_RESETTING", @"There was an error resetting", error);
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
            reject(@"ERROR_GETTING_PURCHASER_INFO", @"There was an error getting purchaser info", error);
        } else {
            resolve(purchaserInfo.dictionary);
        }
    }];
}

#pragma mark -
#pragma mark Delegate Methods
- (void)purchases:(RCPurchases *)purchases didReceiveUpdatedPurchaserInfo:(RCPurchaserInfo *)purchaserInfo {
    [self sendEventWithName:RNPurchasesPurchaserInfoUpdatedEvent body:purchaserInfo.dictionary];
}

#pragma mark Response Payload Helpers

- (NSDictionary *)payloadForError:(NSError *)error
{
    return @{
             @"error": @{
                     @"message": error.localizedDescription,
                     @"code": @(error.code),
                     @"domain": error.domain
                     }
             };
}

@end
  
