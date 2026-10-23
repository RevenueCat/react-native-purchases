#import "RNCheckpoints.h"
#import <TargetConditionals.h>
@import PurchasesHybridCommonUI;

@interface RNCheckpoints ()
@property (nonatomic, strong) id checkpointProxy;
@property (atomic) BOOL invalidated;
@end

@implementation RNCheckpoints
RCT_EXPORT_MODULE();

- (instancetype)init {
    if ((self = [super init])) [self initializeCheckpoints];
    return self;
}

- (instancetype)initWithDisabledObservation {
    if ((self = [super initWithDisabledObservation])) [self initializeCheckpoints];
    return self;
}

- (void)initializeCheckpoints {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) {
        __weak RNCheckpoints *weakSelf = self;
        self.checkpointProxy = [[CheckpointProxy alloc] initOnEvent:^(NSDictionary<NSString *, id> *event) {
            RNCheckpoints *module = weakSelf;
            if (module && !module.invalidated) [module sendEventWithName:@"Checkpoints-event" body:event];
        }];
    }
#endif
}

+ (BOOL)requiresMainQueueSetup { return YES; }
- (dispatch_queue_t)methodQueue { return dispatch_get_main_queue(); }
- (NSArray<NSString *> *)supportedEvents { return @[@"Checkpoints-event"]; }
- (NSDictionary *)constantsToExport { return @{@"isSupported": @(self.checkpointProxy != nil)}; }
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) { [super addListener:eventName]; }
RCT_EXPORT_METHOD(removeListeners:(double)count) { [super removeListeners:count]; }

RCT_EXPORT_METHOD(start:(NSString *)sessionId identifier:(NSString *)identifier
                  customVariables:(NSDictionary *)customVariables presentationMode:(NSString *)presentationMode) {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) {
        [(CheckpointProxy *)self.checkpointProxy startWithSessionId:sessionId identifier:identifier
            customVariables:customVariables presentationMode:presentationMode];
    }
#endif
}

- (UIViewController *)controllerForSessionId:(NSString *)sessionId {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) {
        return [(CheckpointProxy *)self.checkpointProxy controllerWithSessionId:sessionId];
    }
#endif
    return nil;
}

RCT_EXPORT_METHOD(didPresent:(NSString *)sessionId) {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) [(CheckpointProxy *)self.checkpointProxy didPresentWithSessionId:sessionId];
#endif
}
RCT_EXPORT_METHOD(didFailToPresent:(NSString *)sessionId) {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) [(CheckpointProxy *)self.checkpointProxy didFailToPresentWithSessionId:sessionId];
#endif
}
RCT_EXPORT_METHOD(didDismiss:(NSString *)sessionId) {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) [(CheckpointProxy *)self.checkpointProxy didDismissWithSessionId:sessionId];
#endif
}
RCT_EXPORT_METHOD(cancel:(NSString *)sessionId) {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) [(CheckpointProxy *)self.checkpointProxy cancelWithSessionId:sessionId];
#endif
}
RCT_EXPORT_METHOD(completeError:(NSString *)sessionId requestId:(NSString *)requestId) {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) [(CheckpointProxy *)self.checkpointProxy completeErrorWithSessionId:sessionId requestId:requestId];
#endif
}

// Host teardown cannot receive Modal.onDismiss. Detach before releasing only its own session.
RCT_EXPORT_METHOD(releaseSession:(NSString *)sessionId) {
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 15.0, *)) {
        CheckpointProxy *proxy = self.checkpointProxy;
        UIViewController *controller = [proxy controllerWithSessionId:sessionId];
        if (controller.parentViewController) [controller willMoveToParentViewController:nil];
        [controller.viewIfLoaded removeFromSuperview];
        [controller removeFromParentViewController];
        [proxy cancelWithSessionId:sessionId];
        [proxy didDismissWithSessionId:sessionId];
    }
#endif
}

- (void)invalidate {
    self.invalidated = YES;
    // Bridge invalidation may arrive off the method queue, after JS has already disappeared.
    void (^cleanup)(void) = ^{
        id proxy = self.checkpointProxy;
        self.checkpointProxy = nil;
#if RC_CHECKPOINT_HOST_ENABLED && TARGET_OS_IOS && !TARGET_OS_MACCATALYST
        if (@available(iOS 15.0, *)) [(CheckpointProxy *)proxy invalidate];
#endif
    };
    if ([NSThread isMainThread]) cleanup(); else dispatch_async(dispatch_get_main_queue(), cleanup);
    [super invalidate];
}
@end
