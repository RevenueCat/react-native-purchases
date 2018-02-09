
#import "RNPurchases.h"
#import <StoreKit/StoreKit.h>

@interface RNPurchases () <RCPurchasesDelegate>

@property (nonatomic, retain) RCPurchases *purchases;
@property (nonatomic, retain) NSMutableDictionary *products;

@end

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
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSAssert(self.purchases, @"You must setup purchases first.");
    NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
    formatter.numberStyle = NSNumberFormatterCurrencyStyle;
    [self.purchases productsWithIdentifiers:[NSSet setWithArray:products] completion:^(NSArray<SKProduct *> * _Nonnull products) {
        NSMutableArray *productObjects = [NSMutableArray new];
        for (SKProduct *p in products) {
            self.products[p.productIdentifier] = p;
            formatter.locale = p.priceLocale;
            NSDictionary *d = @{
                                @"identifier": p.productIdentifier,
                                @"description": p.localizedDescription,
                                @"title": p.localizedTitle,
                                @"price": @(p.price.floatValue),
                                @"price_string": [formatter stringFromNumber:p.price]
                                };
            [productObjects addObject:d];
        }
        resolve(productObjects);
    }];
}

RCT_EXPORT_METHOD(makePurchase:(NSString *)productIdentifier)
{
    NSAssert(self.purchases, @"You must setup purchases first.");
    if (self.products[productIdentifier] == nil) {
        NSLog(@"Purchases cannot find product. Did you call getProductInfo first?");
        return;
    }

    [self.purchases makePurchase:self.products[productIdentifier]];
}

#pragma mark -
#pragma mark Delegate Methods

- (void)purchases:(nonnull RCPurchases *)purchases completedTransaction:(nonnull SKPaymentTransaction *)transaction withUpdatedInfo:(nonnull RCPurchaserInfo *)purchaserInfo {

}

- (void)purchases:(nonnull RCPurchases *)purchases failedTransaction:(nonnull SKPaymentTransaction *)transaction withReason:(nonnull NSError *)failureReason {

}

- (void)purchases:(nonnull RCPurchases *)purchases receivedUpdatedPurchaserInfo:(nonnull RCPurchaserInfo *)purchaserInfo {

}

- (void)purchases:(RCPurchases *)purchases restoredTransactionsWithPurchaserInfo:(RCPurchaserInfo *)purchaserInfo {

}

- (void)purchases:(RCPurchases *)purchases failedToRestoreTransactionsWithReason:(NSError *)failureReason {

}

@end
  
