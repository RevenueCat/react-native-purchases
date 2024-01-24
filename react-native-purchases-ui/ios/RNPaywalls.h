//
//  Created by RNPaywalls.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import <React/RCTEventEmitter.h>

static NSString *const safeAreaInsetsDidChangeEvent = @"safeAreaInsetsDidChange";

@interface RNPaywalls : RCTEventEmitter <RCTBridgeModule>

@end
