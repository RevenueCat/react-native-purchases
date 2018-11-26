
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
NSString *RNPurchasesRestoredTransactionsEvent = @"Purchases-RestoredTransactions";

@implementation RNPurchases

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[RNPurchasesPurchaseCompletedEvent,
             RNPurchasesPurchaserInfoUpdatedEvent,
             RNPurchasesRestoredTransactionsEvent];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setupPurchases:(NSString *)apiKey
                  appUserID:(NSString *)appUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{    
    Purchases.sharedInstance.delegate = nil;
    self.products = [NSMutableDictionary new];
    Purchases.sharedInstance = [[RCPurchases alloc] initWithAPIKey:apiKey appUserID:appUserID];
    Purchases.sharedInstance.delegate = self;
    resolve(nil);
}

RCT_EXPORT_METHOD(setIsUsingAnonymousID:(BOOL)isUsingAnonymousID)
{
    Purchases.sharedInstance.isUsingAnonymousID = isUsingAnonymousID;
}

RCT_REMAP_METHOD(addAttributionData, 
                 addAttributionData:(NSDictionary *)data 
                 forNetwork:(NSInteger)network)
{
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");
    [Purchases.sharedInstance addAttributionData:data fromNetwork:(RCAttributionNetwork)network];
}

RCT_REMAP_METHOD(getEntitlements,
                 getEntitlementsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");
    [Purchases.sharedInstance entitlements:^(NSDictionary<NSString *,RCEntitlement *> * _Nonnull entitlements) {
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
    }];
}

RCT_EXPORT_METHOD(getProductInfo:(NSArray *)products
                  type:(NSString *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");

    [Purchases.sharedInstance productsWithIdentifiers:products completion:^(NSArray<SKProduct *> * _Nonnull products) {
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
                 type:(NSString *)type)
{
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");

    if (self.products[productIdentifier] == nil) {
        NSLog(@"Purchases cannot find product. Did you call getProductInfo first?");
        return;
    }

    [Purchases.sharedInstance makePurchase:self.products[productIdentifier]];
}

RCT_EXPORT_METHOD(restoreTransactions) {
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");
    [Purchases.sharedInstance restoreTransactionsForAppStoreAccount];
}

RCT_REMAP_METHOD(getAppUserID,
                 getAppUserIDWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    resolve(Purchases.sharedInstance.appUserID);
}

RCT_EXPORT_METHOD(identify:(NSString * _Nullable)newAppUserID) {
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");
    [Purchases.sharedInstance createAlias:newAppUserID];
}

RCT_EXPORT_METHOD(identify:(NSString * _Nullable)appUserID) {
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");
    [Purchases.sharedInstance identify:appUserID];
}

RCT_EXPORT_METHOD(reset) {
    NSAssert(Purchases.sharedInstance, @"You must call setup first.");
    [Purchases.sharedInstance reset];
}

#pragma mark -
#pragma mark Delegate Methods

- (void)purchases:(nonnull RCPurchases *)purchases
completedTransaction:(nonnull SKPaymentTransaction *)transaction
  withUpdatedInfo:(nonnull RCPurchaserInfo *)purchaserInfo {
    [self sendEventWithName:RNPurchasesPurchaseCompletedEvent body:@{
                                                                     @"productIdentifier": transaction.payment.productIdentifier,
                                                                     @"purchaserInfo": purchaserInfo.dictionary
                                                                     }];
}

- (void)purchases:(nonnull RCPurchases *)purchases failedTransaction:(nonnull SKPaymentTransaction *)transaction withReason:(nonnull NSError *)failureReason {
    NSMutableDictionary *payload = [NSMutableDictionary dictionaryWithDictionary:[self payloadForError:failureReason]];
    payload[@"productIdentifier"] = transaction.payment.productIdentifier;
    [self sendEventWithName:RNPurchasesPurchaseCompletedEvent body:payload];
}

- (void)purchases:(nonnull RCPurchases *)purchases receivedUpdatedPurchaserInfo:(nonnull RCPurchaserInfo *)purchaserInfo {
    [self sendEventWithName:RNPurchasesPurchaserInfoUpdatedEvent body:@{
                                                                        @"purchaserInfo": purchaserInfo.dictionary,
                                                                        }];
}

- (void)purchases:(nonnull RCPurchases *)purchases failedToUpdatePurchaserInfoWithError:(nonnull NSError *)error {
    [self sendEventWithName:RNPurchasesPurchaseCompletedEvent body:[self payloadForError:error]];
}

- (void)purchases:(nonnull RCPurchases *)purchases failedToRestoreTransactionsWithError:(nonnull NSError *)error {
    [self sendEventWithName:RNPurchasesRestoredTransactionsEvent body:[self payloadForError:error]];
}


- (void)purchases:(nonnull RCPurchases *)purchases restoredTransactionsWithPurchaserInfo:(nonnull RCPurchaserInfo *)purchaserInfo {
    [self sendEventWithName:RNPurchasesRestoredTransactionsEvent body:@{
                                                                        @"purchaserInfo": purchaserInfo.dictionary
                                                                        }];
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
  
