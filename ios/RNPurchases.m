
//
//  Created by RevenueCat.
//  Copyright © 2019 RevenueCat. All rights reserved.
//

#import "RNPurchases.h"

@import StoreKit;

typedef void (^PurchaseCompletedBlock)(RCStoreTransaction *, RCCustomerInfo *, NSError *, BOOL);
typedef void (^StartPurchaseBlock)(PurchaseCompletedBlock);

@interface RNPurchases () <RCPurchasesDelegate>

@property (nonatomic, retain) NSMutableArray<StartPurchaseBlock> *defermentBlocks;

@end

@interface NSObject (NSNullMapping)

- (id)mappingNSNullToNil;

@end



NSString *RNPurchasesCustomerInfoUpdatedEvent = @"Purchases-CustomerInfoUpdated";
NSString *RNPurchasesShouldPurchasePromoProductEvent = @"Purchases-ShouldPurchasePromoProduct";
NSString *RNPurchasesLogHandlerEvent = @"Purchases-LogHandlerEvent";


@implementation RNPurchases

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents {
    return @[RNPurchasesCustomerInfoUpdatedEvent,
             RNPurchasesShouldPurchasePromoProductEvent,
             RNPurchasesLogHandlerEvent];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setupPurchases:(NSString *)apiKey
                  appUserID:(nullable NSString *)appUserID
                  purchasesAreCompletedBy:(nullable NSString *)purchasesAreCompletedBy
                  userDefaultsSuiteName:(nullable NSString *)userDefaultsSuiteName
                  storeKitVersion:(nullable NSString *)storeKitVersion
                  useAmazon:(BOOL)useAmazon
                  shouldShowInAppMessagesAutomatically:(BOOL)shouldShowInAppMessagesAutomatically
                  entitlementVerificationMode:(nullable NSString *)entitlementVerificationMode
                  pendingTransactionsForPrepaidPlansEnabled:(BOOL)pendingTransactionsForPrepaidPlansEnabled 
                  diagnosticsEnabled:(BOOL)diagnosticsEnabled) {
    RCPurchases *purchases = [RCPurchases configureWithAPIKey:apiKey.mappingNSNullToNil
                                                    appUserID:appUserID.mappingNSNullToNil
                                      purchasesAreCompletedBy:purchasesAreCompletedBy.mappingNSNullToNil
                                        userDefaultsSuiteName:userDefaultsSuiteName.mappingNSNullToNil
                                               platformFlavor:self.platformFlavor
                                        platformFlavorVersion:self.platformFlavorVersion
                                              storeKitVersion:storeKitVersion.mappingNSNullToNil
                                            dangerousSettings:nil
                         shouldShowInAppMessagesAutomatically:shouldShowInAppMessagesAutomatically
                                             verificationMode:entitlementVerificationMode.mappingNSNullToNil
                                           diagnosticsEnabled:diagnosticsEnabled];
    purchases.delegate = self;
}

RCT_EXPORT_METHOD(setAllowSharingStoreAccount:(BOOL)allowSharingStoreAccount) {
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
    [RCCommonFunctionality setAllowSharingStoreAccount:allowSharingStoreAccount];
#pragma GCC diagnostic pop
}

RCT_REMAP_METHOD(getOfferings,
                 getOfferingsWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality getOfferingsWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve
                                                                                                reject:reject]];
}

RCT_REMAP_METHOD(syncAttributesAndOfferingsIfNeeded,
                 syncAttributesAndOfferingsIfNeededWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality syncAttributesAndOfferingsIfNeededWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve
                                                                                                reject:reject]];
}

