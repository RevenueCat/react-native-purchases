//
//  NativeOverlayViewManager.h
//  RNPaywalls
//
//  Created by Cesar de la Vega on 16/10/26.
//

#import <React/RCTViewManager.h>

/// Hosts React children in a transparent view controller presented from the topmost
/// presented view controller, so they render above natively presented RevenueCat UI.
@interface NativeOverlayViewManager : RCTViewManager

@end
