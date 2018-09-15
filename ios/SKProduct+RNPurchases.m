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
    NSDictionary *d = @{
                        @"identifier": self.productIdentifier ?: @"",
                        @"description": self.localizedDescription ?: @"",
                        @"title": self.localizedTitle ?: @"",
                        @"price": @(self.price.floatValue),
                        @"price_string": [formatter stringFromNumber:self.price],
                        @"currency_code": (self.rc_currencyCode) ? self.rc_currencyCode : [NSNull null]
                        };
    return d;
}

@end
