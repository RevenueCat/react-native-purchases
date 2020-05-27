//
// Created by RevenueCat on 3/19/20.
// Copyright (c) 2020 Purchases. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Purchases/Purchases.h>

NS_ASSUME_NONNULL_BEGIN


@interface RCPurchases (HybridAdditions)

- (void)_setPushTokenString:(nullable NSString *)pushToken;

+ (instancetype)configureWithAPIKey:(NSString *)APIKey
                          appUserID:(nullable NSString *)appUserID
                       observerMode:(BOOL)observerMode
              userDefaultsSuiteName:(nullable NSString *)userDefaultsSuiteName
                     platformFlavor:(nullable NSString *)platformFlavor
              platformFlavorVersion:(nullable NSString *)platformFlavorVersion;

+ (instancetype)configureWithAPIKey:(NSString *)APIKey
                          appUserID:(nullable NSString *)appUserID
                       observerMode:(BOOL)observerMode
                       userDefaults:(nullable NSUserDefaults *)userDefaults
                     platformFlavor:(nullable NSString *)platformFlavor
              platformFlavorVersion:(nullable NSString *)platformFlavorVersion;

@end


NS_ASSUME_NONNULL_END
