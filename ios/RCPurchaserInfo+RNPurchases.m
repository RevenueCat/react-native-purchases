//
//  RCPurchaserInfo+RNPurchases.m
//  RNPurchases
//
//  Created by Jacob Eiting on 2/9/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "RCPurchaserInfo+RNPurchases.h"

static id formatter;
static dispatch_once_t onceToken;

static NSString * stringFromDate(NSDate *date)
{
    dispatch_once(&onceToken, ^{
        if (@available(iOS 10.0, *)) {
            formatter = [NSISO8601DateFormatter new];
        } else {
            NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
            dateFormatter.timeZone = [NSTimeZone timeZoneWithAbbreviation:@"GMT"];
            dateFormatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss'Z'";
            dateFormatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
            formatter = dateFormatter;
        }
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

    id latestExpiration = stringFromDate(self.latestExpirationDate) ?: [NSNull null];

    return @{
             @"activeEntitlements": self.activeEntitlements.allObjects,
             @"activeSubscriptions": self.activeSubscriptions.allObjects,
             @"allPurchasedProductIdentifiers": self.allPurchasedProductIdentifiers.allObjects,
             @"latestExpirationDate": latestExpiration,
             @"allExpirationDates": allExpirations,
             @"expirationsForActiveEntitlements": expirationsForActiveEntitlements
             };
}

@end