RCT_EXPORT_METHOD(getCurrentOfferingForPlacement:(NSString *)placementIdentifier
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {

    [RCCommonFunctionality getCurrentOfferingForPlacement:placementIdentifier.mappingNSNullToNil completionBlock:^(NSDictionary *offeringObject, RCErrorContainer *error) {
        resolve(offeringObject);
    }];
}

//syncAttributesAndOfferingsIfNeeded

RCT_EXPORT_METHOD(getProductInfo:(NSArray *)products
                  type:(NSString *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality getProductInfo:products.mappingNSNullToNil completionBlock:^(NSArray<NSDictionary *> *productObjects) {
        resolve(productObjects);
    }];
}

RCT_REMAP_METHOD(purchaseProduct,
                 purchaseProduct:(NSString *)productIdentifier
                 upgradeInfo:(NSDictionary *)upgradeInfo
                 type:(NSString *)type
                 signedDiscountTimestamp:(NSString *)signedDiscountTimestamp
                 googleInfo:(NSDictionary *)googleInfo
                 presentedOfferingContext:(NSDictionary *)presentedOfferingDictionary
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality purchaseProduct:productIdentifier.mappingNSNullToNil
                   signedDiscountTimestamp:signedDiscountTimestamp.mappingNSNullToNil
                           completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}


RCT_REMAP_METHOD(purchasePackage,
                 purchasePackage:(NSString *)packageIdentifier
                 presentedOfferingContext:(NSDictionary *)presentedOfferingContext
                 upgradeInfo:(NSDictionary *)upgradeInfo
                 signedDiscountTimestamp:(NSString *)signedDiscountTimestamp
                 googleInfo:(NSDictionary *)googleInfo
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality purchasePackage:packageIdentifier.mappingNSNullToNil
                  presentedOfferingContext:presentedOfferingContext.mappingNSNullToNil
                   signedDiscountTimestamp:signedDiscountTimestamp.mappingNSNullToNil
                           completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_REMAP_METHOD(restorePurchases,
                 restorePurchasesWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality restorePurchasesWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve
                                                                                                    reject:reject]];
}

RCT_EXPORT_METHOD(syncPurchases) {
    [RCCommonFunctionality syncPurchasesWithCompletionBlock:nil];
}

RCT_REMAP_METHOD(getAppUserID,
                 getAppUserIDWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    resolve([RCCommonFunctionality appUserID]);
}

RCT_REMAP_METHOD(getStorefront,
                 getStorefrontWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
  [RCCommonFunctionality getStorefrontWithCompletion:^(NSDictionary<NSString *,id> * _Nullable storefront) {
    resolve(storefront);
  }];
}

