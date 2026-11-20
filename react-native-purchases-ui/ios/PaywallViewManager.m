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
RCT_EXPORT_VIEW_PROPERTY(onPurchasePackageInitiated, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPerformPurchase, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPerformRestore, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onWebCheckoutOpened, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUrlOpened, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onInteraction, RCTDirectEventBlock)

RCT_EXPORT_MODULE(PaywallView)

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        PaywallProxy *proxy = [[PaywallProxy alloc] init];
        PaywallViewCreationParams *params = [PaywallViewCreationParams new];
        RCPaywallViewController *viewController = [proxy createPaywallViewWithParams:params];
        PaywallViewWrapper *wrapper = [[PaywallViewWrapper alloc] initWithPaywallViewController:viewController];
        wrapper.createViewController = ^UIViewController * _Nullable(HybridPurchaseLogicBridge * _Nonnull bridge) {
            PaywallViewCreationParams *params = [PaywallViewCreationParams new];
            params.purchaseLogicBridge = bridge;
            return [proxy createPaywallViewWithParams:params];
        };
        proxy.delegate = wrapper.eventForwarder;

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
