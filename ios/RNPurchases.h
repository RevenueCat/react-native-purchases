
#if __has_include("RCTEventEmitter.h")
#import "RCTEventEmitter.h"
#else
#import <React/RCTEventEmitter.h>
#endif

#import <Purchases/RCPurchases.h>

@interface RNPurchases : RCTEventEmitter <RCTBridgeModule>

@end
