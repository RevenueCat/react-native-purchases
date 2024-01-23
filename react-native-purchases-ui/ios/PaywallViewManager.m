//
//  RNPaywallManager.m
//  RNPurchases
//
//  Created by Nacho Soto on 11/1/23.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import "PaywallViewManager.h"
#import "UIView+Extensions.h"
@import PurchasesHybridCommon;

@interface PaywallView : UIView

@property (strong, nonatomic) UIViewController *paywallViewController;
@property  BOOL addedToHierarchy;

@end

@implementation PaywallView

- (instancetype)initWithPaywallViewController:(UIViewController *)paywallViewController
                                    innerView:(UIView *)innerView {
    if ((self = [super initWithFrame:innerView.bounds])) {
        _paywallViewController = paywallViewController;
        [self addSubview:innerView];
        _addedToHierarchy = NO;
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];

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

@end

@implementation PaywallViewManager

RCT_EXPORT_MODULE(Paywall)

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        PaywallProxy *proxy = [[PaywallProxy alloc] init];
        UIViewController *viewController = [proxy createPaywallView];
        UIView *innerView = viewController.view;

        PaywallView *paywallView = [[PaywallView alloc] initWithPaywallViewController:viewController
                                                                            innerView:innerView];
        return paywallView;
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

@end
