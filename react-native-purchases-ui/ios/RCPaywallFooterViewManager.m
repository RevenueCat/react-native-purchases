//
//  RCPaywallFooterViewManager.m
//  RNPaywalls
//
//  Created by Cesar de la Vega on 29/12/23.
//

#import "RCPaywallFooterViewManager.h"
@import RevenueCatUI;
@import PurchasesHybridCommon;

#import <React/RCTShadowView.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <React/RCTRootViewDelegate.h>

NS_ASSUME_NONNULL_BEGIN

@interface FooterViewWrapper : UIView

- (instancetype)initWithFooterViewController:(UIViewController *)footerViewController bridge:(RCTBridge *)bridge;

@end

NS_ASSUME_NONNULL_END

@interface FooterViewWrapper () <RCPaywallViewControllerDelegate>

@property (strong, nonatomic) UIViewController *footerViewController;
@property (strong, nonatomic) RCTBridge *bridge;

@end

@implementation FooterViewWrapper

- (instancetype)initWithFooterViewController:(UIViewController *)footerViewController bridge:(RCTBridge *)bridge {
    if ((self = [super initWithFrame:footerViewController.view.bounds])) {
        _bridge = bridge;
        // TODO: look into retain cycles
        _footerViewController = footerViewController;

        [self addSubview:footerViewController.view];
        footerViewController.view.translatesAutoresizingMaskIntoConstraints = NO;
        // Set constraints to match the size and position of the footerView to the FooterViewWrapper
        [NSLayoutConstraint activateConstraints:@[
            [footerViewController.view.topAnchor constraintEqualToAnchor:self.topAnchor],
            [footerViewController.view.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
            [footerViewController.view.leftAnchor constraintEqualToAnchor:self.leftAnchor],
            [footerViewController.view.rightAnchor constraintEqualToAnchor:self.rightAnchor]
        ]];
    }
    return self;
}

- (void)paywallViewControlleSizeDidChange:(CGSize)size {
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
