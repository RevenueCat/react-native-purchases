// Throwaway prototype. Hosts consumer React children above the request's native paywall.
#import <React/RCTViewManager.h>
#import <React/RCTView.h>
#import <React/RCTBridge.h>
#import <React/UIView+React.h>
#if __has_include(<React/RCTSurfaceTouchHandler.h>)
#import <React/RCTSurfaceTouchHandler.h>
#endif
#import <React/RCTTouchHandler.h>
#import "RNPaywalls.h"
#import "RNPaywalls-Swift.h"

API_AVAILABLE(ios(15.0))
@interface CheckpointErrorHostView : RCTView <CheckpointErrorHostForTest>
@property(nonatomic, copy) NSString *requestId;
@property(nonatomic, copy) RCTDirectEventBlock onShow;
@property(nonatomic, copy) RCTDirectEventBlock onDismiss;
@property(nonatomic, copy) RCTDirectEventBlock onFailure;
@property(nonatomic, weak) CheckpointTestAdapter *adapter;
@property(nonatomic, weak) RCTBridge *bridge;
@property(nonatomic, strong) UIViewController *contentController;
@property(nonatomic, strong) UIGestureRecognizer *contentTouchHandler;
@property(nonatomic) BOOL presentationStarted;
@property(nonatomic) BOOL closing;
@property(nonatomic, copy) dispatch_block_t finishDismissal;
@end

@implementation CheckpointErrorHostView

- (UIViewController *)contentController {
    if (!_contentController) {
        _contentController = [UIViewController new];
        _contentController.modalPresentationStyle = UIModalPresentationOverFullScreen;
        _contentController.modalInPresentation = YES;
        _contentController.view.backgroundColor = UIColor.clearColor;
        _contentController.view.accessibilityViewIsModal = YES;
    }
    return _contentController;
}

- (void)didUpdateReactSubviews {
    // React still owns/mounts these children. Only their native presentation container changes.
    for (UIView *child in self.reactSubviews) {
        [self.contentController.view addSubview:child];
    }
    [self tryPresent];
}

- (void)removeReactSubview:(UIView *)subview {
    [super removeReactSubview:subview];
    [subview removeFromSuperview];
}

- (void)setRequestId:(NSString *)requestId {
    _requestId = [requestId copy];
    [self tryPresent];
}

- (void)tryPresent {
    if (self.presentationStarted || !self.requestId || self.reactSubviews.count == 0) return;
    self.presentationStarted = YES;
    // No self.window check: the original React root can be detached by a fullscreen paywall.
    if (![self.adapter attachHost:self requestID:self.requestId] && self.onFailure) {
        self.onFailure(@{@"requestId": self.requestId, @"message": @"No active presentation context"});
    }
}

- (void)presentFrom:(UIViewController *)controller {
    id touchHandler;
#if __has_include(<React/RCTSurfaceTouchHandler.h>)
    // Legacy view-manager interop can compile .m files without RCT_NEW_ARCH_ENABLED.
    // Detect the mounted Fabric children, rather than selecting the wrong touch pipeline.
    if ([self.reactSubviews.firstObject respondsToSelector:NSSelectorFromString(@"touchEventEmitterAtPoint:")]) {
        touchHandler = [RCTSurfaceTouchHandler new];
    } else
#endif
    {
        touchHandler = [[RCTTouchHandler alloc] initWithBridge:self.bridge];
    }
    [touchHandler attachToView:self.contentController.view];
    self.contentTouchHandler = touchHandler;
    __weak typeof(self) weakSelf = self;
    [controller presentViewController:self.contentController animated:NO completion:^{
        CheckpointErrorHostView *host = weakSelf;
        if (!host || host.closing) return;
        NSLog(@"[CheckpointHost native] shown requestId=%@ window=%@", host.requestId,
              host.contentController.view.window ? @"attached" : @"nil");
        if (host.onShow) host.onShow(@{@"requestId": host.requestId});
        UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, host.contentController.view);
    }];
}

- (void)dismissWithCompletion:(void (^)(void))completion {
    if (self.closing) return;
    self.closing = YES;
    self.finishDismissal = completion;
    // UIKit retains this completion until dismissal finishes, even if React unmounts meanwhile.
    CheckpointErrorHostView *host = self;
    void (^finished)(void) = ^{
        NSLog(@"[CheckpointHost native] dismissed requestId=%@", host.requestId);
        // Notify JS only after the native dismissal, then release the SDK completion.
        if (host.onDismiss) host.onDismiss(@{@"requestId": host.requestId});
        dispatch_block_t finish = host.finishDismissal;
        host.finishDismissal = nil;
        if (finish) finish();
    };
    if (self.contentController.presentingViewController) {
        [self.contentController dismissViewControllerAnimated:NO completion:finished];
    } else {
        finished();
    }
}

- (void)invalidate {
    [self dismissWithCompletion:^{}];
}

- (void)dealloc {
    // React can remove this native view when its root unmounts.
    [_contentController dismissViewControllerAnimated:NO completion:nil];
}
@end

@interface CheckpointErrorHostViewManager : RCTViewManager
@end

@implementation CheckpointErrorHostViewManager
RCT_EXPORT_MODULE(CheckpointErrorHostForTest)
RCT_EXPORT_VIEW_PROPERTY(requestId, NSString)
RCT_EXPORT_VIEW_PROPERTY(onShow, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onFailure, RCTDirectEventBlock)

+ (BOOL)requiresMainQueueSetup { return YES; }

- (UIView *)view {
    if (@available(iOS 15.0, *)) {
        CheckpointErrorHostView *view = [CheckpointErrorHostView new];
        RNPaywalls *module = [self.bridge moduleForClass:RNPaywalls.class];
        view.adapter = [module checkpointAdapter];
        view.bridge = self.bridge;
        return view;
    }
    return [UIView new];
}
@end
