#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNCheckpoints, RCTEventEmitter)

RCT_EXTERN_METHOD(checkpoint:(NSString *)identifier
                  customVariables:(NSDictionary *)customVariables
                  presentationMode:(NSString *)presentationMode
                  callId:(NSString *)callId)
#if RC_CHECKPOINT_EMBED_ENABLED
// Experimental: only exported when built against a local purchases-ios with the embedded checkpoint SPI.
RCT_EXTERN_METHOD(checkpointEmbedded:(NSString *)identifier
                  customVariables:(NSDictionary *)customVariables
                  callId:(NSString *)callId)
RCT_EXTERN_METHOD(cancelEmbedded:(NSString *)callId)
RCT_EXTERN_METHOD(completeEmbeddedError:(NSString *)callId
                  requestId:(NSString *)requestId)
#endif
RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeListeners:(double)count)

@end
