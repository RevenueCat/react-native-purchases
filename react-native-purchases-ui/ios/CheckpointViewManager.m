#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RCCheckpointView, CheckpointViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(sessionId, NSString)
RCT_EXPORT_VIEW_PROPERTY(onAttached, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAttachmentFailed, RCTDirectEventBlock)
@end
