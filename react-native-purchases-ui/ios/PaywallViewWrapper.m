//
//  PaywallViewWrapper.m
//  RNPaywalls
//
//  Created by Nacho Soto on 1/23/24.
//

#import "PaywallViewWrapper.h"
#import "UIView+Extensions.h"
#import "UIView+React.h"

@import PurchasesHybridCommonUI;
@import RevenueCat;
@import RevenueCatUI;

static NSString *const KeyCustomerInfo = @"customerInfo";
static NSString *const KeyStoreTransaction = @"storeTransaction";
static NSString *const KeyError = @"error";
static NSString *const KeyPackage = @"packageBeingPurchased";

API_AVAILABLE(ios(15.0))
@interface PaywallViewWrapper ()

@property(strong, nonatomic) RCPaywallViewController *paywallViewController;
@property(nonatomic) BOOL addedToHierarchy;
@property(nonatomic) BOOL didReceiveInitialOptions;
@property(strong, nonatomic) NSDictionary *pendingOptions;

@end

@implementation PaywallViewWrapper

- (instancetype)initWithPaywallViewController:(RCPaywallViewController *)paywallViewController API_AVAILABLE(ios(15.0)) {
    NSParameterAssert(paywallViewController);

    // Don't access paywallViewController.view here - it triggers viewDidLoad which sets up
    // the hostingController, making it impossible to set custom variables afterwards.
    // See: https://github.com/RevenueCat/react-native-purchases/issues/1622
    if ((self = [super initWithFrame:CGRectZero])) {
        _paywallViewController = paywallViewController;
    }

    return self;
}


- (void)reactSetFrame:(CGRect)frame
{
    [super reactSetFrame: frame];
}

