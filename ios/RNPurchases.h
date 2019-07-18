//
//  Created by RevenueCat.
//  Copyright © 2019 RevenueCat. All rights reserved.
//

#if __has_include("RCTEventEmitter.h")
#import "RCTEventEmitter.h"
#else
#import <React/RCTEventEmitter.h>
#endif

#import <Purchases/RCPurchases.h>

@interface RNPurchases : RCTEventEmitter <RCTBridgeModule>

@end
