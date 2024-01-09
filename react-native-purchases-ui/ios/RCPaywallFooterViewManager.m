//
//  RCPaywallFooterViewManager.m
//  RNPaywalls
//
//  Created by Cesar de la Vega on 29/12/23.
//

#import "RCPaywallFooterViewManager.h"
@import PurchasesHybridCommon;

#import <React/RCTShadowView.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>

NS_ASSUME_NONNULL_BEGIN

@interface FooterViewWrapper : UIView

- (instancetype)initWithFooterView:(UIView *)footerView bridge:(RCTBridge *)bridge;

@end

NS_ASSUME_NONNULL_END

@interface FooterViewWrapper ()

@property (strong, nonatomic) UIView *footerView;
@property (strong, nonatomic) RCTBridge *bridge;

@end

@implementation FooterViewWrapper

- (instancetype)initWithFooterView:(UIView *)footerView bridge:(RCTBridge *)bridge {
    if ((self = [super initWithFrame:CGRectZero])) {
        _bridge = bridge;
        _footerView = footerView;
        [self addSubview:footerView];
        footerView.translatesAutoresizingMaskIntoConstraints = NO;
        // Set constraints to match the size and position of the footerView to the FooterViewWrapper
        [NSLayoutConstraint activateConstraints:@[
            [footerView.topAnchor constraintEqualToAnchor:self.topAnchor],
            [footerView.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
            [footerView.leftAnchor constraintEqualToAnchor:self.leftAnchor],
            [footerView.rightAnchor constraintEqualToAnchor:self.rightAnchor]
        ]];
    }
    return self;
}

// This is needed so it measures correctly the size of the children and react native can
// size the Javascript view correctly. Not doing this will render the view with height 0
// and will require the devs to set a fixed height to the view, which is not ideal
// https://medium.com/traveloka-engineering/react-native-at-traveloka-native-ui-components-c6b66f789f35
- (void)layoutSubviews {
    [super layoutSubviews];
    UIView *contentView = self.footerView.subviews.firstObject;
    [contentView layoutIfNeeded];

    CGSize contentSize = contentView.frame.size;

    CGRect newFrame = self.frame;
    newFrame.size = contentSize;
    self.frame = newFrame;

    self.footerView.frame = CGRectMake(0, 0, contentSize.width, contentSize.height);
    [self.bridge.uiManager setSize:contentView.bounds.size forView:self];
}

@end

@implementation RCPaywallFooterViewManager

RCT_EXPORT_MODULE(RCPaywallFooterView)

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        PaywallProxy *proxy = [[PaywallProxy alloc] init];
        UIView *footerView = [proxy createFooterPaywallView].view;
        return [[FooterViewWrapper alloc] initWithFooterView:footerView bridge:self.bridge];
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

@end
