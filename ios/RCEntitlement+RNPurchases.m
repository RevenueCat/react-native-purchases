//
//  RCEntitlement+RNPurchases.m
//  RNPurchases
//
//  Created by Jacob Eiting on 6/25/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "RCEntitlement+RNPurchases.h"
#import "SKProduct+RNPurchases.h"

@implementation RCEntitlement (RNPurchases)

- (NSDictionary *)dictionary
{
    NSMutableDictionary *jsonDict = [NSMutableDictionary new];
    for (NSString *key in self.offerings) {
        RCOffering *offering = self.offerings[key];
        jsonDict[key] = offering.activeProduct.dictionary;
    }
    return [NSDictionary dictionaryWithDictionary:jsonDict];
}

@end
