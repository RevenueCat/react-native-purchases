//
//  PaywallViewWrapper.h
//  RNPaywalls
//
//  Created by Nacho Soto on 1/23/24.
//

#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>
@import PurchasesHybridCommonUI;

NS_ASSUME_NONNULL_BEGIN

@interface PaywallViewWrapper : UIView <RCPaywallViewControllerDelegateWrapper>

@property (nonatomic, copy) RCTDirectEventBlock onPurchaseStarted;
@property (nonatomic, copy) RCTDirectEventBlock onPurchaseCompleted;
@property (nonatomic, copy) RCTDirectEventBlock onPurchaseError;
@property (nonatomic, copy) RCTDirectEventBlock onPurchaseCancelled;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreStarted;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreCompleted;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreError;
@property (nonatomic, copy) RCTDirectEventBlock onDismiss;

- (instancetype)initWithCoder:(NSCoder *)coder NS_UNAVAILABLE;
- (instancetype)initWithFrame:(CGRect)frame NS_UNAVAILABLE;

- (instancetype)initWithPaywallViewController:(UIViewController *)paywallViewController NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
