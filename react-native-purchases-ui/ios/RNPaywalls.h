//
//  Created by RNPaywalls.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import <React/RCTEventEmitter.h>

@import PurchasesHybridCommon;
@import RevenueCat;

static NSString *const safeAreaInsetsDidChangeEvent = @"safeAreaInsetsDidChange";

@interface RNPaywalls : RCTEventEmitter <RCTBridgeModule>

@end
