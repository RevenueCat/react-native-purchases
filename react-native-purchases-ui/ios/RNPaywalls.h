//
//  Created by RNPaywalls.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import <React/RCTEventEmitter.h>

@import PurchasesHybridCommonUI;

static NSString *const safeAreaInsetsDidChangeEvent = @"safeAreaInsetsDidChange";

@interface RNPaywalls : RCTEventEmitter <RCTBridgeModule>

@end
