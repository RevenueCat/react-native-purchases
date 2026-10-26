#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNCheckpoints, RCTEventEmitter)

RCT_EXTERN_METHOD(checkpoint:(NSString *)identifier
                  customVariables:(NSDictionary *)customVariables
                  presentationMode:(NSString *)presentationMode
                  callId:(NSString *)callId)
RCT_EXTERN_METHOD(setErrorPresenterEnabled:(BOOL)enabled)
RCT_EXTERN_METHOD(completeErrorPresentation:(NSString *)requestId)
RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeListeners:(double)count)

@end
