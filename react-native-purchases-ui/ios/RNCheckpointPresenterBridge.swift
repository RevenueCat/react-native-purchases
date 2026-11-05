//
//  RNCheckpointPresenterBridge.swift
//  Copyright © 2026 RevenueCat. All rights reserved.
//

import Foundation
import CoreFoundation
import PurchasesHybridCommon
@_spi(Internal) import RevenueCat
@_spi(InviteOnlyCheckpointsApi) import RevenueCatUI

@available(iOS 15.0, *)
@MainActor
@objcMembers
public final class RNCheckpointPresenterBridge: NSObject {

    private static var pendingCompletions: [String: PaywallPresentationCompletion] = [:]

    public static func checkpoint(
        identifier: String,
        customVariables: NSDictionary?,
        presentationMode: String,
        callId: String,
        onPaywallPresentation: @escaping (String, NSDictionary) -> Void,
        onPassed: @escaping (NSDictionary) -> Void,
        onError: @escaping (String, String) -> Void
    ) {
        guard Purchases.isConfigured else {
            onError("NOT_CONFIGURED", "Configure Purchases before calling a checkpoint.")
            return
        }

        let variables = (customVariables as? [String: Any] ?? [:])
            .compactMapValues(Self.customVariableValue(from:))
        let mode = Self.presentationMode(from: presentationMode)
        let presenter: PaywallPresentationHandler = { params, completion in
            let requestId = UUID().uuidString
            self.pendingCompletions[requestId] = completion
            let payload: [String: Any] = [
                "callId": callId,
                "requestId": requestId,
                "params": [
                    "checkpointIdentifier": params.checkpointIdentifier,
                    "customVariables": (customVariables as? [String: Any] ?? [:]),
                    "presentationMode": Self.string(from: params.presentationMode),
                    "offering": params.offering.dictionary,
                ],
            ]
            onPaywallPresentation(requestId, payload as NSDictionary)
        }

        Purchases.shared.checkpoint(
            identifier,
            customVariables: variables,
            presentationMode: mode,
            paywallPresenter: presenter
        ) { result in
            onPassed(Self.serialize(result) as NSDictionary)
        }
    }

    public static func completePaywallPresentation(requestId: String, result: String) {
        guard let completion = pendingCompletions.removeValue(forKey: requestId) else { return }
        switch result {
        case "CONTINUED": completion(.continued)
        case "CLOSED": completion(.closed)
        case "NAVIGATED_BACK": completion(.navigatedBack)
        default: completion(.navigatedBack)
        }
    }

    public static func clearPendingCompletions() {
        pendingCompletions.removeAll()
    }

    private static func customVariableValue(from value: Any) -> CustomVariableValue? {
        if let string = value as? String {
            return .string(string)
        }
        guard let number = value as? NSNumber else { return nil }
        if CFGetTypeID(number) == CFBooleanGetTypeID() {
            return .bool(number.boolValue)
        }
        return .number(number.doubleValue)
    }

    private static func presentationMode(from value: String) -> FlowPresentationMode {
        switch value {
        case "MODAL_FULL_SCREEN": return .modalFullScreen
        case "MODAL_SHEET": return .modalSheet
        default: return .default
        }
    }

    private static func string(from mode: FlowPresentationMode) -> String {
        switch mode {
        case .modalFullScreen: return "MODAL_FULL_SCREEN"
        case .modalSheet: return "MODAL_SHEET"
        case .default: return "DEFAULT"
        @unknown default: return "DEFAULT"
        }
    }

    private static func serialize(_ result: CheckpointResult) -> [String: Any] {
        let customer = result.customer.dictionary
        let entitlements = (customer["entitlements"] as? [String: Any])?["all"] as? [String: Any] ?? [:]
        let flow: Any = result.flow.map { flow -> [String: Any] in
            [
                "obtainedEntitlements": flow.obtainedEntitlements
                    .sorted { $0.entitlementInfo.identifier < $1.entitlementInfo.identifier }
                    .map { ["entitlementInfo": entitlements[$0.entitlementInfo.identifier] ?? NSNull()] },
                "obtainedProducts": flow.obtainedProducts
                    .sorted { $0.product.id < $1.product.id }
                    .map { obtained -> [String: Any] in
                        let package = Package(
                            identifier: obtained.product.id,
                            packageType: .custom,
                            storeProduct: obtained.product,
                            offeringIdentifier: "",
                            webCheckoutUrl: nil
                        )
                        return ["product": package.dictionary["product"] ?? NSNull()]
                    },
            ]
        } ?? NSNull()
        return ["customer": customer, "flow": flow]
    }
}
