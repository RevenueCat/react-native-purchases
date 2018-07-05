//
//  RCPurchaserInfo+RNPurchases.m
//  RNPurchases
//
//  Created by Jacob Eiting on 2/9/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "RCPurchaserInfo+RNPurchases.h"

@implementation RCPurchaserInfo (RNPurchases)

- (NSDictionary *)dictionary
{
    NSISO8601DateFormatter *formatter = [NSISO8601DateFormatter new];

    NSMutableDictionary *allExpirations = [NSMutableDictionary new];
    for (NSString *productIdentifier in self.allPurchasedProductIdentifiers) {
        NSDate *date = [self expirationDateForProductIdentifier:productIdentifier];
        allExpirations[productIdentifier] =  date ? [formatter stringFromDate:date] : [NSNull null];
    }

    NSMutableDictionary *expirationsForActiveEntitlements = [NSMutableDictionary new];
    for (NSString *entId in self.activeEntitlements) {
        NSDate *date = [self expirationDateForEntitlement:entId];
        expirationsForActiveEntitlements[entId] = date ? [formatter stringFromDate:date] : [NSNull null];;
    }

    id latestExpiration = self.latestExpirationDate ? [formatter stringFromDate:self.latestExpirationDate] : [NSNull null];

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
