
//
//  Created by RevenueCat.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import "RNPaywalls.h"

@import PurchasesHybridCommonUI;
@import RevenueCat;

@interface RNPaywalls ()

@property (nonatomic, strong) id paywallProxy;
@property (nonatomic, assign) BOOL presentationHasCallbacks;

@end

@implementation RNPaywalls

RCT_EXPORT_MODULE();

// Required for RN 0.79+ NativeEventEmitter (JavaScript class) support.
// RCT_EXPORT_METHOD must re-export these explicitly; parent class methods are not visible to JS.
// See: https://github.com/RevenueCat/react-native-purchases/issues/1298
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
    [super addListener:eventName];
}

RCT_EXPORT_METHOD(removeListeners:(double)count) {
    [super removeListeners:count];
}

- (instancetype)initWithDisabledObservation
{
    if ((self = [super initWithDisabledObservation])) {
        [self initializePaywalls];
    }

    return self;
}

- (instancetype)init
{
    if (([super init])) {
        [self initializePaywalls];
    }
    return self;
}

// `RCTEventEmitter` does not implement designated iniitializers correctly so we have to duplicate the call in both constructors.
- (void)initializePaywalls {
    if (@available(iOS 15.0, *)) {
        self.paywallProxy = [PaywallProxy new];
        [(PaywallProxy *)self.paywallProxy setDelegate:self];
    } else {
        self.paywallProxy = nil;
    }
}

// MARK: -

// RCTEventEmitter sends events through the global RCTDeviceEventEmitter, keyed by name alone, so
// these names must not collide with the ones RNCustomerCenter emits.
static NSString *RNPaywallsPresentedEventName(NSString *callbackName) {
    return [@"Paywalls-" stringByAppendingString:callbackName];
}

- (NSArray<NSString *> *)supportedEvents {
    NSArray<NSString *> *callbackNames = @[
        @"onPurchaseStarted",
        @"onPurchaseCompleted",
        @"onPurchaseError",
        @"onPurchaseCancelled",
        @"onRestoreStarted",
        @"onRestoreCompleted",
        @"onRestoreError",
        @"onPurchasePackageInitiated",
        @"onWebCheckoutOpened",
        @"onUrlOpened",
        @"onInteraction",
    ];
    NSMutableArray<NSString *> *events = [NSMutableArray arrayWithObject:safeAreaInsetsDidChangeEvent];
    for (NSString *callbackName in callbackNames) {
        [events addObject:RNPaywallsPresentedEventName(callbackName)];
    }
    return [events copy];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (PaywallProxy *)paywalls API_AVAILABLE(ios(15.0)){
    return self.paywallProxy;
}

// MARK: -

RCT_EXPORT_METHOD(presentPaywall:(nullable NSString *)offeringIdentifier
                  presentedOfferingContext:(nullable NSDictionary *)presentedOfferingContext
                  shouldDisplayCloseButton:(BOOL)displayCloseButton
                  withFontFamily:(nullable NSString *)fontFamily
                  customVariables:(nullable NSDictionary *)customVariables
                  hasCallbacks:(BOOL)hasCallbacks
                  withResolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
        self.presentationHasCallbacks = hasCallbacks;
        NSMutableDictionary *options = [NSMutableDictionary dictionary];
        if (offeringIdentifier != nil) {
            options[PaywallOptionsKeys.offeringIdentifier] = offeringIdentifier;
        }
        if (presentedOfferingContext != nil) {
            options[PaywallOptionsKeys.presentedOfferingContext] = presentedOfferingContext;
        }
        options[PaywallOptionsKeys.displayCloseButton] = @(displayCloseButton);
        if (fontFamily) {
            options[PaywallOptionsKeys.fontName] = fontFamily;
        }
        if (customVariables) {
            options[PaywallOptionsKeys.customVariables] = customVariables;
        }

        [self.paywalls presentPaywallWithOptions:options
                            paywallResultHandler:^(NSString *result) {
            self.presentationHasCallbacks = NO;
            resolve(result);
        }];
    } else {
        [self rejectPaywallsUnsupportedError:reject];
    }
}

