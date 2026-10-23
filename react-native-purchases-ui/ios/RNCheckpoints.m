#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNCheckpoints, RCTEventEmitter)
RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeListeners:(double)count)
RCT_EXTERN_METHOD(start:(NSString *)sessionId identifier:(NSString *)identifier
                  customVariables:(NSDictionary *)customVariables presentationMode:(NSString *)presentationMode)
RCT_EXTERN_METHOD(didPresent:(NSString *)sessionId)
RCT_EXTERN_METHOD(didFailToPresent:(NSString *)sessionId)
RCT_EXTERN_METHOD(didDismiss:(NSString *)sessionId)
RCT_EXTERN_METHOD(cancel:(NSString *)sessionId)
RCT_EXTERN_METHOD(completeError:(NSString *)sessionId requestId:(NSString *)requestId)
RCT_EXTERN_METHOD(releaseSession:(NSString *)sessionId)
@end
