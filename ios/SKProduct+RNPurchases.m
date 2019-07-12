//
//  SKProduct+RNPurchases.m
//  RNPurchases
//
//  Created by Jacob Eiting on 6/25/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "SKProduct+RNPurchases.h"

@implementation SKProduct (RNPurchases)

- (nullable NSString *)rc_currencyCode {
    if(@available(iOS 10.0, *)) {
        return self.priceLocale.currencyCode;
    } else {
        return [self.priceLocale objectForKey:NSLocaleCurrencyCode];
    }
}

- (NSDictionary *)dictionary
{
    NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
    formatter.numberStyle = NSNumberFormatterCurrencyStyle;
    formatter.locale = self.priceLocale;
    NSMutableDictionary *d = [NSMutableDictionary dictionaryWithDictionary:@{
                        @"identifier": self.productIdentifier ?: @"",
                        @"description": self.localizedDescription ?: @"",
                        @"title": self.localizedTitle ?: @"",
                        @"price": @(self.price.floatValue),
                        @"price_string": [formatter stringFromNumber:self.price],
                        @"currency_code": (self.rc_currencyCode) ? self.rc_currencyCode : [NSNull null]
                        }];
    
    if (@available(iOS 11.2, *)) {
        d[@"intro_price"] = @(self.introductoryPrice.price.floatValue) ?: @"";
        if (self.introductoryPrice.price) {
            d[@"intro_price_string"] = [formatter stringFromNumber:self.introductoryPrice.price];
        } else {
            d[@"intro_price_string"] = @"";
        }
        d[@"intro_price_period"] = [self normalizeSubscriptionPeriod:self.introductoryPrice.subscriptionPeriod] ?: @"";
        d[@"intro_price_cycles"] = @(self.introductoryPrice.numberOfPeriods) ?: @"";
    } else {
        d[@"intro_price"] = @"";
        d[@"intro_price_string"] = @"";
        d[@"intro_price_period"] = @"";
        d[@"intro_price_cycles"] = @"";
    }
    
    return d;
}

- (NSString *)normalizeSubscriptionPeriod:(SKProductSubscriptionPeriod *)subscriptionPeriod API_AVAILABLE(ios(11.2)){
    switch (subscriptionPeriod.unit)
    {
        case SKProductPeriodUnitDay:
            return [NSString stringWithFormat:@"%@%@%@", @"P", @(subscriptionPeriod.numberOfUnits), @"D"];;
        case SKProductPeriodUnitWeek:
            return [NSString stringWithFormat:@"%@%@%@", @"P", @(subscriptionPeriod.numberOfUnits), @"W"];;
        case SKProductPeriodUnitMonth:
            return [NSString stringWithFormat:@"%@%@%@", @"P", @(subscriptionPeriod.numberOfUnits), @"M"];;
        case SKProductPeriodUnitYear:
            return [NSString stringWithFormat:@"%@%@%@", @"P", @(subscriptionPeriod.numberOfUnits), @"Y"];;
    }
}

@end
