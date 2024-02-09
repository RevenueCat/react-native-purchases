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
@import RevenueCatUI;

@interface PaywallViewManager ()

@property (nonatomic, strong) id proxyIfAvailable;

@end

@implementation PaywallViewManager

RCT_EXPORT_VIEW_PROPERTY(options, NSDictionary);

RCT_EXPORT_MODULE(Paywall)

- (instancetype)init {
    if ((self = [super init])) {
        if (@available(iOS 15.0, *)) {
            _proxyIfAvailable = [[PaywallProxy alloc] init];
        }
    }

    return self;
}

- (PaywallProxy *)proxy API_AVAILABLE(ios(15.0)){
    return (PaywallProxy *)self.proxyIfAvailable;
}

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        return [[PaywallViewWrapper alloc] initWithPaywallViewController:[self.proxy createPaywallView]];
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
