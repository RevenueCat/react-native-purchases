//
//  Created by RevenueCat.
//  Copyright © 2019 RevenueCat. All rights reserved.
//

#import <Purchases/Purchases.h>

@interface RCErrorContainer : NSObject

@property (nonatomic, readonly) NSInteger code;
@property (nonatomic, nonnull, readonly) NSString *message;
@property (nonatomic, nonnull, readonly) NSDictionary *info;
@property (nonatomic, nonnull, readonly) NSError *error;

- (nonnull instancetype)initWithError:(nonnull NSError *)error info:(nonnull NSDictionary *)info;

@end