RCT_EXPORT_METHOD(logIn:(nonnull NSString *)appUserID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality logInWithAppUserID:appUserID.mappingNSNullToNil
                              completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_REMAP_METHOD(logOut,
                 logOutWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality logOutWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_REMAP_METHOD(setDebugLogsEnabled,
                 debugLogsEnabled:(BOOL)enabled) {
    [RCCommonFunctionality setDebugLogsEnabled:enabled];
}

RCT_EXPORT_METHOD(setLogLevel:(NSString *)level)
{
    [RCCommonFunctionality setLogLevel:level.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setSimulatesAskToBuyInSandbox:(BOOL)simulatesAskToBuyInSandbox)
{
    [RCCommonFunctionality setSimulatesAskToBuyInSandbox:simulatesAskToBuyInSandbox];
}

RCT_REMAP_METHOD(getCustomerInfo,
                 customerInfoWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality getCustomerInfoWithCompletionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(enableAdServicesAttributionTokenCollection)
{
    #if !TARGET_OS_TV
    if (@available(iOS 14.3, macOS 11.1, macCatalyst 14.3, *)) {
        [RCCommonFunctionality enableAdServicesAttributionTokenCollection];
    } else {
        NSLog(@"[Purchases] Warning: tried to enable AdServices attribution token collection, but it's only available on iOS 14.3 or greater or macOS 11.1 or greater.");
    }
    #else
    NSLog(@"[Purchases] Warning: AdServices attribution token collection is not available on tvOS.");
    #endif
}

RCT_REMAP_METHOD(isAnonymous,
                 isAnonymousWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    resolve(@([RCCommonFunctionality isAnonymous]));
}

RCT_EXPORT_METHOD(makeDeferredPurchase:(nonnull NSNumber *)callbackID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    StartPurchaseBlock defermentBlock = [self.defermentBlocks objectAtIndex:[callbackID integerValue]];
    [RCCommonFunctionality makeDeferredPurchase:defermentBlock
                                completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(checkTrialOrIntroductoryPriceEligibility:(NSArray *)products
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality checkTrialOrIntroductoryPriceEligibility:products.mappingNSNullToNil
                                                    completionBlock:^(NSDictionary<NSString *,RCIntroEligibility *> * _Nonnull responseDictionary) {
        resolve([NSDictionary dictionaryWithDictionary:responseDictionary]);
    }];
}

RCT_EXPORT_METHOD(invalidateCustomerInfoCache) {
    [RCCommonFunctionality invalidateCustomerInfoCache];
}

RCT_REMAP_METHOD(getPromotionalOffer,
                 getPromotionalOfferForProductIdentifier:(NSString *)productIdentifier
                 discount:(NSString *)discount
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality promotionalOfferForProductIdentifier:productIdentifier.mappingNSNullToNil
                                                       discount:discount.mappingNSNullToNil
                                                completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
}

RCT_EXPORT_METHOD(presentCodeRedemptionSheet) {
    #if TARGET_OS_IOS && !TARGET_OS_MACCATALYST
    if (@available(iOS 14.0, *)) {
        [RCCommonFunctionality presentCodeRedemptionSheet];
    } else {
        logUnavailablePresentCodeRedemptionSheet();
    }
    #else
    logUnavailablePresentCodeRedemptionSheet();
    #endif
}

static void logUnavailablePresentCodeRedemptionSheet() {
    NSLog(@"[Purchases] Warning: tried to present codeRedemptionSheet, but it's only available on iOS 14.0 or greater.");
}

#pragma mark - Win-Back getOfferings
RCT_EXPORT_METHOD(eligibleWinBackOffersForProductIdentifier:(nonnull NSString *)productID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 18.0, macOS 15.0, tvOS 18.0, watchOS 11.0, visionOS 2.0, *)) {
        [RCCommonFunctionality eligibleWinBackOffersForProductIdentifier:productID
                                                         completionBlock:^(NSArray<NSDictionary *> * _Nullable offers, RCErrorContainer * _Nullable errorContainer) {
            if (errorContainer) {
                reject(
                    [NSString stringWithFormat:@"%ld", (long)errorContainer.code],
                    errorContainer.message,
                    errorContainer.error
                );
            } else {
                resolve(offers ?: @[]);
            }
        }];
    } else {
        NSError *error = [self createUnsupportedErrorWithDescription:@"iOS win-back offers are only available on iOS 18.0 or greater."];
        reject([NSString stringWithFormat:@"%ld", (long)error.code], [error localizedDescription], error);
    }
}

RCT_EXPORT_METHOD(purchaseProductWithWinBackOffer:(nonnull NSString *)productID
                                   winBackOfferID:(nonnull NSString *)winBackOfferID
                                          resolve:(RCTPromiseResolveBlock)resolve
                                           reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 18.0, macOS 15.0, tvOS 18.0, watchOS 11.0, visionOS 2.0, *)) {
        [RCCommonFunctionality purchaseProduct:productID
                                winBackOfferID:winBackOfferID
                               completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
    } else {
        NSError *error = [self createUnsupportedErrorWithDescription:@"iOS win-back offers are only available on iOS 18.0 or greater."];
        reject([NSString stringWithFormat:@"%ld", (long)error.code], [error localizedDescription], error);
    }
}

RCT_EXPORT_METHOD(purchasePackageWithWinBackOffer:(nonnull NSString *)packageID
                         presentedOfferingContext:(NSDictionary *)presentedOfferingContext
                                   winBackOfferID:(nonnull NSString *)winBackOfferID
                                          resolve:(RCTPromiseResolveBlock)resolve
                                           reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 18.0, macOS 15.0, tvOS 18.0, watchOS 11.0, visionOS 2.0, *)) {
        [RCCommonFunctionality purchasePackage:packageID
                      presentedOfferingContext:presentedOfferingContext.mappingNSNullToNil
                                winBackOfferID:winBackOfferID
                               completionBlock:[self getResponseCompletionBlockWithResolve:resolve reject:reject]];
    } else {
        NSError *error = [self createUnsupportedErrorWithDescription:@"iOS win-back offers are only available on iOS 18.0 or greater."];
        reject([NSString stringWithFormat:@"%ld", (long)error.code], [error localizedDescription], error);
    }
}


#pragma mark - Subscriber Attributes

RCT_EXPORT_METHOD(setProxyURLString:(nullable NSString *)proxyURLString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality setProxyURLString:proxyURLString.mappingNSNullToNil];
    resolve(nil); // Resolve the promise with no value
}

