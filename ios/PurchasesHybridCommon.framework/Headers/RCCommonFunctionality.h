//
//  Created by RevenueCat.
//  Copyright © 2019 RevenueCat. All rights reserved.
//

#import <Purchases/Purchases.h>

NS_ASSUME_NONNULL_BEGIN

@class RCErrorContainer;

typedef void (^RCHybridResponseBlock)(NSDictionary * _Nullable, RCErrorContainer * _Nullable);

@interface RCCommonFunctionality : NSObject

+ (void)configure;

+ (void)setAllowSharingStoreAccount:(BOOL)allowSharingStoreAccount;

+ (void)addAttributionData:(NSDictionary *)data network:(NSInteger)network networkUserId:(NSString *)networkUserId;

+ (void)getProductInfo:(NSArray *)products completionBlock:(void(^)(NSArray<NSDictionary *> *))completion;

+ (void)restoreTransactionsWithCompletionBlock:(RCHybridResponseBlock)completion;

+ (NSString *)appUserID;

+ (void)createAlias:(nullable NSString *)newAppUserId completionBlock:(RCHybridResponseBlock)completion;

+ (void)identify:(NSString *)appUserId completionBlock:(RCHybridResponseBlock)completion;

+ (void)resetWithCompletionBlock:(RCHybridResponseBlock)completion;

+ (void)setDebugLogsEnabled:(BOOL)enabled;

+ (void)getPurchaserInfoWithCompletionBlock:(RCHybridResponseBlock)completion;

+ (void)setAutomaticAppleSearchAdsAttributionCollection:(BOOL)enabled;

+ (void)getOfferingsWithCompletionBlock:(RCHybridResponseBlock)completion;

+ (BOOL)isAnonymous;

+ (void)purchaseProduct:(NSString *)productIdentifier signedDiscountTimestamp:(nullable NSString *)discountTimestamp completionBlock:(RCHybridResponseBlock)completion;

+ (void)purchasePackage:(NSString *)packageIdentifier offering:(NSString *)offeringIdentifier signedDiscountTimestamp:(nullable NSString *)discountTimestamp completionBlock:(RCHybridResponseBlock)completion;

+ (void)makeDeferredPurchase:(RCDeferredPromotionalPurchaseBlock)deferredPurchase completionBlock:(RCHybridResponseBlock)completion;

+ (void)setFinishTransactions:(BOOL)finishTransactions;

+ (void)checkTrialOrIntroductoryPriceEligibility:(nonnull NSArray<NSString *> *)productIdentifiers completionBlock:(RCReceiveIntroEligibilityBlock)completion;

+ (void)paymentDiscountForProductIdentifier:(NSString *)productIdentifier discount:(nullable NSString *)discountIdentifier completionBlock:(RCHybridResponseBlock)completion;

+ (void)invalidatePurchaserInfoCache;

+ (void)setAttributes:(NSDictionary<NSString *, NSString *> *)attributes;

+ (void)setEmail:(nullable NSString *)email;

+ (void)setPhoneNumber:(nullable NSString *)phoneNumber;

+ (void)setDisplayName:(nullable NSString *)displayName;

+ (void)setPushToken:(nullable NSString *)pushToken;

@end

NS_ASSUME_NONNULL_END
