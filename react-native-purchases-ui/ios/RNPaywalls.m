
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
    return @[safeAreaInsetsDidChangeEvent];
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

- (void)rejectPaywallsUnsupportedError:(RCTPromiseRejectBlock)reject {
    NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
    reject(@"PaywallsUnsupportedCode", @"Paywalls are not supported prior to iOS 15.", nil);
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
