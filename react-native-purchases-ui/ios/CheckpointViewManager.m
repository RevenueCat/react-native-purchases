#import "CheckpointViewManager.h"
#import "RNCheckpoints.h"
#import <React/RCTBridge.h>
#import <React/UIView+React.h>
#import "UIView+Extensions.h"

@interface RCCheckpointView : UIView
@property (nonatomic, copy) NSString *sessionId;
@property (nonatomic, copy) RCTDirectEventBlock onAttached;
@property (nonatomic, copy) RCTDirectEventBlock onAttachmentFailed;
@property (nonatomic, weak) RCTBridge *bridge;
@property (nonatomic, strong) UIViewController *controller;
@property (nonatomic) BOOL attemptedAttachment;
@end

@implementation RCCheckpointView
- (void)setSessionId:(NSString *)sessionId {
    if ([_sessionId isEqualToString:sessionId]) return;
    // A mounted host view belongs to exactly one session.
    if (_sessionId) { if (self.onAttachmentFailed) self.onAttachmentFailed(@{}); return; }
    _sessionId = [sessionId copy];
    [self setNeedsLayout];
}
- (void)layoutSubviews {
    [super layoutSubviews];
    if (self.attemptedAttachment || !self.sessionId || !self.window || !self.onAttached || !self.onAttachmentFailed) return;
    UIViewController *parent = self.parentViewController;
    if (!parent) { self.attemptedAttachment = YES; self.onAttachmentFailed(@{}); return; }
    self.attemptedAttachment = YES;
    RNCheckpoints *module = [self.bridge moduleForClass:[RNCheckpoints class]];
    UIViewController *controller = [module controllerForSessionId:self.sessionId];
    if (!controller || controller.parentViewController || controller.viewIfLoaded.superview) {
        self.onAttachmentFailed(@{});
        return;
    }
    self.controller = controller;
    // Keep the native checkpoint controller and its existing delegate intact.
    [parent addChildViewController:controller];
    controller.view.translatesAutoresizingMaskIntoConstraints = NO;
    [self addSubview:controller.view];
    [NSLayoutConstraint activateConstraints:@[
        [controller.view.topAnchor constraintEqualToAnchor:self.topAnchor],
        [controller.view.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
        [controller.view.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
        [controller.view.trailingAnchor constraintEqualToAnchor:self.trailingAnchor]
    ]];
    [controller didMoveToParentViewController:parent];
    self.onAttached(@{});
}
- (void)didMoveToWindow {
    [super didMoveToWindow];
    if (self.window) [self setNeedsLayout];
    // Temporary window detachment is not final checkpoint dismissal.
}
- (void)dealloc {
    UIViewController *controller = _controller;
    if (controller.parentViewController) [controller willMoveToParentViewController:nil];
    [controller.viewIfLoaded removeFromSuperview];
    [controller removeFromParentViewController];
}
@end

@implementation CheckpointViewManager
RCT_EXPORT_MODULE(RCCheckpointView)
RCT_EXPORT_VIEW_PROPERTY(sessionId, NSString)
RCT_EXPORT_VIEW_PROPERTY(onAttached, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAttachmentFailed, RCTDirectEventBlock)
+ (BOOL)requiresMainQueueSetup { return YES; }
- (UIView *)view {
    RCCheckpointView *view = [RCCheckpointView new];
    view.bridge = self.bridge;
    return view;
}
@end