RCT_EXPORT_METHOD(presentPaywallIfNeeded:(NSString *)requiredEntitlementIdentifier
                  withOfferingIdentifier:(nullable NSString *)offeringIdentifier
                  presentedOfferingContext:(nullable NSDictionary *)presentedOfferingContext
                  shouldDisplayCloseButton:(BOOL)displayCloseButton
                  withFontFamily:(nullable NSString *)fontFamily
                  customVariables:(nullable NSDictionary *)customVariables
                  hasCallbacks:(BOOL)hasCallbacks
                  withResolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
        self.presentationHasCallbacks = hasCallbacks;
        NSMutableDictionary *options = [NSMutableDictionary dictionary];
        if (offeringIdentifier != nil) {
            options[PaywallOptionsKeys.offeringIdentifier] = offeringIdentifier;
        }
        if (presentedOfferingContext != nil) {
            options[PaywallOptionsKeys.presentedOfferingContext] = presentedOfferingContext;
        }
        options[PaywallOptionsKeys.requiredEntitlementIdentifier] = requiredEntitlementIdentifier;
        options[PaywallOptionsKeys.displayCloseButton] = @(displayCloseButton);
        if (fontFamily) {
            options[PaywallOptionsKeys.fontName] = fontFamily;
        }
        if (customVariables) {
            options[PaywallOptionsKeys.customVariables] = customVariables;
        }

        [self.paywalls presentPaywallIfNeededWithOptions:options
                                    paywallResultHandler:^(NSString *result) {
            self.presentationHasCallbacks = NO;
            resolve(result);
        }];
    } else {
        [self rejectPaywallsUnsupportedError:reject];
    }
}

RCT_EXPORT_METHOD(resumePurchasePackageInitiated:(NSString *)requestId
                  shouldProceed:(BOOL)shouldProceed) {
    if (@available(iOS 15.0, *)) {
        [PaywallProxy resumePurchasePackageInitiatedWithRequestId:requestId shouldProceed:shouldProceed];
    }
}

RCT_EXPORT_METHOD(resolvePurchaseLogicResult:(NSString *)requestId
                  result:(NSString *)result
                  errorMessage:(nullable NSString *)errorMessage) {
    if (@available(iOS 15.0, *)) {
        [HybridPurchaseLogicBridge resolveResultWithRequestId:requestId resultString:result errorMessage:errorMessage];
    }
}

// MARK: - RCPaywallViewControllerDelegateWrapper

// RCTEventEmitter warns when an event is sent with no listeners registered on the JS side.
- (void)sendPaywallEvent:(NSString *)callbackName body:(nullable NSDictionary *)body {
    if (self.presentationHasCallbacks) {
        [self sendEventWithName:RNPaywallsPresentedEventName(callbackName) body:body];
    }
}

- (void)paywallViewController:(RCPaywallViewController *)controller
  didStartPurchaseWithPackage:(NSDictionary *)packageDictionary API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onPurchaseStarted" body:@{@"packageBeingPurchased": packageDictionary}];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishPurchasingWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary
        transactionDictionary:(NSDictionary *)transactionDictionary API_AVAILABLE(ios(15.0)) {
    NSMutableDictionary *body = [NSMutableDictionary dictionaryWithObject:customerInfoDictionary forKey:@"customerInfo"];
    if (transactionDictionary) {
        body[@"storeTransaction"] = transactionDictionary;
    }
    [self sendPaywallEvent:@"onPurchaseCompleted" body:[body copy]];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFailPurchasingWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onPurchaseError" body:@{@"error": errorDictionary}];
}

- (void)paywallViewControllerDidCancelPurchase:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onPurchaseCancelled" body:nil];
}

- (void)paywallViewControllerDidStartRestore:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onRestoreStarted" body:nil];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishRestoringWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onRestoreCompleted" body:@{@"customerInfo": customerInfoDictionary}];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFailRestoringWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onRestoreError" body:@{@"error": errorDictionary}];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didInitiatePurchaseWithPackageDictionary:(NSDictionary *)packageDictionary
                     requestId:(NSString *)requestId API_AVAILABLE(ios(15.0)) {
    if (self.presentationHasCallbacks) {
        [self sendEventWithName:RNPaywallsPresentedEventName(@"onPurchasePackageInitiated")
                           body:@{@"packageBeingPurchased": packageDictionary, @"requestId": requestId}];
    } else {
        [PaywallProxy resumePurchasePackageInitiatedWithRequestId:requestId shouldProceed:YES];
    }
}

- (void)paywallViewControllerDidOpenWebCheckout:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onWebCheckoutOpened" body:nil];
}

- (void)paywallViewController:(RCPaywallViewController *)controller didOpenURL:(NSString *)url API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onUrlOpened" body:@{@"url": url ?: @""}];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
          didTrackInteraction:(NSDictionary<NSString *, id> *)eventDictionary API_AVAILABLE(ios(15.0)) {
    [self sendPaywallEvent:@"onInteraction" body:eventDictionary];
}

- (void)rejectPaywallsUnsupportedError:(RCTPromiseRejectBlock)reject {
    NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
    reject(@"PaywallsUnsupportedCode", @"Paywalls are not supported prior to iOS 15.", nil);
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
