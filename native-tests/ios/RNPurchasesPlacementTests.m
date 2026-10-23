#import <XCTest/XCTest.h>
#import <OCMock/OCMock.h>
#import <RNPurchases/RNPurchases.h>

@interface RNPurchases (PlacementTesting)
- (void)getCurrentOfferingForPlacement:(NSString *)placementIdentifier
                              resolve:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject;
@end

@interface RNPurchasesPlacementTests : XCTestCase
@property (nonatomic, strong) RNPurchases *purchases;
@property (nonatomic, strong) id commonFunctionalityMock;
@property (nonatomic, copy) NSDictionary *offering;
@property (nonatomic, strong) RCErrorContainer *error;
@end

@implementation RNPurchasesPlacementTests

- (void)setUp {
    [super setUp];
    self.purchases = [RNPurchases new];
    self.commonFunctionalityMock = OCMClassMock([RCCommonFunctionality class]);
    __weak typeof(self) weakSelf = self;
    OCMStub([self.commonFunctionalityMock getCurrentOfferingForPlacement:@"onboarding"
                                                       completionBlock:[OCMArg any]])
        .andDo(^(NSInvocation *invocation) {
            __unsafe_unretained void (^completion)(NSDictionary *, RCErrorContainer *);
            [invocation getArgument:&completion atIndex:3];
            completion(weakSelf.offering, weakSelf.error);
        });
}

- (void)tearDown {
    [self.commonFunctionalityMock stopMocking];
    self.commonFunctionalityMock = nil;
    self.purchases = nil;
    self.offering = nil;
    self.error = nil;
    [super tearDown];
}

- (void)assertRejectsErrorWithCode:(NSInteger)code {
    NSError *underlyingError = [NSError errorWithDomain:NSURLErrorDomain
                                                  code:NSURLErrorCannotConnectToHost
                                              userInfo:@{NSLocalizedDescriptionKey: @"Connection refused"}];
    NSError *nativeError = [NSError errorWithDomain:@"RCPurchasesErrorDomain"
                                             code:code
                                         userInfo:@{NSLocalizedDescriptionKey: @"Request failed",
                                                    NSUnderlyingErrorKey: underlyingError}];
    self.error = [[RCErrorContainer alloc] initWithError:nativeError extraPayload:@{@"detail": @"native context"}];
    __block NSUInteger resolveCalls = 0;
    __block NSUInteger rejectCalls = 0;

    [self.purchases getCurrentOfferingForPlacement:@"onboarding" resolve:^(id value) {
        resolveCalls++;
    } reject:^(NSString *actualCode, NSString *message, NSError *error) {
        rejectCalls++;
        XCTAssertEqualObjects(actualCode, [@(code) stringValue]);
        XCTAssertEqualObjects(message, nativeError.localizedDescription);
        XCTAssertEqualObjects(error.domain, nativeError.domain);
        XCTAssertEqual(error.code, nativeError.code);
        XCTAssertEqualObjects(error.userInfo[NSUnderlyingErrorKey], underlyingError);
        XCTAssertEqualObjects(error.userInfo[@"detail"], @"native context");
    }];

    XCTAssertEqual(resolveCalls, 0u);
    XCTAssertEqual(rejectCalls, 1u);
    OCMVerify([self.commonFunctionalityMock getCurrentOfferingForPlacement:@"onboarding"
                                                         completionBlock:[OCMArg any]]);
}

- (void)testRejectsNetworkError {
    [self assertRejectsErrorWithCode:RCNetworkError];
}

- (void)assertResolvesOffering:(NSDictionary *)offering {
    self.offering = offering;
    __block NSUInteger resolveCalls = 0;
    __block NSUInteger rejectCalls = 0;

    [self.purchases getCurrentOfferingForPlacement:@"onboarding" resolve:^(id value) {
        resolveCalls++;
        XCTAssertEqualObjects(value, offering);
    } reject:^(NSString *code, NSString *message, NSError *error) {
        rejectCalls++;
    }];

    XCTAssertEqual(resolveCalls, 1u);
    XCTAssertEqual(rejectCalls, 0u);
    OCMVerify([self.commonFunctionalityMock getCurrentOfferingForPlacement:@"onboarding"
                                                         completionBlock:[OCMArg any]]);
}

- (void)testResolvesOffering {
    [self assertResolvesOffering:@{@"identifier": @"default", @"availablePackages": @[]}];
}

- (void)testResolvesAbsentOffering {
    [self assertResolvesOffering:nil];
}

- (void)testResolvesEmptyOfferingDictionary {
    [self assertResolvesOffering:@{}];
}

@end
