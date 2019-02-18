//
//  RCPurchaserInfo+RNPurchases.m
//  RNPurchases
//
//  Created by Jacob Eiting on 2/9/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "RCPurchaserInfo+RNPurchases.h"

static NSDateFormatter *formatter;
static dispatch_once_t onceToken;

static NSString * stringFromDate(NSDate *date)
{
    dispatch_once(&onceToken, ^{
        // Here we're not using NSISO8601DateFormatter as we need to support iOS < 10
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        dateFormatter.timeZone = [NSTimeZone timeZoneWithAbbreviation:@"GMT"];
        dateFormatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss'Z'";
        dateFormatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
        formatter = dateFormatter;
    });

    return [formatter stringFromDate:date];
}

@implementation RCPurchaserInfo (RNPurchases)

- (NSDictionary *)dictionary
{
    NSMutableDictionary *allExpirations = [NSMutableDictionary new];
    for (NSString *productIdentifier in self.allPurchasedProductIdentifiers) {
        NSDate *date = [self expirationDateForProductIdentifier:productIdentifier];
        allExpirations[productIdentifier] = stringFromDate(date) ?: [NSNull null];
    }

    NSMutableDictionary *expirationsForActiveEntitlements = [NSMutableDictionary new];
    for (NSString *entId in self.activeEntitlements) {
        NSDate *date = [self expirationDateForEntitlement:entId];
        expirationsForActiveEntitlements[entId] = stringFromDate(date) ?: [NSNull null];;
    }

    NSMutableDictionary *purchaseDatesForActiveEntitlements = [NSMutableDictionary new];
    for (NSString *entId in self.activeEntitlements) {
        NSDate *date = [self purchaseDateForEntitlement:entId];
        purchaseDatesForActiveEntitlements[entId] = stringFromDate(date) ?: [NSNull null];;
    }

    id latestExpiration = stringFromDate(self.latestExpirationDate) ?: [NSNull null];

    return @{
             @"activeEntitlements": self.activeEntitlements.allObjects,
             @"activeSubscriptions": self.activeSubscriptions.allObjects,
             @"allPurchasedProductIdentifiers": self.allPurchasedProductIdentifiers.allObjects,
             @"latestExpirationDate": latestExpiration,
             @"allExpirationDates": allExpirations,
             @"expirationsForActiveEntitlements": expirationsForActiveEntitlements,
             @"purchaseDatesForActiveEntitlements": purchaseDatesForActiveEntitlements
             };
}

@end
