#import <React/RCTEventEmitter.h>
#import <UIKit/UIKit.h>

@interface RNCheckpoints : RCTEventEmitter <RCTBridgeModule>
- (UIViewController * _Nullable)controllerForSessionId:(NSString * _Nonnull)sessionId;
@end
