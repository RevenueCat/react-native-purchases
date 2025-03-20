//
//  RNCustomerCenter.m
//  Copyright © 2023 RevenueCat. All rights reserved.
//
//  Created by Facundo Menzella on 19/2/25.
//

#import "RNCustomerCenter.h"

@import PurchasesHybridCommonUI;
@import RevenueCat;

@interface RNCustomerCenter () <RCCustomerCenterViewControllerDelegateWrapper>

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
        [(CustomerCenterProxy *)self.customerCenterProxy setDelegate:self];
    } else {
        self.customerCenterProxy = nil;
    }
}

// MARK: -

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"onRestoreStarted",
        @"onRestoreCompleted",
        @"onRestoreFailed",
        @"onShowingManageSubscriptions",
        @"onRefundRequestStarted",
        @"onRefundRequestCompleted",
        @"onFeedbackSurveyCompleted",
        @"onManagementOptionSelected",
        @"onDismiss"
    ];
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
            [_customerCenterProxy presentWithResultHandler:^{
                resolve(nil);
            }];
        } else {
            reject(@"CUSTOMER_CENTER_ERROR", @"Failed to initialize Customer Center Proxy", nil);
        }
    } else {
        [self rejectCustomerCenterUnsupportedError:reject];
    }
}

- (void)rejectCustomerCenterUnsupportedError:(RCTPromiseRejectBlock)reject {
    NSLog(@"Error: attempted to present Customer Center on unsupported iOS version.");
    reject(@"CustomerCenterUnsupportedCode", @"CustomerCenter is not supported prior to iOS 15.", nil);
}

// MARK: - CustomerCenterViewControllerDelegateWrapper Methods

- (void)customerCenterViewControllerWasDismissed:(CustomerCenterUIViewController *)controller API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onDismiss" body:@{}];
}

- (void)customerCenterViewControllerDidStartRestore:(CustomerCenterUIViewController *)controller API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onRestoreStarted" body:@{}];
}

- (void)customerCenterViewController:(CustomerCenterUIViewController *)controller
         didFinishRestoringWithCustomerInfoDictionary:(NSDictionary<NSString *, id> *)customerInfoDictionary API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onRestoreCompleted" body:@{@"customerInfo": customerInfoDictionary}];
}

- (void)customerCenterViewController:(CustomerCenterUIViewController *)controller
              didFailRestoringWithErrorDictionary:(NSDictionary<NSString *, id> *)errorDictionary API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onRestoreFailed" body:@{@"error": errorDictionary}];
}

- (void)customerCenterViewControllerDidShowManageSubscriptions:(CustomerCenterUIViewController *)controller API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onShowingManageSubscriptions" body:@{}];
}

- (void)customerCenterViewController:(CustomerCenterUIViewController *)controller
didStartRefundRequestForProductWithID:(NSString *)productID API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onRefundRequestStarted" body:@{@"productIdentifier": productID}];
}

- (void)customerCenterViewController:(CustomerCenterUIViewController *)controller
didCompleteRefundRequestForProductWithID:(NSString *)productID
                          withStatus:(NSString *)status API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onRefundRequestCompleted" body:@{
        @"productIdentifier": productID,
        @"refundRequestStatus": status
    }];
}

- (void)customerCenterViewController:(CustomerCenterUIViewController *)controller
didCompleteFeedbackSurveyWithOptionID:(NSString *)optionID API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onFeedbackSurveyCompleted" body:@{@"feedbackSurveyOptionId": optionID}];
}

- (void)customerCenterViewController:(CustomerCenterUIViewController *)controller
didSelectCustomerCenterManagementOption:(NSString *)optionID
withURL:(NSString *)url API_AVAILABLE(ios(15.0)) {
    [self sendEventWithName:@"onManagementOptionSelected" body:@{@"option": optionID, @"url": url ?: [NSNull null]}];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
