//
//  PaywallViewWrapper.m
//  RNPaywalls
//
//  Created by Nacho Soto on 1/23/24.
//

#import "PaywallViewWrapper.h"

#import "UIView+Extensions.h"

@import PurchasesHybridCommonUI;
@import RevenueCatUI;

API_AVAILABLE(ios(15.0))
@interface PaywallViewWrapper ()

@property (strong, nonatomic) RCPaywallViewController *paywallViewController;

@property (nonatomic) BOOL addedToHierarchy;

@end

@implementation PaywallViewWrapper

- (instancetype)initWithPaywallViewController:(RCPaywallViewController *)paywallViewController API_AVAILABLE(ios(15.0)){
    NSParameterAssert(paywallViewController);

    if ((self = [super initWithFrame:paywallViewController.view.bounds])) {
        _paywallViewController = paywallViewController;
    }

    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];

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
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
    }
}

- (void) paywallViewControllerDidStartPurchase:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    // TODO We need to send the package being purchased to match Android
}

- (void)                paywallViewController:(RCPaywallViewController *)controller
didFinishPurchasingWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary
                        transactionDictionary:(NSDictionary *)transactionDictionary API_AVAILABLE(ios(15.0)) {
    self.onPurchaseCompleted(@{
        @"customerInfo": customerInfoDictionary,
        @"storeTransaction": transactionDictionary,
    });
}

- (void)paywallViewControllerDidCancelPurchase:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    self.onPurchaseCancelled(nil);
}

- (void)          paywallViewController:(RCPaywallViewController *)controller
   didFailPurchasingWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    self.onPurchaseError(@{
        @"error": errorDictionary
    });
}

- (void)               paywallViewController:(RCPaywallViewController *)controller
didFinishRestoringWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary API_AVAILABLE(ios(15.0)) {
    self.onRestoreCompleted(@{
        @"customerInfo": customerInfoDictionary
    });
}

- (void)      paywallViewController:(RCPaywallViewController *)controller
didFailRestoringWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    self.onRestoreError(@{
        @"error": errorDictionary
    });
}

- (void) paywallViewControllerWasDismissed:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    self.onDismiss(nil);
}


@end
