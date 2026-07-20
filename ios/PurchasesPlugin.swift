//
//  PurchasesPlugin.swift
//  RNPurchases
//
//  Created by César de la Vega  on 10/6/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
@_spi(Internal) import RevenueCat

/// Builds `DangerousSettings` for the React Native bridge. Lives in Swift because `useWorkflows`
/// is an internal `@_spi(Internal)` flag that isn't reachable from the Objective-C bridge.
@objc public class RNPurchasesDangerousSettingsFactory: NSObject {

    @objc public static func make(useWorkflows: Bool) -> DangerousSettings {
        return useWorkflows ? DangerousSettings(useWorkflows: true) : DangerousSettings()
    }

}
