//
//  CustomerCenterViewManager.m
//

#import "CustomerCenterViewManager.h"
#import "CustomerCenterViewWrapper.h"

@import RevenueCatUI;

API_AVAILABLE(ios(15.0))
@interface CustomerCenterViewManager ()

@property (nonatomic, strong) id proxyIfAvailable;

@end


@implementation CustomerCenterViewManager

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onCustomActionSelected, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreStarted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreCompleted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRestoreFailed, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onShowingManageSubscriptions, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRefundRequestStarted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRefundRequestCompleted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onFeedbackSurveyCompleted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onManagementOptionSelected, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(shouldShowCloseButton, BOOL)
RCT_EXPORT_MODULE(CustomerCenterView)

- (instancetype)init {
    if ((self = [super init])) {
        if (@available(iOS 15.0, *)) {
            _proxyIfAvailable = [[CustomerCenterProxy alloc] init];
        }
    }

    return self;
}

- (UIView *)view {
    if (@available(iOS 15.0, *)) {
        CustomerCenterUIViewController *viewController = [[CustomerCenterUIViewController alloc] init];
        
        // Create a placeholder block that we'll update after wrapper creation
        __block CustomerCenterViewWrapper *wrapper = nil;
        
        // Set onCloseHandler - always provide handler regardless of shouldShowCloseButton
        // The close button visibility is controlled by shouldShowCloseButton property,
        // but when the button IS shown, it needs this handler to function properly
        viewController.onCloseHandler = ^{
            if (wrapper && wrapper.onDismiss) {
                wrapper.onDismiss(nil);
            }
        };
        
        wrapper = [[CustomerCenterViewWrapper alloc] initWithCustomerCenterViewController: viewController];
        viewController.delegate = wrapper;
        
        return wrapper;
    } else {
        NSLog(@"Error: Customer Center is not supported on iOS versions lower than 15.");
        return [[UIView alloc] init]; // Return an empty view for unsupported versions
    }
}

- (CustomerCenterProxy *)proxy API_AVAILABLE(ios(15.0)){
    return (CustomerCenterProxy *)self.proxyIfAvailable;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
