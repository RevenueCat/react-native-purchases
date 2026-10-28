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
    return @[@"Checkpoints-onPassed"];
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
                  callId:(NSString *)callId) {
    if (self.invalidated) {
        return;
    }
    __weak RNCheckpoints *weakSelf = self;
    [CheckpointProxy presentWithIdentifier:identifier
                           customVariables:customVariables
                          presentationMode:presentationMode
                                  onPassed:^(NSDictionary<NSString *, id> *result) {
        RNCheckpoints *strongSelf = weakSelf;
        if (strongSelf == nil || strongSelf.invalidated) {
            return;
        }
        [strongSelf sendEventWithName:@"Checkpoints-onPassed" body:@{@"callId": callId, @"result": result}];
    }
                                   onError:^(NSString *code, NSString *message) {
        // PurchasesHybridCommonUI already logs why the checkpoint could not start.
    }];
}

- (void)invalidate {
    // Native UI can outlive a JS reload. Stop events immediately, even when teardown
    // starts off the main queue.
    os_unfair_lock_lock(&_invalidationLock);
    _didInvalidate = YES;
    os_unfair_lock_unlock(&_invalidationLock);
    [super invalidate];
}

@end