RCT_EXPORT_METHOD(setAttributes:(NSDictionary *)attributes) {
    [RCCommonFunctionality setAttributes:attributes.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setEmail:(NSString *)email) {
    [RCCommonFunctionality setEmail:email.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setPhoneNumber:(NSString *)phoneNumber) {
    [RCCommonFunctionality setPhoneNumber:phoneNumber.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setDisplayName:(NSString *)displayName) {
    [RCCommonFunctionality setDisplayName:displayName.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setPushToken:(NSString *)pushToken) {
    [RCCommonFunctionality setPushToken:pushToken.mappingNSNullToNil];
}

# pragma mark Attribution IDs

RCT_EXPORT_METHOD(collectDeviceIdentifiers) {
    [RCCommonFunctionality collectDeviceIdentifiers];
}

RCT_EXPORT_METHOD(setAdjustID:(NSString *)adjustID) {
    [RCCommonFunctionality setAdjustID:adjustID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setAppsflyerID:(NSString *)appsflyerID) {
    [RCCommonFunctionality setAppsflyerID:appsflyerID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setFBAnonymousID:(NSString *)fbAnonymousID) {
    [RCCommonFunctionality setFBAnonymousID:fbAnonymousID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setMparticleID:(NSString *)mparticleID) {
    [RCCommonFunctionality setMparticleID:mparticleID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setCleverTapID:(NSString *)cleverTapID) {
    [RCCommonFunctionality setCleverTapID:cleverTapID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setMixpanelDistinctID:(NSString *)mixpanelDistinctID) {
    [RCCommonFunctionality setMixpanelDistinctID:mixpanelDistinctID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setFirebaseAppInstanceID:(NSString *)firebaseAppInstanceId) {
    [RCCommonFunctionality setFirebaseAppInstanceID:firebaseAppInstanceId.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setTenjinAnalyticsInstallationID:(NSString *)tenjinAnalyticsInstallationID) {
    [RCCommonFunctionality setTenjinAnalyticsInstallationID:tenjinAnalyticsInstallationID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setKochavaDeviceID:(NSString *)kochavaDeviceID) {
    [RCCommonFunctionality setKochavaDeviceID:kochavaDeviceID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setOnesignalID:(NSString *)onesignalID) {
    [RCCommonFunctionality setOnesignalID:onesignalID.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setAirshipChannelID:(NSString *)airshipChannelID) {
    [RCCommonFunctionality setAirshipChannelID:airshipChannelID.mappingNSNullToNil];
}

# pragma mark Campaign parameters

RCT_EXPORT_METHOD(setMediaSource:(NSString *)mediaSource) {
    [RCCommonFunctionality setMediaSource:mediaSource.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setCampaign:(NSString *)campaign) {
    [RCCommonFunctionality setCampaign:campaign.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setAdGroup:(NSString *)adGroup) {
    [RCCommonFunctionality setAdGroup:adGroup.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setAd:(NSString *)ad) {
    [RCCommonFunctionality setAd:ad.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setKeyword:(NSString *)keyword) {
    [RCCommonFunctionality setKeyword:keyword.mappingNSNullToNil];
}

RCT_EXPORT_METHOD(setCreative:(NSString *)creative) {
    [RCCommonFunctionality setCreative:creative.mappingNSNullToNil];
}

RCT_REMAP_METHOD(canMakePayments,
                 canMakePaymentsWithFeatures:(NSArray<NSNumber *> *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
      resolve(@([RCCommonFunctionality canMakePaymentsWithFeatures:features.mappingNSNullToNil]));
}

RCT_EXPORT_METHOD(beginRefundRequestForActiveEntitlement:(RCTPromiseResolveBlock)resolve
                                                  reject:(RCTPromiseRejectBlock)reject) {
    #if TARGET_OS_IPHONE && !TARGET_OS_TV
    if (@available(iOS 15.0, *)) {
        [RCCommonFunctionality beginRefundRequestForActiveEntitlementCompletion:[self getBeginRefundResponseCompletionBlockWithResolve:resolve
                                                                                                                                reject:reject]];
    } else {
        resolve(nil);
    }
    #else
    resolve(nil);
    #endif
}

RCT_EXPORT_METHOD(beginRefundRequestForEntitlementId:(NSString *)entitlementIdentifier
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    #if TARGET_OS_IPHONE && !TARGET_OS_TV
    if (@available(iOS 15.0, *)) {
        [RCCommonFunctionality beginRefundRequestEntitlementId:entitlementIdentifier.mappingNSNullToNil
                                               completionBlock:[self getBeginRefundResponseCompletionBlockWithResolve:resolve
                                                                                                               reject:reject]];
    } else {
        resolve(nil);
    }
    #else
    resolve(nil);
    #endif
}

RCT_EXPORT_METHOD(beginRefundRequestForProductId:(NSString *)productIdentifier
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    #if TARGET_OS_IPHONE && !TARGET_OS_TV
    if (@available(iOS 15.0, *)) {
        [RCCommonFunctionality beginRefundRequestProductId:productIdentifier.mappingNSNullToNil
                                           completionBlock:[self getBeginRefundResponseCompletionBlockWithResolve:resolve
                                                                                                           reject:reject]];
    } else {
        resolve(nil);
    }
    #else
    resolve(nil);
    #endif
}

RCT_EXPORT_METHOD(showManageSubscriptions:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    #if TARGET_OS_IPHONE && !TARGET_OS_TV
    if (@available(iOS 13.0, macOS 10.15, visionOS 1.0, *)) {
        [RCCommonFunctionality showManageSubscriptions:^(RCErrorContainer * _Nullable errorContainer) {
            if (errorContainer) {
                reject(
                    [NSString stringWithFormat:@"%ld", (long)errorContainer.code],
                    errorContainer.message,
                    errorContainer.error
                );
            } else {
                resolve(nil);
            }
        }];
    } else {
        NSLog(@"[Purchases] Warning: tried to showManageSubscriptions in non supported iOS devices. Only available on iOS 13.0 or greater.");
        NSError *error = [self createUnsupportedErrorWithDescription:@"Tried to present manage subscriptions sheet, but this functionality is only available on iOS 13.0 or greater."];
        reject([NSString stringWithFormat:@"%ld", (long)error.code], [error localizedDescription], error);
    }
    #else
    NSLog(@"[Purchases] Warning: tried to showManageSubscriptions in non-ios devices. That's not supported.");
    NSError *error = [self createUnsupportedErrorWithDescription:@"Tried to present manage subscriptions sheet, but this functionality is only available on iOS devices."];
    reject([NSString stringWithFormat:@"%ld", (long)error.code], [error localizedDescription], error);
    #endif
}

RCT_EXPORT_METHOD(showInAppMessages:(NSArray<NSNumber *> *)messageTypes
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    #if TARGET_OS_IPHONE && !TARGET_OS_TV
    if (@available(iOS 16.0, *)) {
        if (messageTypes == nil) {
            [RCCommonFunctionality showStoreMessagesCompletion:^{
                resolve(nil);
            }];
        } else {
            NSSet *types = [[NSSet alloc] initWithArray:messageTypes.mappingNSNullToNil];
            [RCCommonFunctionality showStoreMessagesForTypes:types completion:^{
                resolve(nil);
            }];
        }
    } else {
        NSLog(@"[Purchases] Warning: tried to showInAppMessages in iOS <16.0. That's not supported.");
        resolve(nil);
    }
    #else
    NSLog(@"[Purchases] Warning: tried to showInAppMessages in non-ios devices. That's not supported.");
    resolve(nil);
    #endif
}

RCT_REMAP_METHOD(isConfigured,
                 isConfiguredWithResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    resolve(@(RCPurchases.isConfigured));
}

RCT_EXPORT_METHOD(setLogHandler) {
    [RCCommonFunctionality setLogHanderOnLogReceived:^(NSDictionary<NSString *,NSString *> * _Nonnull logDetails) {
        [self sendEventWithName:RNPurchasesLogHandlerEvent body:logDetails];
    }];
}

RCT_EXPORT_METHOD(isWebPurchaseRedemptionURL:(NSString *)urlString
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    resolve(@([RCCommonFunctionality isWebPurchaseRedemptionURL:urlString.mappingNSNullToNil]));
}

RCT_EXPORT_METHOD(redeemWebPurchase:(NSString *)urlString
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [RCCommonFunctionality redeemWebPurchaseWithUrlString:urlString.mappingNSNullToNil
                                               completion:[self getResponseCompletionBlockWithResolve:resolve
                                                                                               reject:reject]];
}

#pragma mark -
#pragma mark PurchasesAreCompletedBy Helper Functions
RCT_EXPORT_METHOD(recordPurchaseForProductID:(nonnull NSString *)productID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    if (@available(iOS 15.0, *)) {
        [RCCommonFunctionality recordPurchaseForProductID:productID
                                               completion:[self getResponseCompletionBlockWithResolve:resolve
                                                                                               reject:reject]];
    } else {
        NSError *error = [self createUnsupportedErrorWithDescription:@"Tried to handle transaction made by your app, but this functionality is only available on iOS 15.0 or greater."];
        reject([NSString stringWithFormat:@"%ld", (long) error.code], [error localizedDescription], error);
    }
}

#pragma mark -
#pragma mark Delegate Methods
- (void)purchases:(RCPurchases *)purchases receivedUpdatedCustomerInfo:(RCCustomerInfo *)customerInfo {
    [self sendEventWithName:RNPurchasesCustomerInfoUpdatedEvent
                       body:[RCCommonFunctionality encodeCustomerInfo:customerInfo]];
}

- (void)purchases:(RCPurchases *)purchases
readyForPromotedProduct:(RCStoreProduct *)product
         purchase:(void (^)(void (^ _Nonnull)(RCStoreTransaction * _Nullable, RCCustomerInfo * _Nullable, NSError * _Nullable, BOOL)))startPurchase {
    if (!self.defermentBlocks) {
        self.defermentBlocks = [NSMutableArray array];
    }
    [self.defermentBlocks addObject:startPurchase];
    NSInteger position = [self.defermentBlocks count] - 1;
    [self sendEventWithName:RNPurchasesShouldPurchasePromoProductEvent body:@{@"callbackID": @(position)}];
}

#pragma mark -
#pragma mark Helper Methods

- (void)rejectPromiseWithBlock:(RCTPromiseRejectBlock)reject error:(RCErrorContainer *)error {
    reject([NSString stringWithFormat:@"%ld", (long) error.code], error.message, error.error);
}

- (void (^)(NSDictionary *, RCErrorContainer *))getResponseCompletionBlockWithResolve:(RCTPromiseResolveBlock)resolve
                                                                               reject:(RCTPromiseRejectBlock)reject {
    return ^(NSDictionary *_Nullable responseDictionary, RCErrorContainer *_Nullable error) {
        if (error) {
            [self rejectPromiseWithBlock:reject error:error];
        } else if (responseDictionary) {
            resolve([NSDictionary dictionaryWithDictionary:responseDictionary]);
        } else {
            resolve(nil);
        }
    };
}

- (void (^)(RCErrorContainer *))getBeginRefundResponseCompletionBlockWithResolve:(RCTPromiseResolveBlock)resolve
                                                                          reject:(RCTPromiseRejectBlock)reject {
    return ^(RCErrorContainer * _Nullable error) {
        if (error == nil) {
            resolve(@0);
        } else if ([error.info[@"userCancelled"] isEqual:@YES]) {
            resolve(@1);
        } else {
            [self rejectPromiseWithBlock:reject error:error];
        }
    };
}

- (NSError *)createUnsupportedErrorWithDescription:(NSString *)description {
    return [[NSError alloc] initWithDomain:RCPurchasesErrorCodeDomain
                                      code:RCUnsupportedError
                                  userInfo:@{NSLocalizedDescriptionKey : description}];
}

- (NSString *)platformFlavor {
    return @"react-native";
}

- (NSString *)platformFlavorVersion {
    return @"8.11.0";
}

@end

@implementation NSObject (NSNullMapping)

- (id)mappingNSNullToNil {
    if ([self isKindOfClass:[NSNull class]]) {
        return nil;
    } else if ([self isKindOfClass:NSDictionary.class]) {
        NSMutableDictionary *filteredDict = [NSMutableDictionary dictionary];
        NSDictionary *originalDict = (NSDictionary *)self;

        for (id key in originalDict) {
            id value = [originalDict[key] mappingNSNullToNil];
            if (value) {
                // Only add non-nil values to the dictionary
                filteredDict[key] = value;
            }
        }

      return [NSDictionary dictionaryWithDictionary:filteredDict];

    } else if ([self isKindOfClass:NSArray.class]) {
        NSMutableArray *filteredArray = [NSMutableArray array];
        NSArray *originalArray = (NSArray *)self;

        for (id value in originalArray) {
            id newValue = [value mappingNSNullToNil];
            if (newValue) {
                // Only add non-nil values to the array
                [filteredArray addObject:newValue];
            }
        }

        return [NSArray arrayWithArray:filteredArray];
    }

    return self;
}

@end
