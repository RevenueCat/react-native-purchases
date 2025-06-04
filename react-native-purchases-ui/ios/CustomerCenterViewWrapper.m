//
//  CustomerCenterViewManager.m
//
//  Created by Facundo Menzella on 29/12/23.
//  Copyright © 2023 Facebook. All rights reserved.

#import "CustomerCenterViewWrapper.h"
#import "UIView+Extensions.h"
#import "UIView+React.h"

@import RevenueCatUI;

API_AVAILABLE(ios(15.0))
@interface CustomerCenterViewWrapper ()

@property (strong, nonatomic) CustomerCenterUIViewController *customerCenterVC;
@property (nonatomic) BOOL addedToHierarchy;

@end

@implementation CustomerCenterViewWrapper

- (instancetype)initWithCustomerCenterViewController:(CustomerCenterUIViewController *)viewController API_AVAILABLE(ios(15.0)) {
    NSParameterAssert(viewController);

    if ((self = [super initWithFrame:viewController.view.bounds])) {
        _customerCenterVC = viewController;
    }

    return self;
}

- (void)reactSetFrame:(CGRect)frame {
    [super reactSetFrame:frame];
}

- (void)layoutSubviews {
    [super layoutSubviews];

    if (!self.addedToHierarchy) {
        UIViewController *parentController = self.parentViewController;
        if (parentController) {
            self.customerCenterVC.view.translatesAutoresizingMaskIntoConstraints = NO;
            [parentController addChildViewController:self.customerCenterVC];
            [self addSubview:self.customerCenterVC.view];
            [self.customerCenterVC didMoveToParentViewController:parentController];

            [NSLayoutConstraint activateConstraints:@[
                    [self.customerCenterVC.view.topAnchor constraintEqualToAnchor:self.topAnchor],
                    [self.customerCenterVC.view.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
                    [self.customerCenterVC.view.leftAnchor constraintEqualToAnchor:self.leftAnchor],
                    [self.customerCenterVC.view.rightAnchor constraintEqualToAnchor:self.rightAnchor]
            ]];

            self.addedToHierarchy = YES;
        }
    }
}

- (void)customerCenterViewControllerRequestedDismissal:(CustomerCenterUIViewController *)controller {
    if (self.onDismiss) {
        self.onDismiss(nil);
    }
}

@end
