//
//  Created by RNPaywalls.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import <React/RCTEventEmitter.h>

static NSString *const safeAreaInsetsDidChangeEvent = @"safeAreaInsetsDidChange";

// PaywallListener event names
static NSString *const onPurchaseStartedEvent = @"onPurchaseStarted";
static NSString *const onPurchaseCompletedEvent = @"onPurchaseCompleted";
static NSString *const onPurchaseErrorEvent = @"onPurchaseError";
static NSString *const onPurchaseCancelledEvent = @"onPurchaseCancelled";
static NSString *const onRestoreStartedEvent = @"onRestoreStarted";
static NSString *const onRestoreCompletedEvent = @"onRestoreCompleted";
static NSString *const onRestoreErrorEvent = @"onRestoreError";
static NSString *const onPurchaseInitiatedEvent = @"onPurchaseInitiated";

// PurchaseLogic event names
static NSString *const onPerformPurchaseRequestEvent = @"onPerformPurchaseRequest";
static NSString *const onPerformRestoreRequestEvent = @"onPerformRestoreRequest";

@interface RNPaywalls : RCTEventEmitter <RCTBridgeModule>

@end
