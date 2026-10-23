#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RCPaywallPortalView, PaywallPortalViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onAnchored, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onHostDismissed, RCTDirectEventBlock)

@end
