//
//  NativeOverlayViewManager.m
//  RNPaywalls
//
//  Created by Cesar de la Vega on 16/10/26.
//

#import "NativeOverlayViewManager.h"

#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import <React/RCTTouchHandler.h>
#import <React/RCTUtils.h>
#import <React/RCTView.h>
#import <React/UIView+React.h>
#if __has_include(<React/RCTSurfaceTouchHandler.h>)
#import <React/RCTSurfaceTouchHandler.h>
#endif

// React Native's Modal presents from the React root view controller. While a paywall is
// presented from that same controller, UIKit rejects the second presentation. This host
// presents from the topmost presented view controller instead, using the same
// reparent-plus-touch-handler approach as RCTModalHostView.

static const NSUInteger RCNativeOverlayMaxPresentAttempts = 20;
static const NSTimeInterval RCNativeOverlayRetryInterval = 0.05;

#pragma mark - Content view controller

@interface RCNativeOverlayViewController : UIViewController

@property (nonatomic, copy, nullable) void (^onDisappear)(void);

@end

@implementation RCNativeOverlayViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = UIColor.clearColor;
    self.view.accessibilityViewIsModal = YES;
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    // Dismissing the presenting paywall dismisses this controller with it.
    if ((self.isBeingDismissed || self.presentingViewController == nil) && self.onDisappear) {
        self.onDisappear();
    }
}

@end

#pragma mark - Host view

@interface RCNativeOverlayHostView : RCTView

@property (nonatomic, assign) BOOL visible;
@property (nonatomic, copy) RCTDirectEventBlock onShow;
@property (nonatomic, copy) RCTDirectEventBlock onDismiss;
@property (nonatomic, weak) RCTBridge *bridge;

@end

@interface RCNativeOverlayHostView ()

@property (nonatomic, strong) RCNativeOverlayViewController *contentController;
@property (nonatomic, strong) id touchHandler;
/// The overlay is on screen, or a presentation has been handed to UIKit.
@property (nonatomic, assign) BOOL presented;
/// A presentation attempt is waiting for a transition or a presenter to become available.
@property (nonatomic, assign) BOOL waitingToPresent;
@property (nonatomic, assign) NSUInteger presentAttempts;

@end

@implementation RCNativeOverlayHostView

- (RCNativeOverlayViewController *)contentController {
    if (!_contentController) {
        _contentController = [RCNativeOverlayViewController new];
        _contentController.modalPresentationStyle = UIModalPresentationOverFullScreen;
        _contentController.modalInPresentation = YES;
        __weak typeof(self) weakSelf = self;
        _contentController.onDisappear = ^{
            [weakSelf handleExternalDismissal];
        };
    }
    return _contentController;
}

#pragma mark React subviews

- (void)didUpdateReactSubviews {
    // React keeps owning and laying out these children. Only their native container changes.
    UIView *container = self.contentController.view;
    for (UIView *subview in self.reactSubviews) {
        [container addSubview:subview];
    }
    [self ensureTouchHandler];
    [self updatePresentation];
}

- (void)removeReactSubview:(UIView *)subview {
    [super removeReactSubview:subview];
    [subview removeFromSuperview];
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
    if (self.superview == nil) {
        // Unmounted. Tear the overlay down without notifying a component that no longer exists.
        self.visible = NO;
    }
}

- (void)dealloc {
    if (_contentController.presentingViewController) {
        [_contentController dismissViewControllerAnimated:NO completion:nil];
    }
}

#pragma mark Props

- (void)setVisible:(BOOL)visible {
    _visible = visible;
    [self updatePresentation];
}

#pragma mark Presentation

- (void)updatePresentation {
    if (self.visible && !self.presented && !self.waitingToPresent) {
        self.waitingToPresent = YES;
        self.presentAttempts = 0;
        [self attemptPresentation];
    } else if (!self.visible) {
        [self dismissOverlay];
    }
}

