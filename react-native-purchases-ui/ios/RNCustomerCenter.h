//
//  RNCustomerCenter.h
//  Copyright © 2023 RevenueCat. All rights reserved.
//
//  Created by Facundo Menzella on 19/2/25.
//


#import <React/RCTEventEmitter.h>

@import PurchasesHybridCommonUI;

@interface RNCustomerCenter : RCTEventEmitter <RCTBridgeModule, RCCustomerCenterViewControllerDelegateWrapper>

@end
