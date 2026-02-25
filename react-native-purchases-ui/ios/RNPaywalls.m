
//
//  Created by RevenueCat.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import "RNPaywalls.h"

@import PurchasesHybridCommonUI;
@import RevenueCat;

@interface RNPaywalls ()

@property (nonatomic, strong) id paywallProxy;

@end

@implementation RNPaywalls

RCT_EXPORT_MODULE();

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

- (NSArray<NSString *> *)supportedEvents {
    return @[
        safeAreaInsetsDidChangeEvent,
        onPerformPurchaseRequestEvent,
        onPerformRestoreRequestEvent,
    ];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (PaywallProxy *)paywalls API_AVAILABLE(ios(15.0)){
    return self.paywallProxy;
}

// MARK: - presentPaywall / presentPaywallIfNeeded

RCT_EXPORT_METHOD(presentPaywall:(nullable NSString *)offeringIdentifier
                  presentedOfferingContext:(nullable NSDictionary *)presentedOfferingContext
                  shouldDisplayCloseButton:(BOOL)displayCloseButton
                  withFontFamily:(nullable NSString *)fontFamily
                  customVariables:(nullable NSDictionary *)customVariables
                  hasPurchaseLogic:(BOOL)hasPurchaseLogic
                  withResolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
        NSMutableDictionary *options = [self buildOptionsWithOfferingIdentifier:offeringIdentifier
                                                     presentedOfferingContext:presentedOfferingContext
                                                          displayCloseButton:displayCloseButton
                                                                  fontFamily:fontFamily
                                                             customVariables:customVariables];

        HybridPurchaseLogicBridge *bridge = hasPurchaseLogic ? [self createPurchaseLogicBridge] : nil;

        [self.paywalls presentPaywallWithOptions:options
                            purchaseLogicBridge:bridge
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
                  hasPurchaseLogic:(BOOL)hasPurchaseLogic
                  withResolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
        NSMutableDictionary *options = [self buildOptionsWithOfferingIdentifier:offeringIdentifier
                                                     presentedOfferingContext:presentedOfferingContext
                                                          displayCloseButton:displayCloseButton
                                                                  fontFamily:fontFamily
                                                             customVariables:customVariables];
        options[PaywallOptionsKeys.requiredEntitlementIdentifier] = requiredEntitlementIdentifier;

        HybridPurchaseLogicBridge *bridge = hasPurchaseLogic ? [self createPurchaseLogicBridge] : nil;

        [self.paywalls presentPaywallIfNeededWithOptions:options
                                    purchaseLogicBridge:bridge
                                    paywallResultHandler:^(NSString *result) {
            resolve(result);
        }];
    } else {
        [self rejectPaywallsUnsupportedError:reject];
    }
}

// MARK: - Resume methods

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

// MARK: - Helpers

- (NSMutableDictionary *)buildOptionsWithOfferingIdentifier:(nullable NSString *)offeringIdentifier
                                   presentedOfferingContext:(nullable NSDictionary *)presentedOfferingContext
                                        displayCloseButton:(BOOL)displayCloseButton
                                                fontFamily:(nullable NSString *)fontFamily
                                           customVariables:(nullable NSDictionary *)customVariables
API_AVAILABLE(ios(15.0)) {
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
    return options;
}

- (HybridPurchaseLogicBridge *)createPurchaseLogicBridge API_AVAILABLE(ios(15.0)) {
    __weak typeof(self) weakSelf = self;
    return [[HybridPurchaseLogicBridge alloc]
        initOnPerformPurchase:^(NSDictionary<NSString *, id> * _Nonnull eventData) {
            [weakSelf sendEventWithName:onPerformPurchaseRequestEvent body:eventData];
        }
        onPerformRestore:^(NSDictionary<NSString *, id> * _Nonnull eventData) {
            [weakSelf sendEventWithName:onPerformRestoreRequestEvent body:eventData];
        }];
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
