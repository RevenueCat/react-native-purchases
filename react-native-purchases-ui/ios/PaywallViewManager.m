//
//  RNPaywallManager.m
//  RNPurchases
//
//  Created by Nacho Soto on 11/1/23.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import "PaywallViewManager.h"
#import "PaywallViewWrapper.h"

@import PurchasesHybridCommonUI;
@import PurchasesHybridCommon;
@import RevenueCatUI;

@implementation PaywallViewManager

RCT_EXPORT_MODULE(Paywall)

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        PaywallProxy *proxy = [[PaywallProxy alloc] init];

        return [[PaywallViewWrapper alloc] initWithPaywallViewController:[proxy createPaywallView]];
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

@end
