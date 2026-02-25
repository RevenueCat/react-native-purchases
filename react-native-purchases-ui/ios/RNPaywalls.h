//
//  Created by RNPaywalls.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import <React/RCTEventEmitter.h>

static NSString *const safeAreaInsetsDidChangeEvent = @"safeAreaInsetsDidChange";

// PurchaseLogic event names
static NSString *const onPerformPurchaseRequestEvent = @"onPerformPurchaseRequest";
static NSString *const onPerformRestoreRequestEvent = @"onPerformRestoreRequest";

@interface RNPaywalls : RCTEventEmitter <RCTBridgeModule>

@end
