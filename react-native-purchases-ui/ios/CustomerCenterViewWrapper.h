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
@property (nonatomic, copy) RCTDirectEventBlock onRestoreStarted;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreCompleted;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreFailed;
@property (nonatomic, copy) RCTDirectEventBlock onShowingManageSubscriptions;
@property (nonatomic, copy) RCTDirectEventBlock onRefundRequestStarted;
@property (nonatomic, copy) RCTDirectEventBlock onRefundRequestCompleted;
@property (nonatomic, copy) RCTDirectEventBlock onFeedbackSurveyCompleted;
@property (nonatomic, copy) RCTDirectEventBlock onManagementOptionSelected;
@property (nonatomic, assign) BOOL shouldShowCloseButton;

- (instancetype)initWithCustomerCenterViewController:(CustomerCenterUIViewController *)viewController;

@end
