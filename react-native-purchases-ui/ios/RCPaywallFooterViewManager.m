//
//  RCPaywallFooterViewManager.m
//  RNPaywalls
//
//  Created by Cesar de la Vega on 29/12/23.
//

#import "RNPaywalls.h"
#import "RCPaywallFooterViewManager.h"

@import RevenueCatUI;
@import PurchasesHybridCommonUI;

#import "PaywallViewWrapper.h"

#import <React/RCTShadowView.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <React/RCTRootViewDelegate.h>
#import <React/RCTEventEmitter.h>


NS_ASSUME_NONNULL_BEGIN

@interface FooterViewWrapper: PaywallViewWrapper

- (instancetype)initWithPaywallViewController:(UIViewController *)footerViewController
                                       bridge:(RCTBridge *)bridge;

@end

NS_ASSUME_NONNULL_END

@interface FooterViewWrapper () <RCPaywallViewControllerDelegateWrapper>

@property (strong, nonatomic) RCTBridge *bridge;

@property (nonatomic, copy) RCTDirectEventBlock onPurchaseStarted;
@property (nonatomic, copy) RCTDirectEventBlock onPurchaseCompleted;
@property (nonatomic, copy) RCTDirectEventBlock onPurchaseError;
@property (nonatomic, copy) RCTDirectEventBlock onPurchaseCancelled;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreStarted;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreCompleted;
@property (nonatomic, copy) RCTDirectEventBlock onRestoreError;

@end

@implementation FooterViewWrapper

- (instancetype)initWithPaywallViewController:(UIViewController *)footerViewController bridge:(RCTBridge *)bridge {
    if ((self = [super initWithPaywallViewController:footerViewController])) {
        _bridge = bridge;
    }

    return self;
}

- (void)safeAreaInsetsDidChange {
    [super safeAreaInsetsDidChange];

    // Get the safe area insets, for example
    UIEdgeInsets safeAreaInsets = self.safeAreaInsets;

    //    TODO: figure out a better way of sending event, since this is deprecated
    //    It's probably better to create a singleton from the module that this view manager can call and use to send events
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    [self.bridge.eventDispatcher sendAppEventWithName:safeAreaInsetsDidChangeEvent
                                                 body:@{@"top": @(safeAreaInsets.top),
                                                        @"left": @(safeAreaInsets.left),
                                                        @"bottom": @(safeAreaInsets.bottom),
                                                        @"right": @(safeAreaInsets.right)}];
#pragma clang diagnostic pop
}

- (void)                paywallViewController:(RCPaywallViewController *)controller
didFinishPurchasingWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary
                        transactionDictionary:(NSDictionary *)transactionDictionary API_AVAILABLE(ios(15.0)) {
    self.onPurchaseCompleted(@{
        @"customerInfo": customerInfoDictionary,
        @"storeTransaction": transactionDictionary,
    });
}

- (void)paywallViewControllerDidCancelPurchase:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    self.onPurchaseCancelled(@{});
}

- (void)          paywallViewController:(RCPaywallViewController *)controller
   didFailPurchasingWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    self.onPurchaseError(errorDictionary);
}

- (void)               paywallViewController:(RCPaywallViewController *)controller
didFinishRestoringWithCustomerInfoDictionary:(NSDictionary *)customerInfoDictionary API_AVAILABLE(ios(15.0)) {
    self.onRestoreCompleted(customerInfoDictionary);
}

- (void)      paywallViewController:(RCPaywallViewController *)controller
didFailRestoringWithErrorDictionary:(NSDictionary *)errorDictionary API_AVAILABLE(ios(15.0)) {
    self.onRestoreError(errorDictionary);
}

- (void) paywallViewControllerWasDismissed:(RCPaywallViewController *)controller API_AVAILABLE(ios(15.0)) {
    // TODO
}

- (void)paywallViewController:(RCPaywallViewController *)controller didChangeSizeTo:(CGSize)size API_AVAILABLE(ios(15.0)) {
    [_bridge.uiManager setIntrinsicContentSize:CGSizeMake(UIViewNoIntrinsicMetric, size.height) forView:self];
}

@end

@interface RCPaywallFooterViewManager ()

@property (nonatomic, strong) id proxyIfAvailable;

@end

@implementation RCPaywallFooterViewManager

RCT_EXPORT_VIEW_PROPERTY(options, NSDictionary);

RCT_EXPORT_VIEW_PROPERTY(onPurchaseStarted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPurchaseCompleted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPurchaseError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPurchaseCancelled, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreStarted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreCompleted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreError, RCTDirectEventBlock)

RCT_EXPORT_MODULE(RCPaywallFooterView)

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
        UIViewController *footerViewController = [self.proxy createFooterPaywallView];
        FooterViewWrapper *wrapper = [[FooterViewWrapper alloc] initWithPaywallViewController:footerViewController
                                                                                       bridge:self.bridge];
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
