//
//  RNCustomerCenter.m
//  Copyright © 2023 RevenueCat. All rights reserved.
//
//  Created by Facundo Menzella on 19/2/25.
//

#import "RNCustomerCenter.h"

@import PurchasesHybridCommonUI;
@import RevenueCat;

@interface RNCustomerCenter ()

@property (nonatomic, strong) id customerCenterProxy;

@end

@implementation RNCustomerCenter

RCT_EXPORT_MODULE();

- (instancetype)initWithDisabledObservation
{
    if ((self = [super initWithDisabledObservation])) {
        [self initializeCustomerCenter];
    }

    return self;
}

- (instancetype)init
{
    if (([super init])) {
        [self initializeCustomerCenter];
    }
    return self;
}

// `RCTEventEmitter` does not implement designated iniitializers correctly so we have to duplicate the call in both constructors.
- (void)initializeCustomerCenter {
    if (@available(iOS 15.0, *)) {
        self.customerCenterProxy = [CustomerCenterProxy new];
    } else {
        self.customerCenterProxy = nil;
    }
}

// MARK: -

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (CustomerCenterProxy *)customerCenter API_AVAILABLE(ios(15.0)){
    return self.customerCenterProxy;
}

// MARK: -

RCT_EXPORT_METHOD(presentCustomerCenter:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
        if (self.customerCenterProxy) {
            [self.customerCenterProxy present];
            resolve(nil);
        } else {
            reject(@"CUSTOMER_CENTER_ERROR", @"Failed to initialize Customer Center Proxy", nil);
        }
    } else {
        [self rejectPaywallsUnsupportedError:reject];
    }
}

- (void)rejectPaywallsUnsupportedError:(RCTPromiseRejectBlock)reject {
    NSLog(@"Error: attempted to present customer center on unsupported iOS version.");
    reject(@"CustomerCenterUnsupportedCode", @"CustomerCenter is not supported prior to iOS 15.", nil);
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
