
//
//  Created by RevenueCat.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import "RNPaywalls.h"

@import PurchasesHybridCommonUI;
@import RevenueCat;

// MARK: - PaywallDelegateAdapter

API_AVAILABLE(ios(15.0))
@interface RNPaywallDelegateAdapter : NSObject <RCPaywallViewControllerDelegateWrapper>
@property (nonatomic, weak) RNPaywalls *module;
@end

@implementation RNPaywallDelegateAdapter

- (void)paywallViewController:(RCPaywallViewController *)controller
     didStartPurchaseWithPackage:(NSDictionary *)packageDictionary {
    [self.module sendEventWithName:onPurchaseStartedEvent
                              body:@{@"packageBeingPurchased": packageDictionary}];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishPurchasingWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary
          transactionDictionary:(NSDictionary *)transactionDictionary {
    NSMutableDictionary *data = [NSMutableDictionary dictionaryWithDictionary:@{@"customerInfo": customerInfoDictionary}];
    if (transactionDictionary) {
        data[@"storeTransaction"] = transactionDictionary;
    }
    [self.module sendEventWithName:onPurchaseCompletedEvent body:data];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
 didFailPurchasingWithErrorDictionary:(NSDictionary *)errorDictionary {
    [self.module sendEventWithName:onPurchaseErrorEvent body:@{@"error": errorDictionary}];
}

- (void)paywallViewControllerDidCancelPurchase:(RCPaywallViewController *)controller {
    [self.module sendEventWithName:onPurchaseCancelledEvent body:@{}];
}

- (void)paywallViewControllerDidStartRestore:(RCPaywallViewController *)controller {
    [self.module sendEventWithName:onRestoreStartedEvent body:@{}];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishRestoringWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary {
    [self.module sendEventWithName:onRestoreCompletedEvent body:@{@"customerInfo": customerInfoDictionary}];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
 didFailRestoringWithErrorDictionary:(NSDictionary *)errorDictionary {
    [self.module sendEventWithName:onRestoreErrorEvent body:@{@"error": errorDictionary}];
}

- (void)paywallViewControllerRequestedDismissal:(RCPaywallViewController *)controller {
    // No-op for modal presentation; dismissal is handled by the result handler
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didInitiatePurchaseWithPackageDictionary:(NSDictionary *)packageDictionary
                     requestId:(NSString *)requestId {
    [self.module sendEventWithName:onPurchaseInitiatedEvent
                              body:@{
                                  @"package": packageDictionary,
                                  @"requestId": requestId
                              }];
}

- (void)paywallViewControllerDidRequestPerformPurchase:(RCPaywallViewController *)controller
                                     packageDictionary:(NSDictionary *)packageDictionary
                                             requestId:(NSString *)requestId {
    [self.module sendEventWithName:onPerformPurchaseRequestEvent
                              body:@{
                                  @"requestId": requestId,
                                  @"packageBeingPurchased": packageDictionary
                              }];
}

- (void)paywallViewControllerDidRequestPerformRestore:(RCPaywallViewController *)controller
                                            requestId:(NSString *)requestId {
    [self.module sendEventWithName:onPerformRestoreRequestEvent
                              body:@{
                                  @"requestId": requestId
                              }];
}

@end

// MARK: - RNPaywalls

@interface RNPaywalls ()

@property (nonatomic, strong) id paywallProxy;
@property (nonatomic, strong) id delegateAdapter;

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
        PaywallProxy *proxy = [PaywallProxy new];
        RNPaywallDelegateAdapter *adapter = [RNPaywallDelegateAdapter new];
        adapter.module = self;
        proxy.delegate = adapter;
        self.paywallProxy = proxy;
        self.delegateAdapter = adapter; // Retain strongly since PaywallProxy.delegate is weak
    } else {
        self.paywallProxy = nil;
        self.delegateAdapter = nil;
    }
}

// MARK: -

- (NSArray<NSString *> *)supportedEvents {
    return @[
        safeAreaInsetsDidChangeEvent,
        onPurchaseStartedEvent,
        onPurchaseCompletedEvent,
        onPurchaseErrorEvent,
        onPurchaseCancelledEvent,
        onRestoreStartedEvent,
        onRestoreCompletedEvent,
        onRestoreErrorEvent,
        onPurchaseInitiatedEvent,
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
                  hasPaywallListener:(BOOL)hasPaywallListener
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
                  hasPaywallListener:(BOOL)hasPaywallListener
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

RCT_EXPORT_METHOD(resumePurchaseLogicPurchase:(NSString *)requestId
                  result:(NSString *)resultString
                  error:(nullable NSDictionary *)error) {
    if (@available(iOS 15.0, *)) {
        NSString *errorMessage = error[@"message"];
        [HybridPurchaseLogicBridge resolveResultWithRequestId:requestId
                                                 resultString:resultString
                                                 errorMessage:errorMessage];
    }
}

RCT_EXPORT_METHOD(resumePurchaseLogicRestore:(NSString *)requestId
                  result:(NSString *)resultString
                  error:(nullable NSDictionary *)error) {
    if (@available(iOS 15.0, *)) {
        NSString *errorMessage = error[@"message"];
        [HybridPurchaseLogicBridge resolveResultWithRequestId:requestId
                                                 resultString:resultString
                                                 errorMessage:errorMessage];
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
