//
//  UIView+Extensions.m
//  RNPaywalls
//
//  Created by Nacho Soto on 29/12/23.
//

#import "UIView+Extensions.h"

@implementation UIView (ParentViewController)

- (UIViewController * _Nullable)parentViewController {
    UIResponder *responder = self;
    while (responder) {
        responder = responder.nextResponder;
        if ([responder isKindOfClass:[UIViewController class]]) {
            return (UIViewController *)responder;
        }
    }
    return nil;
}

@end
