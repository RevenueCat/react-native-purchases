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

@interface CustomFooterView ()

@property (strong, nonatomic) UIView *footerView;

@end

@implementation CustomFooterView

- (instancetype)initWithFooterView:(UIView *)footerView {
    if ((self = [super initWithFrame:CGRectZero])) {
        _footerView = footerView;
        [self addSubview:footerView];
        footerView.translatesAutoresizingMaskIntoConstraints = NO;
        // Set constraints to match the size and position of the footerView to the CustomFooterView
        [NSLayoutConstraint activateConstraints:@[
            [footerView.topAnchor constraintEqualToAnchor:self.topAnchor],
            [footerView.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
            [footerView.leftAnchor constraintEqualToAnchor:self.leftAnchor],
            [footerView.rightAnchor constraintEqualToAnchor:self.rightAnchor]
        ]];
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    UIView *contentView = _footerView.subviews.firstObject;
    [contentView layoutIfNeeded];

    // Get the size of the contentView
    CGSize contentSize = contentView.frame.size;

    // Now, adjust the _footerView to match the size of the contentView
    CGRect newFrame = self.frame;
    newFrame.size = contentSize;
    self.frame = newFrame;

    // Set the _footerView frame or constraints to match the content size
    _footerView.frame = CGRectMake(0, 0, contentSize.width, contentSize.height);
}

- (CGSize)intrinsicContentSize {
    UIView *contentView = _footerView.subviews.firstObject;
    [contentView layoutIfNeeded];  // Ensure layout calculations have been made
    return contentView.frame.size; // Return the content size
}

@end


@interface PaywallViewShadowNode : RCTShadowView

@end

@implementation PaywallViewShadowNode

static YGSize RCTMeasure(YGNodeRef node, float width, YGMeasureMode widthMode, float height, YGMeasureMode heightMode)
{
    PaywallViewShadowNode *footerView = (__bridge PaywallViewShadowNode *)YGNodeGetContext(node);
    
    CGSize size = CGSizeZero;

    size.width = width;

    if (heightMode == YGMeasureModeExactly) {
        size.height = height;
    } else if (heightMode == YGMeasureModeAtMost) {
        size.height = MIN(footerView.intrinsicContentSize.height, height);
    } else {
        size.height = footerView.intrinsicContentSize.height;
    }

    return (YGSize){RCTYogaFloatFromCoreGraphicsFloat(size.width), RCTYogaFloatFromCoreGraphicsFloat(321)};
}

- (instancetype)init
{
    if ((self = [super init])) {
        YGNodeSetMeasureFunc(self.yogaNode, RCTMeasure);
    }
    return self;
}

@end

@implementation RCPaywallFooterViewManager

RCT_EXPORT_MODULE(RCPaywallFooterView)

- (UIView *)view
{
    if (@available(iOS 15.0, *)) {
        PaywallProxy *proxy = [[PaywallProxy alloc] init];
        UIView *footerView = [proxy createFooterPaywallView].view;
        CustomFooterView *customFooterView = [[CustomFooterView alloc] initWithFooterView:footerView];
        return customFooterView;
    } else {
        NSLog(@"Error: attempted to present paywalls on unsupported iOS version.");
        return nil;
    }
}

- (RCTShadowView *)shadowView {
    return [PaywallViewShadowNode new];
}

@end
