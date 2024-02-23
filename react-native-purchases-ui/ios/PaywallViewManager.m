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

RCT_EXPORT_VIEW_PROPERTY(onPurchaseStarted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPurchaseCompleted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPurchaseError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPurchaseCancelled, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreStarted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreCompleted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

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
        UIViewController *viewController = [self.proxy createPaywallView];
        PaywallViewWrapper *wrapper = [[PaywallViewWrapper alloc] initWithPaywallViewController:viewController];
        self.proxy.delegate = wrapper;

        return wrapper;
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
