
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <Purchases/RCPurchases.h>

@interface RNPurchases : NSObject <RCTBridgeModule>

@end
