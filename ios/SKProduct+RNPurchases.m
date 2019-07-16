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
        if (self.introductoryPrice) {
            d[@"intro_price"] = @(self.introductoryPrice.price.floatValue) ?: @"";
            if (self.introductoryPrice.price) {
                d[@"intro_price_string"] = [formatter stringFromNumber:self.introductoryPrice.price];
            } else {
                d[@"intro_price_string"] = @"";
            }
            d[@"intro_price_period"] = [self normalizeSubscriptionPeriod:self.introductoryPrice.subscriptionPeriod] ?: @"";
            d[@"intro_price_period_unit"] = [self normalizeSubscriptionPeriodUnit:self.introductoryPrice.subscriptionPeriod.unit] ?: @"";
            d[@"intro_price_period_number_of_units"] = @(self.introductoryPrice.subscriptionPeriod.numberOfUnits) ?: @"";
            d[@"intro_price_cycles"] = @(self.introductoryPrice.numberOfPeriods) ?: @"";
            return d;
        }
    }
    d[@"intro_price"] = @"";
    d[@"intro_price_string"] = @"";
    d[@"intro_price_period"] = @"";
    d[@"intro_price_cycles"] = @"";
    
    return d;
}

- (NSString *)normalizeSubscriptionPeriod:(SKProductSubscriptionPeriod *)subscriptionPeriod API_AVAILABLE(ios(11.2)){
    NSString *unit;
    switch (subscriptionPeriod.unit) {
        case SKProductPeriodUnitDay:
            unit = @"D";
        case SKProductPeriodUnitWeek:
            unit = @"W";
        case SKProductPeriodUnitMonth:
            unit = @"M";
        case SKProductPeriodUnitYear:
            unit = @"Y";
    }
    return [NSString stringWithFormat:@"%@%@%@", @"P", @(subscriptionPeriod.numberOfUnits), unit];
}

- (NSString *)normalizeSubscriptionPeriodUnit:(SKProductPeriodUnit)subscriptionPeriodUnit API_AVAILABLE(ios(11.2)){
    switch (subscriptionPeriodUnit) {
        case SKProductPeriodUnitDay:
            return @"DAY";
        case SKProductPeriodUnitWeek:
            return @"WEEK";
        case SKProductPeriodUnitMonth:
            return @"MONTH";
        case SKProductPeriodUnitYear:
            return @"YEAR";
    }
}

@end
