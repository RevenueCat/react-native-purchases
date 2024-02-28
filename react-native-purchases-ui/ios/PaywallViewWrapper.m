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
@import RevenueCatUI;

static NSString *const KeyCustomerInfo = @"customerInfo";
static NSString *const KeyStoreTransaction = @"storeTransaction";
static NSString *const KeyError = @"error";
static NSString *const KeyPackage = @"packageBeingPurchased";

API_AVAILABLE(ios(15.0))
@interface PaywallViewWrapper ()

@property(strong, nonatomic) RCPaywallViewController *paywallViewController;
@property(nonatomic) BOOL addedToHierarchy;

@end

@implementation PaywallViewWrapper

- (instancetype)initWithPaywallViewController:(RCPaywallViewController *)paywallViewController API_AVAILABLE(ios(15.0)) {
    NSParameterAssert(paywallViewController);

    if ((self = [super initWithFrame:paywallViewController.view.bounds])) {
        _paywallViewController = paywallViewController;
    }

    return self;
}


- (void)reactSetFrame:(CGRect)frame
{
    NSLog(@"RNPaywalls - reactSetFrame: %@", NSStringFromCGRect(frame));

    [super reactSetFrame: frame];
}

- (void)layoutSubviews {
    [super layoutSubviews];

    CGSize size = self.bounds.size;
    NSLog(@"RNPaywalls - Size on layoutSubviews: %@", NSStringFromCGSize(size));

    // Need to wait for this view to be in the hierarchy to look for the parent UIVC.
    // This is required to add a SwiftUI `UIHostingController` to the hierarchy in a way that allows
    // UIKit to read properties from the environment, like traits and safe area.
    if (!self.addedToHierarchy) {
        UIViewController *parentController = self.parentViewController;
        if (parentController) {
            self.paywallViewController.view.translatesAutoresizingMaskIntoConstraints = NO;
            [parentController addChildViewController:self.paywallViewController];
            [self addSubview:self.paywallViewController.view];
            [self.paywallViewController didMoveToParentViewController:parentController];

            NSLog(@"RNPaywalls - Activating constraints");
            [NSLayoutConstraint activateConstraints:@[
                [self.paywallViewController.view.topAnchor constraintEqualToAnchor:self.topAnchor],
                [self.paywallViewController.view.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
                [self.paywallViewController.view.leftAnchor constraintEqualToAnchor:self.leftAnchor],
                [self.paywallViewController.view.rightAnchor constraintEqualToAnchor:self.rightAnchor]
            ]];

            self.addedToHierarchy = YES;
        }
    }
}

- (void)setOptions:(NSDictionary *)options {
    if (@available(iOS 15.0, *)) {
        NSDictionary *offering = options[@"offering"];
        if (offering && ![offering isKindOfClass:[NSNull class]]) {
            NSString *identifier = offering[@"identifier"];
            if (identifier) {
                [self.paywallViewController updateWithOfferingIdentifier:identifier];
            }
        }

        NSString *fontFamily = options[@"fontFamily"];
        if (fontFamily && [fontFamily isKindOfClass:[NSString class]] && fontFamily.length > 0) {
            [self.paywallViewController updateFontWithFontName:fontFamily];
        }

        NSNumber *displayCloseButtonValue = options[@"displayCloseButton"];
        BOOL displayCloseButton = [displayCloseButtonValue isKindOfClass:[NSNumber class]] ? [displayCloseButtonValue boolValue] : NO;
        if (displayCloseButton) {
            [self.paywallViewController updateWithDisplayCloseButton:displayCloseButton];
        }
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
    }
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
    NSLog(@"RNPaywalls - Paywall view wrapper did change size to: %@", NSStringFromCGSize(size));
}

@end
