//
//  PaywallPortalViewManager.m
//  RNPaywalls
//
//  Prototype. See header.
//

#import "PaywallPortalViewManager.h"

#import <React/RCTBridge.h>
#import <React/RCTTouchHandler.h>
#import <React/RCTUtils.h>
#import <React/RCTView.h>
#import <React/UIView+React.h>
#if __has_include(<React/RCTSurfaceTouchHandler.h>)
#import <React/RCTSurfaceTouchHandler.h>
#endif

#pragma mark - Container placed inside the host view controller

@interface RCPaywallPortalContainerView : UIView

@property (nonatomic, copy, nullable) void (^onLeftWindow)(void);

@end

@implementation RCPaywallPortalContainerView

// Only React children take touches. Empty areas fall through to the paywall underneath.
- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    UIView *hit = [super hitTest:point withEvent:event];
    return hit == self ? nil : hit;
}

- (void)didMoveToWindow {
    [super didMoveToWindow];
    if (self.window == nil && self.onLeftWindow) {
        self.onLeftWindow();
    }
}

@end

#pragma mark - Portal host view (lives in the React tree)

@interface RCPaywallPortalHostView : RCTView

@property (nonatomic, copy) RCTDirectEventBlock onAnchored;
@property (nonatomic, copy) RCTDirectEventBlock onHostDismissed;
@property (nonatomic, weak) RCTBridge *bridge;

@end

@interface RCPaywallPortalHostView ()

@property (nonatomic, strong, nullable) RCPaywallPortalContainerView *container;
@property (nonatomic, strong, nullable) id touchHandler;

@end

@implementation RCPaywallPortalHostView

#pragma mark React subviews

- (void)didUpdateReactSubviews {
    [self placeChildren];
}

// Children must never land in a window before the portal knows where they belong: a Modal
// child decides its presenter the moment it enters a window and never retries. While the
// presented controller is mid-transition, children stay detached and we try again after it.
- (void)placeChildren {
    // Already anchored into a live controller: keep feeding it. Anything presented above it,
    // including a Modal child of ours, doesn't move the portal.
    if (self.container != nil && self.container.window != nil) {
        [self addChildrenTo:self.container];
        return;
    }

    UIViewController *top = RCTPresentedViewController();
    // Only a controller presented above us is worth anchoring into. The root never is, and
    // neither is a modal we're already rendered inside of. Our own view may not be attached yet
    // at mount time, so don't rely on ancestry alone.
    BOOL presentedAboveUs = top != nil && top.presentingViewController != nil
        && top.view.window != nil && ![self isDescendantOfView:top.view];
    if (!presentedAboveUs || self.reactSubviews.count == 0) {
        [self tearDownContainerNotifying:NO];
        [self addChildrenTo:self];
        return;
    }

    UIViewController *inTransition = top.presentedViewController ?: top;
    BOOL settling = top.isBeingPresented || top.presentedViewController != nil || inTransition.transitionCoordinator != nil;

    if (settling) {
        for (UIView *subview in self.reactSubviews) {
            [subview removeFromSuperview];
        }
        __weak typeof(self) weakSelf = self;
        void (^retry)(void) = ^{
            dispatch_async(dispatch_get_main_queue(), ^{ [weakSelf placeChildren]; });
        };
        id<UIViewControllerTransitionCoordinator> coordinator = inTransition.transitionCoordinator;
        if (coordinator) {
            [coordinator animateAlongsideTransition:nil completion:^(id<UIViewControllerTransitionCoordinatorContext> _Nonnull context) {
                retry();
            }];
        } else {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.05 * NSEC_PER_SEC)), dispatch_get_main_queue(), retry);
        }
        return;
    }

    [self anchorIfNeededTo:top];
    [self addChildrenTo:self.container ?: self];
}

- (void)addChildrenTo:(UIView *)target {
    for (UIView *subview in self.reactSubviews) {
        if (subview.superview != target) {
            [target addSubview:subview];
        }
    }
    if (target == self.container) {
        [self ensureTouchHandler];
    }
}

- (void)anchorIfNeededTo:(UIViewController *)top {
    // Anchor only into a controller presented above us. If the portal already lives inside the
    // topmost controller's view (nothing presented, or we're inside that modal), stay put.
    UIView *desiredHost = nil;
    if (top != nil && top.view.window != nil && ![self isDescendantOfView:top.view]) {
        desiredHost = top.view;
    }

    if (desiredHost == nil) {
        [self tearDownContainerNotifying:NO];
        return;
    }
    if (self.container != nil && self.container.superview == desiredHost) {
        return;
    }
    // The topmost controller changed. Move to the new one.
    [self tearDownContainerNotifying:NO];

    RCPaywallPortalContainerView *container = [[RCPaywallPortalContainerView alloc] initWithFrame:desiredHost.bounds];
    container.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    container.backgroundColor = UIColor.clearColor;
    __weak typeof(self) weakSelf = self;
    container.onLeftWindow = ^{
        [weakSelf handleHostDismissed];
    };
    [desiredHost addSubview:container];
    self.container = container;
    self.touchHandler = nil;

    if (self.onAnchored) {
        self.onAnchored(@{@"controller": NSStringFromClass(top.class)});
    }
}

- (void)handleHostDismissed {
    // The presented controller went away. Bring the children home so React still owns live views.
    for (UIView *subview in self.reactSubviews) {
        [self addSubview:subview];
    }
    [self tearDownContainerNotifying:YES];
}

- (void)tearDownContainerNotifying:(BOOL)notify {
    RCPaywallPortalContainerView *container = self.container;
    if (container == nil) {
        return;
    }
    container.onLeftWindow = nil;
    [container removeFromSuperview];
    self.container = nil;
    self.touchHandler = nil;
    if (notify && self.onHostDismissed) {
        self.onHostDismissed(nil);
    }
}

#pragma mark Touch handling for inline children

- (void)ensureTouchHandler {
    if (self.touchHandler || self.reactSubviews.count == 0) {
        return;
    }
    id touchHandler;
#if __has_include(<React/RCTSurfaceTouchHandler.h>)
    UIView *firstChild = self.reactSubviews.firstObject;
    if ([firstChild respondsToSelector:NSSelectorFromString(@"touchEventEmitterAtPoint:")]) {
        touchHandler = [RCTSurfaceTouchHandler new];
    }
#endif
    if (!touchHandler) {
        touchHandler = [[RCTTouchHandler alloc] initWithBridge:self.bridge];
    }
    [touchHandler attachToView:self.container];
    self.touchHandler = touchHandler;
}

@end

#pragma mark - View manager

@implementation PaywallPortalViewManager

RCT_EXPORT_MODULE(RCPaywallPortalView)

RCT_EXPORT_VIEW_PROPERTY(onAnchored, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onHostDismissed, RCTDirectEventBlock)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (UIView *)view {
    RCPaywallPortalHostView *view = [RCPaywallPortalHostView new];
    view.bridge = self.bridge;
    return view;
}

@end
