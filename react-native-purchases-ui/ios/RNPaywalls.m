
//
//  Created by RevenueCat.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import "RNPaywalls.h"
#import "RNPaywallEventForwarder.h"

@import PurchasesHybridCommonUI;
@import RevenueCat;

@interface RNPaywalls ()

@property (nonatomic, strong) id paywallProxy;

- (void)emitPaywallEvent:(NSString *)callbackName
          presentationId:(NSString *)presentationId
                    body:(nullable NSDictionary *)body;

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
                  presentationId:(nullable NSString *)presentationId
                  jsResumesPurchase:(BOOL)jsResumesPurchase
                  withResolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
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
                             purchaseLogicBridge:nil
                                        delegate:[self presentationDelegateWithId:presentationId
                                                   jsResumesPurchase:jsResumesPurchase]
                            paywallResultHandler:^(NSString *result) {
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
                  presentationId:(nullable NSString *)presentationId
                  jsResumesPurchase:(BOOL)jsResumesPurchase
                  withResolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
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
                                     purchaseLogicBridge:nil
                                                delegate:[self presentationDelegateWithId:presentationId
                                                   jsResumesPurchase:jsResumesPurchase]
                                    paywallResultHandler:^(NSString *result) {
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

// MARK: -

// PHC retains the delegate until the paywall is dismissed, so it must only hold the module weakly.
- (nullable id)presentationDelegateWithId:(nullable NSString *)presentationId
                jsResumesPurchase:(BOOL)jsResumesPurchase API_AVAILABLE(ios(15.0)) {
    if (presentationId == nil) {
        return nil;
    }
    NSString *routedPresentationId = [presentationId copy];
    __weak typeof(self) weakSelf = self;
    return [[RNPaywallEventForwarder alloc] initWithEmitter:^(NSString *eventName, NSDictionary *body) {
        [weakSelf emitPaywallEvent:eventName presentationId:routedPresentationId body:body];
    } jsResumesPurchase:^BOOL {
        return jsResumesPurchase && weakSelf != nil;
    }];
}

- (void)emitPaywallEvent:(NSString *)callbackName
          presentationId:(NSString *)presentationId
                    body:(nullable NSDictionary *)body {
    NSMutableDictionary *payload = body ? [body mutableCopy] : [NSMutableDictionary dictionary];
    payload[@"presentationId"] = presentationId;
    [self sendEventWithName:RNPaywallsPresentedEventName(callbackName) body:[payload copy]];
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
