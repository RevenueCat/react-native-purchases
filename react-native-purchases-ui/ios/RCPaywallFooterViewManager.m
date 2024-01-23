//
//  RCPaywallFooterViewManager.m
//  RNPaywalls
//
//  Created by Cesar de la Vega on 29/12/23.
//

#import "RNPaywalls.h"
#import "RCPaywallFooterViewManager.h"

@import RevenueCatUI;
@import PurchasesHybridCommon;

#import "PaywallViewWrapper.h"

#import <React/RCTShadowView.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <React/RCTRootViewDelegate.h>
#import <React/RCTEventEmitter.h>


NS_ASSUME_NONNULL_BEGIN

@interface FooterViewWrapper: PaywallViewWrapper

- (instancetype)initWithFooterViewController:(UIViewController *)footerViewController 
                                      bridge:(RCTBridge *)bridge;

@end

NS_ASSUME_NONNULL_END

@interface FooterViewWrapper () <RCPaywallViewControllerDelegate>

@property (strong, nonatomic) RCTBridge *bridge;

@property BOOL addedToHierarchy;

@end

@implementation FooterViewWrapper

- (instancetype)initWithFooterViewController:(UIViewController *)footerViewController bridge:(RCTBridge *)bridge {
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

- (void)paywallViewController:(RCPaywallViewController *)controller didChangeSizeTo:(CGSize)size API_AVAILABLE(ios(15.0)){
    [_bridge.uiManager setSize:size forView:self];
}

@end

@interface RCPaywallFooterViewManager ()

@property (nonatomic, strong) id proxyIfAvailable;

@end

@implementation RCPaywallFooterViewManager

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
        FooterViewWrapper *wrapper = [[FooterViewWrapper alloc] initWithFooterViewController:footerViewController
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