- (void)attemptPresentation {
    if (!self.visible || !self.waitingToPresent) {
        self.waitingToPresent = NO;
        return;
    }

    UIViewController *presenter = RCTPresentedViewController();
    // RCTPresentedViewController skips controllers being dismissed, so `presenter` may still
    // have a presented child that is on its way out. Wait for either transition to settle.
    UIViewController *inTransition = presenter.presentedViewController ?: presenter;
    BOOL busy = presenter == nil
        || presenter.view.window == nil
        || presenter.isBeingPresented
        || presenter.presentedViewController != nil
        || inTransition.transitionCoordinator != nil;

    if (busy) {
        [self retryPresentationAfter:inTransition.transitionCoordinator];
        return;
    }

    self.waitingToPresent = NO;
    self.presented = YES;
    [self ensureTouchHandler];

    __weak typeof(self) weakSelf = self;
    [presenter presentViewController:self.contentController animated:NO completion:^{
        RCNativeOverlayHostView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.presented) {
            return;
        }
        UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, strongSelf.contentController.view);
        if (strongSelf.onShow) {
            strongSelf.onShow(nil);
        }
    }];
}

- (void)retryPresentationAfter:(nullable id<UIViewControllerTransitionCoordinator>)coordinator {
    self.presentAttempts += 1;
    if (self.presentAttempts > RCNativeOverlayMaxPresentAttempts) {
        RCTLogWarn(@"[RevenueCat] NativeOverlay: no view controller became available to present from.");
        self.waitingToPresent = NO;
        return;
    }

    __weak typeof(self) weakSelf = self;
    void (^retry)(void) = ^{
        dispatch_async(dispatch_get_main_queue(), ^{
            [weakSelf attemptPresentation];
        });
    };

    if (coordinator) {
        [coordinator animateAlongsideTransition:nil completion:^(id<UIViewControllerTransitionCoordinatorContext> _Nonnull context) {
            retry();
        }];
    } else {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(RCNativeOverlayRetryInterval * NSEC_PER_SEC)),
                       dispatch_get_main_queue(),
                       retry);
    }
}

- (void)dismissOverlay {
    self.waitingToPresent = NO;
    if (!self.presented) {
        return;
    }
    // Clearing `presented` first lets viewDidDisappear tell our dismissal from an external one.
    self.presented = NO;

    __weak typeof(self) weakSelf = self;
    void (^finished)(void) = ^{
        RCNativeOverlayHostView *strongSelf = weakSelf;
        if (strongSelf && strongSelf.onDismiss) {
            strongSelf.onDismiss(nil);
        }
    };

    if (self.contentController.presentingViewController) {
        [self.contentController dismissViewControllerAnimated:NO completion:finished];
    } else {
        finished();
    }
}

- (void)handleExternalDismissal {
    // Our own dismissal clears `presented` before UIKit runs the transition.
    if (!self.presented) {
        return;
    }
    self.presented = NO;
    if (self.onDismiss) {
        self.onDismiss(nil);
    }
}

#pragma mark Touch handling

- (void)ensureTouchHandler {
    if (self.touchHandler || self.reactSubviews.count == 0) {
        return;
    }

    id touchHandler;
#if __has_include(<React/RCTSurfaceTouchHandler.h>)
    // This legacy view manager also runs under the Fabric interop layer, where children are
    // Fabric component views. Pick the touch pipeline that matches the mounted children.
    UIView *firstChild = self.reactSubviews.firstObject;
    if ([firstChild respondsToSelector:NSSelectorFromString(@"touchEventEmitterAtPoint:")]) {
        touchHandler = [RCTSurfaceTouchHandler new];
    }
#endif
    if (!touchHandler) {
        touchHandler = [[RCTTouchHandler alloc] initWithBridge:self.bridge];
    }

    [touchHandler attachToView:self.contentController.view];
    self.touchHandler = touchHandler;
}

@end

#pragma mark - View manager

@implementation NativeOverlayViewManager

RCT_EXPORT_MODULE(RCNativeOverlayView)

RCT_EXPORT_VIEW_PROPERTY(visible, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onShow, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (UIView *)view {
    RCNativeOverlayHostView *view = [RCNativeOverlayHostView new];
    view.bridge = self.bridge;
    return view;
}

@end
