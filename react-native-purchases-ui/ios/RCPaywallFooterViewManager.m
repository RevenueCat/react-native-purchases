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
    if ((self = [super init])) {
        _footerView = footerView;
        [self addSubview:_footerView];
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.footerView.frame = self.bounds;
    CGSize footerSize = self.footerView.intrinsicContentSize;
    footerSize;
}

@end


@interface PaywallViewShadowNode : RCTShadowView

@end

@implementation PaywallViewShadowNode

static YGSize RCTMeasure(YGNodeRef node, float width, YGMeasureMode widthMode, float height, YGMeasureMode heightMode)
{
    PaywallViewShadowNode *shadowText = (__bridge PaywallViewShadowNode *)YGNodeGetContext(node);
    YGSize result;

    result.width = width;
    result.height = height;
    
    return result;
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
