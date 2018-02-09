//
//  RCPurchaserInfo+React.m
//  RNPurchases
//
//  Created by Jacob Eiting on 2/9/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "RCPurchaserInfo+React.h"

@implementation RCPurchaserInfo (React)

- (NSDictionary *)dictionary
{
    NSISO8601DateFormatter *formatter = [NSISO8601DateFormatter new];
    NSMutableDictionary *allExpirations = [NSMutableDictionary new];
    for (NSString *productIdentifier in self.allPurchasedProductIdentifiers) {
        NSDate *date = [self expirationDateForProductIdentifier:productIdentifier];
        allExpirations[productIdentifier] =  date ? [formatter stringFromDate:date] : [NSNull null];
    }

    return @{
             @"activeSubscriptions": self.activeSubscriptions.allObjects,
             @"allPurchasedProductIdentifiers": self.allPurchasedProductIdentifiers.allObjects,
             @"latestExpirationDate": self.latestExpirationDate ?: [NSNull null],
             @"allExpirations": allExpirations
             };
}

@end
