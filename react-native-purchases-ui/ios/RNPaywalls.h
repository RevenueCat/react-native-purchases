//
//  Created by RNPaywalls.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import <React/RCTEventEmitter.h>

@import PurchasesHybridCommonUI;

static NSString *const safeAreaInsetsDidChangeEvent = @"safeAreaInsetsDidChange";

@class CheckpointTestAdapter;

@interface RNPaywalls : RCTEventEmitter <RCTBridgeModule>

// Prototype-only access for the native error host view manager.
- (CheckpointTestAdapter *)checkpointAdapter API_AVAILABLE(ios(15.0));

@end
