//
//  CustomerCenterViewManager.h
//
//  Created by Facundo Menzella on 29/12/23.
//  Copyright © 2023 Facebook. All rights reserved.

#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>

@import RevenueCatUI;
@import PurchasesHybridCommonUI;

@interface CustomerCenterViewWrapper : UIView<RCCustomerCenterViewControllerDelegateWrapper>

@property (nonatomic, copy) RCTDirectEventBlock onDismiss;
@property (nonatomic, copy) RCTDirectEventBlock onCustomActionSelected;

- (instancetype)initWithCustomerCenterViewController:(CustomerCenterUIViewController *)viewController;

@end

