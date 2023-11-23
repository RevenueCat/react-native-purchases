//
//  RNPaywallManager.m
//  RNPurchases
//
//  Created by Nacho Soto on 11/1/23.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import "RNPaywallManager.h"
@import PurchasesHybridCommon;

@implementation RNPaywallManager

RCT_EXPORT_MODULE(RNPaywall)

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        PaywallProxy *proxy = [[PaywallProxy alloc] init];
        return [proxy createPaywallView].view;
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

@end
