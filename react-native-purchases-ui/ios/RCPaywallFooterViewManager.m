//
//  RCPaywallFooterViewManager.m
//  RNPaywalls
//
//  Created by Cesar de la Vega on 29/12/23.
//

#import "RCPaywallFooterViewManager.h"
@import PurchasesHybridCommon;


#import <React/RCTShadowView.h>

NS_ASSUME_NONNULL_BEGIN

@interface CustomFooterView : UIView

- (instancetype)initWithFooterView:(UIView *)footerView;

@end

NS_ASSUME_NONNULL_END

@implementation RCPaywallFooterViewManager

RCT_EXPORT_MODULE(RCPaywallFooterView)

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        PaywallProxy *proxy = [[PaywallProxy alloc] init];
        UIView *footerView = [proxy createFooterPaywallView].view;
        return footerView;
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

- (NSDictionary *)constantsToExport
{
    PaywallProxy *proxy = [[PaywallProxy alloc] init];
    UIView *footerView = [proxy createFooterPaywallView].view;
    [footerView sizeToFit];

    [footerView layoutIfNeeded];

    NSLog(@"Height of footerView: %f", CGRectGetHeight(footerView.frame));

    NSLog(@"Width of footerView: %f", CGRectGetWidth(footerView.frame));

    // this is too big, it might be because it renders a full UIViewController which defaults to full screen
//    return @{
//        @"ComponentHeight": @(CGRectGetHeight(footerView.frame)),
//        @"ComponentWidth": @(CGRectGetWidth(footerView.frame))
//    };
//
    return @{
        @"ComponentHeight": @(344.0f),
        @"ComponentWidth": @(CGRectGetWidth(footerView.frame))
    };

}

@end
