//
//  CustomerCenterViewManager.m
//

#import "CustomerCenterViewManager.h"
#import "CustomerCenterViewWrapper.h"

@import RevenueCatUI;

@implementation CustomerCenterViewManager

RCT_EXPORT_MODULE(CustomerCenterView)

- (UIView *)view {
    if (@available(iOS 15.0, *)) {
        CustomerCenterUIViewController *customerCenterVC = [[CustomerCenterUIViewController alloc] init];
        CustomerCenterViewWrapper *wrapper = [[CustomerCenterViewWrapper alloc] initWithCustomerCenterViewController:customerCenterVC];

        return wrapper;
    } else {
        NSLog(@"Error: Customer Center is not supported on iOS versions lower than 15.");
        return [[UIView alloc] init]; // Return an empty view for unsupported versions
    }
}

+ (BOOL)requiresMainQueueSetup {
    return YES; // Ensure it's initialized on the main queue
}

@end
