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

    if ((self = [super initWithFrame:CGRectZero])) { // Don't access the .view yet (rely on autolayout in layoutSubviews)
        _customerCenterVC = viewController;
        _shouldShowCloseButton = YES; // Default to YES
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
            // Configure the close button BEFORE accessing .view (which triggers viewDidLoad)
            self.customerCenterVC.shouldShowCloseButton = self.shouldShowCloseButton;
            
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

- (void)customerCenterViewController:(CustomerCenterUIViewController *)controller
               didSelectCustomAction:(NSString *)actionID
              withPurchaseIdentifier:(NSString *)purchaseIdentifier API_AVAILABLE(ios(15.0)) {
    if (self.onCustomActionSelected) {
        self.onCustomActionSelected(@{@"actionId": actionID, @"purchaseIdentifier": purchaseIdentifier ?: [NSNull null]});
    }
}

- (void)setShouldShowCloseButton:(BOOL)shouldShowCloseButton {
    _shouldShowCloseButton = shouldShowCloseButton;
    
    // Only set the view controller property if we haven't been added to hierarchy yet
    // Once added to hierarchy, the property is already configured and shouldn't be changed
    if (self.customerCenterVC && !self.addedToHierarchy) {
        self.customerCenterVC.shouldShowCloseButton = shouldShowCloseButton;
    }
}

@end
