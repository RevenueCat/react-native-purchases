//
//  RNCheckpoints.m
//  Copyright © 2026 RevenueCat. All rights reserved.
//

#import "RNCheckpoints.h"

#import <os/lock.h>

@import PurchasesHybridCommonUI;

@implementation RNCheckpoints {
    os_unfair_lock _invalidationLock;
    BOOL _didInvalidate;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
    if ((self = [super init])) {
        _invalidationLock = OS_UNFAIR_LOCK_INIT;
    }
    return self;
}

- (instancetype)initWithDisabledObservation {
    if ((self = [super initWithDisabledObservation])) {
        _invalidationLock = OS_UNFAIR_LOCK_INIT;
    }
    return self;
}

- (BOOL)invalidated {
    os_unfair_lock_lock(&_invalidationLock);
    BOOL invalidated = _didInvalidate;
    os_unfair_lock_unlock(&_invalidationLock);
    return invalidated;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"Checkpoints-onPassed", @"Checkpoints-onError", @"Checkpoints-onErrorDialogRequested", @"Checkpoints-onPaywallPresentation"];
}

// Required for RN 0.79+ NativeEventEmitter (JavaScript class) support.
// RCT_EXPORT_METHOD must re-export these explicitly; parent class methods are not visible to JS.
// See: https://github.com/RevenueCat/react-native-purchases/issues/1298
RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
    [super addListener:eventName];
}

RCT_EXPORT_METHOD(removeListeners:(double)count) {
    [super removeListeners:count];
}

RCT_EXPORT_METHOD(checkpoint:(NSString *)identifier
                  customVariables:(NSDictionary *)customVariables
                  presentationMode:(NSString *)presentationMode
                  callId:(NSString *)callId
                  hasErrorDialogFactory:(BOOL)hasErrorDialogFactory
                  useCustomPresenter:(BOOL)useCustomPresenter) {
    if (self.invalidated) {
        return;
    }
    __weak RNCheckpoints *weakSelf = self;
    void (^onPassed)(NSDictionary<NSString *, id> *) = ^(NSDictionary<NSString *, id> *result) {
        RNCheckpoints *strongSelf = weakSelf;
        if (strongSelf == nil || strongSelf.invalidated) {
            return;
        }
        [strongSelf sendEventWithName:@"Checkpoints-onPassed" body:@{@"callId": callId, @"result": result}];
    };
    // PurchasesHybridCommonUI already logs why the checkpoint could not start.
    void (^onError)(NSString *, NSString *) = ^(NSString *code, NSString *message) {
        RNCheckpoints *strongSelf = weakSelf;
        if (strongSelf == nil || strongSelf.invalidated) {
            return;
        }
        [strongSelf sendEventWithName:@"Checkpoints-onError" body:@{@"callId": callId}];
    };
    void (^onPaywallPresentationRequested)(NSString *, NSDictionary<NSString *, id> *) = nil;
    if (useCustomPresenter) {
        onPaywallPresentationRequested = ^(NSString *requestId, NSDictionary<NSString *, id> *params) {
            RNCheckpoints *strongSelf = weakSelf;
            if (strongSelf == nil || strongSelf.invalidated) {
                if (@available(iOS 15.0, *)) {
                    [CheckpointProxy completePaywallPresentationWithRequestId:requestId result:@"NAVIGATED_BACK"];
                }
                return;
            }
            [strongSelf sendEventWithName:@"Checkpoints-onPaywallPresentation"
                                     body:@{@"callId": callId, @"requestId": requestId, @"params": params}];
        };
    }
    void (^onErrorDialogRequested)(NSString *, NSDictionary<NSString *, id> *) = nil;
    if (hasErrorDialogFactory) {
        onErrorDialogRequested = ^(NSString *requestId, NSDictionary<NSString *, id> *error) {
            RNCheckpoints *strongSelf = weakSelf;
            if (strongSelf == nil || strongSelf.invalidated) {
                [CheckpointProxy resolveErrorDialogWithRequestId:requestId outcome:@{@"type": @"useDefault"}];
                return;
            }
            [strongSelf sendEventWithName:@"Checkpoints-onErrorDialogRequested"
                                     body:@{@"callId": callId, @"requestId": requestId, @"error": error}];
        };
    }
    [CheckpointProxy presentWithIdentifier:identifier
                                    callId:callId
                           customVariables:customVariables
                          presentationMode:presentationMode
                                  onPassed:onPassed
                                   onError:onError
            onPaywallPresentationRequested:onPaywallPresentationRequested
                    onErrorDialogRequested:onErrorDialogRequested];
}

RCT_EXPORT_METHOD(resolveErrorDialog:(NSString *)requestId
                  outcome:(NSDictionary *)outcome) {
    if (@available(iOS 15.0, *)) {
        [CheckpointProxy resolveErrorDialogWithRequestId:requestId outcome:outcome];
    }
}

RCT_EXPORT_METHOD(detachPaywallPresenter:(NSString *)callId activeRequestId:(NSString *)activeRequestId) {
    if (@available(iOS 15.0, *)) {
        [CheckpointProxy detachCheckpointWithCallId:callId activePaywallRequestId:activeRequestId];
    }
}

RCT_EXPORT_METHOD(detachErrorDialogFactory:(NSString *)callId) {
    [CheckpointProxy cancelErrorDialogsWithCallId:callId];
}

RCT_EXPORT_METHOD(completePaywallPresentation:(NSString *)requestId result:(NSString *)result) {
    if (@available(iOS 15.0, *)) {
        [CheckpointProxy completePaywallPresentationWithRequestId:requestId
                                                        result:self.invalidated ? @"NAVIGATED_BACK" : result];
    }
}

- (void)invalidate {
    // Native UI can outlive a JS reload. Stop events immediately, even when teardown
    // starts off the main queue.
    os_unfair_lock_lock(&_invalidationLock);
    _didInvalidate = YES;
    os_unfair_lock_unlock(&_invalidationLock);
    // Nothing will answer pending presentation requests after a reload.
    dispatch_async(dispatch_get_main_queue(), ^{
        if (@available(iOS 15.0, *)) {
            [CheckpointProxy invalidateCheckpointPresentations];
        } else {
            [CheckpointProxy cancelErrorDialogsWithCallId:nil];
        }
    });
    [super invalidate];
}

@end
