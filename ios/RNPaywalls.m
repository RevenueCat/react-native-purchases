
//
//  Created by RevenueCat.
//  Copyright © 2023 RevenueCat. All rights reserved.
//

#import "RNPaywalls.h"

@implementation RNPaywalls

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(presentPaywall) {
    if (@available(iOS 15.0, *)) {
        [PaywallProxy presentPaywall];
    } else {
        // TODO: log
    }
}

RCT_EXPORT_METHOD(presentPaywallIfNeeded:(NSString *)requiredEntitlementIdentifier) {
    if (@available(iOS 15.0, *)) {
        [PaywallProxy presentPaywallIfNeededWithRequiredEntitlementIdentifier:requiredEntitlementIdentifier];
    } else {
        // TODO: log
    }
}

@end
