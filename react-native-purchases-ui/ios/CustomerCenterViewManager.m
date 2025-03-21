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
        CustomerCenterUIViewController *viewController = [self.proxy createCustomerCenterViewController];
        CustomerCenterViewWrapper *wrapper = [[CustomerCenterViewWrapper alloc] initWithCustomerCenterViewController: viewController];
        self.proxy.delegate = wrapper;
        
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
    return YES; // Ensure it's initialized on the main queue
}

@end
