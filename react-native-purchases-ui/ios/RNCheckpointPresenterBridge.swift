//
//  RNCheckpointPresenterBridge.swift
//  Copyright © 2026 RevenueCat. All rights reserved.
//

import Foundation
import CoreFoundation
import PurchasesHybridCommon
@_spi(Internal) import RevenueCat
@_spi(Internal) @_spi(InviteOnlyCheckpointsApi) import RevenueCatUI

@available(iOS 15.0, *)
@MainActor
@objcMembers
public final class RNCheckpointPresenterBridge: NSObject {

    private final class CallState {
        var presenterDetached = false
        var errorFactoryDetached = false
    }

    private static var calls: [String: CallState] = [:]
    private static var pendingCompletions: [String: (callId: String, completion: PaywallPresentationCompletion)] = [:]
    private static var pendingErrorDialogs: [String: (callId: String, completion: ErrorDialogFactoryCompletion)] = [:]

    public static func checkpoint(
        identifier: String,
        customVariables: NSDictionary?,
        presentationMode: String,
        callId: String,
        hasErrorDialogFactory: Bool,
        onErrorDialogRequested: @escaping (String, NSDictionary) -> Void,
        onPaywallPresentation: @escaping (String, NSDictionary) -> Void,
        onPassed: @escaping (NSDictionary) -> Void,
        onError: @escaping (String, String) -> Void
    ) {
        guard Purchases.isConfigured else {
            onError("NOT_CONFIGURED", "Configure Purchases before calling a checkpoint.")
            return
        }

        let state = CallState()
        calls[callId] = state
        let variables = (customVariables as? [String: Any] ?? [:])
            .compactMapValues(Self.customVariableValue(from:))
        let mode = Self.presentationMode(from: presentationMode)
        let presenter: PaywallPresentationHandler = { params, completion in
            guard !state.presenterDetached else {
                completion(.navigatedBack)
                return
            }
            let requestId = UUID().uuidString
            self.pendingCompletions[requestId] = (callId, completion)
            let payload: [String: Any] = [
                "callId": callId,
                "requestId": requestId,
                "params": [
                    "checkpointIdentifier": params.checkpointIdentifier,
                    "customVariables": (customVariables as? [String: Any] ?? [:])
                        .filter { params.customVariables[$0.key] != nil },
                    "presentationMode": Self.string(from: params.presentationMode),
                    "offering": params.offering.dictionary,
                ],
            ]
            onPaywallPresentation(requestId, payload as NSDictionary)
        }

        let errorDialogFactory: ErrorDialogFactory = { params, completion in
            guard !state.errorFactoryDetached else {
                completion.complete(with: .useDefault)
                return
            }
            let requestId = UUID().uuidString
            self.pendingErrorDialogs[requestId] = (callId, completion)
            let kind: String
            switch params.kind {
            case .flowCouldNotBeShown: kind = "flowCouldNotBeShown"
            case .flowActionFailed: kind = "flowActionFailed"
            default: kind = "flowResultSyncFailed"
            }
            let error = params.error as NSError
            onErrorDialogRequested(requestId, [
                "kind": kind, "code": error.code, "message": error.localizedDescription,
            ] as NSDictionary)
        }

        Purchases.shared.checkpoint(
            identifier,
            customVariables: variables,
            presentationMode: mode,
            paywallPresenter: presenter,
            errorDialogFactory: hasErrorDialogFactory ? errorDialogFactory : nil
        ) { result in
            self.calls.removeValue(forKey: callId)
            onPassed(Self.serialize(result) as NSDictionary)
        }
    }

    public static func completePaywallPresentation(requestId: String, result: String) {
        guard let pending = pendingCompletions.removeValue(forKey: requestId) else { return }
        let completion = pending.completion
        if result != "CONTINUED" && result != "CLOSED" {
            calls.removeValue(forKey: pending.callId)
        }
        switch result {
        case "CONTINUED": completion(.continued)
        case "CLOSED": completion(.closed)
        case "NAVIGATED_BACK": completion(.navigatedBack)
        default: completion(.navigatedBack)
        }
    }

    public static func detachPaywallPresenter(callId: String, activeRequestId: String?) {
        let state = calls.removeValue(forKey: callId)
        state?.presenterDetached = true
        state?.errorFactoryDetached = true
        detachErrorDialogFactory(callId: callId)
        // An emitted event may still be queued in JS. Preserve only UI JS actually started.
        let requestIds = pendingCompletions.compactMap { requestId, pending in
            pending.callId == callId && requestId != activeRequestId ? requestId : nil
        }
        for requestId in requestIds {
            completePaywallPresentation(requestId: requestId, result: "NAVIGATED_BACK")
        }
    }

    public static func resolveErrorDialog(requestId: String, outcome: NSDictionary?) -> Bool {
        guard let pending = pendingErrorDialogs.removeValue(forKey: requestId) else { return false }
        let result: ErrorDialogFactoryOutcome
        switch outcome?["type"] as? String {
        case "suppress": result = .suppress
        case "show":
            if let dialog = outcome?["dialog"] as? [String: Any],
               let message = dialog["message"] as? String, !message.isEmpty,
               let buttonTitle = dialog["buttonTitle"] as? String, !buttonTitle.isEmpty {
                result = .show(CheckpointErrorDialog(message: message, dismissButtonTitle: buttonTitle))
            } else {
                result = .useDefault
            }
        default: result = .useDefault
        }
        pending.completion.complete(with: result)
        return true
    }

    public static func detachErrorDialogFactory(callId: String) {
        calls[callId]?.errorFactoryDetached = true
        let requestIds = pendingErrorDialogs.compactMap { $0.value.callId == callId ? $0.key : nil }
        for requestId in requestIds {
            pendingErrorDialogs.removeValue(forKey: requestId)?.completion.complete(with: .useDefault)
        }
    }

    public static func clearPendingCompletions() {
        for state in calls.values {
            state.presenterDetached = true
            state.errorFactoryDetached = true
        }
        calls.removeAll()
        let completions = pendingCompletions.values.map { $0.completion }
        pendingCompletions.removeAll()
        let errorCompletions = pendingErrorDialogs.values.map { $0.completion }
        pendingErrorDialogs.removeAll()
        for completion in errorCompletions { completion.complete(with: .useDefault) }
        for completion in completions { completion(.navigatedBack) }
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
        default: return "DEFAULT"
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
