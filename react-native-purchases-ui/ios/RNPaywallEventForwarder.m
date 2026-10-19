//
//  RNPaywallEventForwarder.m
//  RNPaywalls
//
//  Copyright © 2026 RevenueCat. All rights reserved.
//

#import "RNPaywallEventForwarder.h"

@import RevenueCatUI;

static NSString *const KeyCustomerInfo = @"customerInfo";
static NSString *const KeyStoreTransaction = @"storeTransaction";
static NSString *const KeyError = @"error";
static NSString *const KeyPackage = @"packageBeingPurchased";
static NSString *const KeyUrl = @"url";
static NSString *const KeyRequestId = @"requestId";

@implementation RNPaywallEventForwarder {
    RNPaywallEventEmitter _emitter;
    BOOL (^_jsResumesPurchase)(void);
}

- (instancetype)initWithEmitter:(RNPaywallEventEmitter)emitter
      jsResumesPurchase:(BOOL (^)(void))jsResumesPurchase {
    if ((self = [super init])) {
        _emitter = [emitter copy];
        _jsResumesPurchase = [jsResumesPurchase copy];
    }
    return self;
}

- (void)paywallViewController:(RCPaywallViewController *)controller
  didStartPurchaseWithPackage:(NSDictionary *)packageDictionary API_AVAILABLE(ios(15.0)) {
    _emitter(@"onPurchaseStarted", @{KeyPackage: packageDictionary});
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishPurchasingWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary
        transactionDictionary:(NSDictionary *)transactionDictionary API_AVAILABLE(ios(15.0)) {
    NSMutableDictionary *body = [NSMutableDictionary dictionaryWithObject:customerInfoDictionary
                                                                  forKey:KeyCustomerInfo];
    if (transactionDictionary) {
        body[KeyStoreTransaction] = transactionDictionary;
    }
    _emitter(@"onPurchaseCompleted", [body copy]);
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFailPurchasingWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    _emitter(@"onPurchaseError", @{KeyError: errorDictionary});
}

- (void)paywallViewControllerDidCancelPurchase:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    _emitter(@"onPurchaseCancelled", nil);
}

- (void)paywallViewControllerDidStartRestore:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    _emitter(@"onRestoreStarted", nil);
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishRestoringWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary API_AVAILABLE(ios(15.0)) {
    _emitter(@"onRestoreCompleted", @{KeyCustomerInfo: customerInfoDictionary});
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFailRestoringWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    _emitter(@"onRestoreError", @{KeyError: errorDictionary});
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didInitiatePurchaseWithPackageDictionary:(NSDictionary *)packageDictionary
                     requestId:(NSString *)requestId API_AVAILABLE(ios(15.0)) {
    if (_jsResumesPurchase()) {
        _emitter(@"onPurchasePackageInitiated", @{KeyPackage: packageDictionary, KeyRequestId: requestId});
    } else {
        [PaywallProxy resumePurchasePackageInitiatedWithRequestId:requestId shouldProceed:YES];
    }
}

- (void)paywallViewControllerDidOpenWebCheckout:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    _emitter(@"onWebCheckoutOpened", nil);
}

- (void)paywallViewController:(RCPaywallViewController *)controller didOpenURL:(NSString *)url API_AVAILABLE(ios(15.0)) {
    _emitter(@"onUrlOpened", @{KeyUrl: url ?: @""});
}

- (void)paywallViewController:(RCPaywallViewController *)controller
          didTrackInteraction:(NSDictionary<NSString *, id> *)eventDictionary API_AVAILABLE(ios(15.0)) {
    _emitter(@"onInteraction", eventDictionary);
}

@end
