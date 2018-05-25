
#import "RNPurchases.h"

@import StoreKit;
@import Purchases;

#import "RCPurchaserInfo+React.h"

@interface RNPurchases () <RCPurchasesDelegate>

@property (nonatomic, retain) RCPurchases *purchases;
@property (nonatomic, retain) NSMutableDictionary *products;

@end

NSString *RNPurchasesPurchaseCompletedEvent = @"Purchases-PurchaseCompleted";
NSString *RNPurchasesPurchaserInfoUpdatedEvent = @"Purchases-PurchaserInfoUpdated";

@implementation RNPurchases

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE();


RCT_EXPORT_METHOD(setupPurchases:(NSString *)apiKey appUserID:(NSString *)appUserID)
{
    self.purchases.delegate = nil;
    self.products = [NSMutableDictionary new];
    self.purchases = [[RCPurchases alloc] initWithAPIKey:apiKey appUserID:appUserID];
    self.purchases.delegate = self;
}

RCT_EXPORT_METHOD(getProductInfo:(NSArray *)products
                  type:(NSString *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(self.purchases, @"You must call setup first.");

    NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
    formatter.numberStyle = NSNumberFormatterCurrencyStyle;

    [self.purchases productsWithIdentifiers:products completion:^(NSArray<SKProduct *> * _Nonnull products) {
        NSMutableArray *productObjects = [NSMutableArray new];
        for (SKProduct *p in products) {
            self.products[p.productIdentifier] = p;
            formatter.locale = p.priceLocale;
            NSDictionary *d = @{
                                @"identifier": p.productIdentifier ?: @"",
                                @"description": p.localizedDescription ?: @"",
                                @"title": p.localizedTitle ?: @"",
                                @"price": @(p.price.floatValue),
                                @"price_string": [formatter stringFromNumber:p.price]
                                };
            [productObjects addObject:d];
        }
        resolve(productObjects);
    }];
}

RCT_EXPORT_METHOD(makePurchase:(NSString *)productIdentifier
                  type:(NSString *)type)
{
    NSAssert(self.purchases, @"You must call setup first.");

    if (self.products[productIdentifier] == nil) {
        NSLog(@"Purchases cannot find product. Did you call getProductInfo first?");
        return;
    }

    [self.purchases makePurchase:self.products[productIdentifier]];
}

RCT_EXPORT_METHOD(restoreTransactions) {
    NSAssert(self.purchases, @"You must call setup first.");
    [self.purchases restoreTransactionsForAppStoreAccount];
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[RNPurchasesPurchaseCompletedEvent,
             RNPurchasesPurchaserInfoUpdatedEvent];
}

RCT_EXPORT_METHOD(getUpdatedPurchaserInfo)
{
    [self.purchases updatePurchaserInfo];
}

RCT_REMAP_METHOD(getAppUserID,
                 getAppUserIDWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
    resolve(self.purchases.appUserID);
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
    [self sendEventWithName:RNPurchasesPurchaseCompletedEvent body:@{
                                                                     @"productIdentifier": transaction.payment.productIdentifier,
                                                                     @"error": @{
                                                                             @"message": failureReason.localizedDescription,
                                                                             @"code": @(failureReason.code),
                                                                             @"domain": failureReason.domain
                                                                             }
                                                                     }];
}

- (void)purchases:(nonnull RCPurchases *)purchases receivedUpdatedPurchaserInfo:(nonnull RCPurchaserInfo *)purchaserInfo {
    [self sendEventWithName:RNPurchasesPurchaserInfoUpdatedEvent body:@{
                                                                        @"purchaserInfo": purchaserInfo.dictionary,
                                                                        }];
}

- (void)purchases:(nonnull RCPurchases *)purchases failedToUpdatePurchaserInfoWithError:(nonnull NSError *)error {
    [self sendEventWithName:RNPurchasesPurchaseCompletedEvent body:@{
                                                                     @"error": @{
                                                                             @"message": error.localizedDescription,
                                                                             @"code": @(error.code),
                                                                             @"domain": error.domain
                                                                             }
                                                                     }];
}



@end
  