- (void)layoutSubviews {
    [super layoutSubviews];

    // Need to wait for this view to be in the hierarchy to look for the parent UIVC.
    // This is required to add a SwiftUI `UIHostingController` to the hierarchy in a way that allows
    // UIKit to read properties from the environment, like traits and safe area.
    //
    // IMPORTANT: We also need to wait for setOptions: to be called (via didReceiveInitialOptions).
    // Custom variables MUST be applied before accessing the PaywallViewController's view,
    // because viewDidLoad sets up the hostingController which makes custom variables immutable.
    // Note: options can be nil/empty (default usage), so we track the flag separately.
    // See: https://github.com/RevenueCat/react-native-purchases/issues/1622
    if (!self.addedToHierarchy && self.didReceiveInitialOptions) {
        UIViewController *parentController = self.parentViewController;
        if (parentController) {
            // Apply custom variables BEFORE accessing .view (which triggers viewDidLoad).
            [self applyCustomVariablesFromPendingOptions];

            self.paywallViewController.view.translatesAutoresizingMaskIntoConstraints = NO;
            [parentController addChildViewController:self.paywallViewController];
            [self addSubview:self.paywallViewController.view];
            [self.paywallViewController didMoveToParentViewController:parentController];

            [NSLayoutConstraint activateConstraints:@[
                [self.paywallViewController.view.topAnchor constraintEqualToAnchor:self.topAnchor],
                [self.paywallViewController.view.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
                [self.paywallViewController.view.leftAnchor constraintEqualToAnchor:self.leftAnchor],
                [self.paywallViewController.view.rightAnchor constraintEqualToAnchor:self.rightAnchor]
            ]];

            self.addedToHierarchy = YES;

            // Apply remaining options after adding to hierarchy
            [self applyNonCustomVariableOptionsFromPendingOptions];
        }
    }
}

- (void)setOptions:(NSDictionary *)options {
    if (@available(iOS 15.0, *)) {
        self.pendingOptions = options ?: @{};
        self.didReceiveInitialOptions = YES;

        if (self.addedToHierarchy) {
            // View is already in hierarchy, apply non-custom-variable options only.
            // Custom variables cannot be set after the PaywallViewController has loaded
            // (the SDK will assert if we try). They must be set before viewDidLoad.
            // See: https://github.com/RevenueCat/react-native-purchases/issues/1622
            [self applyNonCustomVariableOptionsFromPendingOptions];
        } else {
            // View is not yet in hierarchy, trigger layout to apply options.
            // Custom variables will be applied before adding to hierarchy in layoutSubviews.
            [self setNeedsLayout];
        }
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
    }
}

- (void)applyCustomVariablesFromPendingOptions {
    if (@available(iOS 15.0, *)) {
        NSDictionary *customVariables = self.pendingOptions[@"customVariables"];
        if (customVariables && [customVariables isKindOfClass:[NSDictionary class]]) {
            for (NSString *key in customVariables) {
                NSString *value = customVariables[key];
                if ([value isKindOfClass:[NSString class]]) {
                    [self.paywallViewController setCustomVariable:value forKey:key];
                }
            }
        }
    }
}

- (void)applyNonCustomVariableOptionsFromPendingOptions {
    if (@available(iOS 15.0, *)) {
        NSDictionary *offering = self.pendingOptions[@"offering"];
        if (offering && ![offering isKindOfClass:[NSNull class]]) {
            NSString *identifier = offering[@"identifier"];
            if (identifier) {
                RCPresentedOfferingContext *presentedOfferingContext = [self presentedOfferingContextFromOffering:offering];
                [self.paywallViewController updateWithOfferingIdentifier:identifier
                                                presentedOfferingContext:presentedOfferingContext];
            }
        }

        NSString *fontFamily = self.pendingOptions[@"fontFamily"];
        if (fontFamily && [fontFamily isKindOfClass:[NSString class]] && fontFamily.length > 0) {
            [self.paywallViewController updateFontWithFontName:fontFamily];
        }

        NSNumber *displayCloseButtonValue = self.pendingOptions[@"displayCloseButton"];
        BOOL displayCloseButton = [displayCloseButtonValue isKindOfClass:[NSNumber class]] ? [displayCloseButtonValue boolValue] : NO;
        if (displayCloseButton) {
            [self.paywallViewController updateWithDisplayCloseButton:displayCloseButton];
        }
    }
}

- (RCPresentedOfferingContext *)presentedOfferingContextFromOffering:(NSDictionary *)offering {
    NSArray *availablePackages = offering[@"availablePackages"];
    if (!availablePackages || ![availablePackages isKindOfClass:[NSArray class]] || [availablePackages count] < 1) {
        return nil;
    }
    
    NSDictionary *firstAvailablePackage = availablePackages[0];
    if (!firstAvailablePackage || ![firstAvailablePackage isKindOfClass:[NSDictionary class]]) {
        return nil;
    }
    
    NSDictionary *presentedOfferingContextOptions = firstAvailablePackage[@"presentedOfferingContext"];
    if (!presentedOfferingContextOptions || [presentedOfferingContextOptions isKindOfClass:[NSNull class]]) {
        return nil;
    }
    
    NSString *offeringIdentifier = presentedOfferingContextOptions[@"offeringIdentifier"];
    if (!offeringIdentifier || [offeringIdentifier isKindOfClass:[NSNull class]]) {
        return nil;
    }
    
    NSString *placementIdentifier = presentedOfferingContextOptions[@"placementIdentifier"];
    if (![placementIdentifier isKindOfClass:[NSString class]]) {
        placementIdentifier = nil;
    }
    
    RCTargetingContext *targetingContext;
    NSDictionary *targetingContextOptions = presentedOfferingContextOptions[@"targetingContext"];
    if (targetingContextOptions && ![targetingContextOptions isKindOfClass:[NSNull class]]) {
        NSNumber *revision = targetingContextOptions[@"revision"];
        NSString *ruleId = targetingContextOptions[@"ruleId"];
        if (revision && [revision isKindOfClass:[NSNumber class]] && ruleId && [ruleId isKindOfClass:[NSString class]]) {
            targetingContext = [[RCTargetingContext alloc] initWithRevision:[revision integerValue] ruleId:ruleId];
        }
    }
    
    return [[RCPresentedOfferingContext alloc] initWithOfferingIdentifier:offeringIdentifier
                                                      placementIdentifier:placementIdentifier
                                                         targetingContext:targetingContext];
}

- (void)paywallViewController:(RCPaywallViewController *)controller
  didStartPurchaseWithPackage:(NSDictionary *)packageDictionary API_AVAILABLE(ios(15.0)) {
    self.onPurchaseStarted(@{
        KeyPackage: packageDictionary,
    });
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishPurchasingWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary
        transactionDictionary:(NSDictionary *)transactionDictionary API_AVAILABLE(ios(15.0)) {
    self.onPurchaseCompleted(@{
        KeyCustomerInfo: customerInfoDictionary,
        KeyStoreTransaction: transactionDictionary,
    });
}

- (void)paywallViewControllerDidCancelPurchase:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    self.onPurchaseCancelled(nil);
}

- (void)paywallViewControllerDidStartRestore:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    self.onRestoreStarted(nil);
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFailPurchasingWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    self.onPurchaseError(@{
        KeyError: errorDictionary
    });
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFinishRestoringWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary API_AVAILABLE(ios(15.0)) {
    self.onRestoreCompleted(@{
        KeyCustomerInfo: customerInfoDictionary
    });
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didFailRestoringWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    self.onRestoreError(@{
        KeyError: errorDictionary
    });
}

- (void)paywallViewControllerRequestedDismissal:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    self.onDismiss(nil);
}

- (void)paywallViewController:(RCPaywallViewController *)controller didChangeSizeTo:(CGSize)size API_AVAILABLE(ios(15.0)) {
}

- (void)paywallViewController:(RCPaywallViewController *)controller
didInitiatePurchaseWithPackageDictionary:(NSDictionary *)packageDictionary
                     requestId:(NSString *)requestId API_AVAILABLE(ios(15.0)) {
    if (self.onPurchasePackageInitiated) {
        self.onPurchasePackageInitiated(@{
            KeyPackage: packageDictionary,
            @"requestId": requestId,
        });
    } else {
        [PaywallProxy resumePurchasePackageInitiatedWithRequestId:requestId shouldProceed:YES];
    }
}

@end
