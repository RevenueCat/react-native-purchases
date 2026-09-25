//
//  RNPaywallEventForwarder.h
//  RNPaywalls
//
//  Copyright © 2026 RevenueCat. All rights reserved.
//

#import <Foundation/Foundation.h>

@import PurchasesHybridCommonUI;

NS_ASSUME_NONNULL_BEGIN

typedef void (^RNPaywallEventEmitter)(NSString *eventName, NSDictionary * _Nullable body);

@interface RNPaywallEventForwarder : NSObject <RCPaywallViewControllerDelegateWrapper>

/// When `jsResumesPurchase` returns NO the purchase is resumed natively instead of emitted.
- (instancetype)initWithEmitter:(RNPaywallEventEmitter)emitter
      jsResumesPurchase:(BOOL (^)(void))jsResumesPurchase;

- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
