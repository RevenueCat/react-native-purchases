//
//  PaywallViewWrapper.h
//  RNPaywalls
//
//  Created by Nacho Soto on 1/23/24.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface PaywallViewWrapper : UIView

- (instancetype)initWithCoder:(NSCoder *)coder NS_UNAVAILABLE;
- (instancetype)initWithFrame:(CGRect)frame NS_UNAVAILABLE;

- (instancetype)initWithPaywallViewController:(UIViewController *)paywallViewController NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
