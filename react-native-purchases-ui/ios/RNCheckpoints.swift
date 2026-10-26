import Foundation
import React
import PurchasesHybridCommon
@_spi(Internal) import RevenueCat
@_spi(InviteOnlyCheckpointsApi) import RevenueCatUI

@objc(RNCheckpoints)
final class RNCheckpoints: RCTEventEmitter {
    private let invalidationLock = NSLock()
    private var didInvalidate = false
    private var invalidated: Bool {
        self.invalidationLock.lock()
        defer { self.invalidationLock.unlock() }
        return self.didInvalidate
    }
    private var errorPresenterEnabled = false
    private var errorCompletions: [String: () -> Void] = [:]

    override static func requiresMainQueueSetup() -> Bool { true }

    override var methodQueue: DispatchQueue! { DispatchQueue.main }

    override func supportedEvents() -> [String]! {
        ["Checkpoints-onPassed", "Checkpoints-onError"]
    }

    @objc override func addListener(_ eventName: String!) {
        super.addListener(eventName)
    }

    @objc override func removeListeners(_ count: Double) {
        super.removeListeners(count)
    }

    @MainActor
    @objc(checkpoint:customVariables:presentationMode:callId:)
    func checkpoint(_ identifier: String, customVariables: [String: Any]?, presentationMode: String, callId: String) {
        guard !self.invalidated else { return }
        guard Purchases.isConfigured else {
            NSLog("[RevenueCatUI] Configure Purchases before calling a checkpoint.")
            return
        }
        if #available(iOS 15.0, *) {
            let variables = (customVariables ?? [:]).compactMapValues { value -> CustomVariableValue? in
                if let number = value as? NSNumber {
                    return CFGetTypeID(number) == CFBooleanGetTypeID()
                        ? .bool(number.boolValue) : .number(number.doubleValue)
                }
                if let string = value as? String { return .string(string) }
                return nil
            }
            let mode: FlowPresentationMode
            switch presentationMode {
            case "MODAL_FULL_SCREEN": mode = .modalFullScreen
            case "MODAL_SHEET": mode = .modalSheet
            default: mode = .default
            }
            var errorHandler: ErrorPresentationHandler?
            if self.errorPresenterEnabled {
                errorHandler = { [weak self] (params: ErrorPresentationParams, completion: ErrorPresentationCompletion) in
                    guard let self, !self.invalidated, self.errorPresenterEnabled else {
                        completion.complete()
                        return
                    }
                    let requestId = UUID().uuidString
                    self.errorCompletions[requestId] = { completion.complete() }
                    let kind: String
                    switch params.kind {
                    case .flowActionFailed: kind = "FLOW_ACTION_FAILED"
                    case .flowResultSyncFailed: kind = "FLOW_RESULT_SYNC_FAILED"
                    default: kind = "FLOW_COULD_NOT_BE_SHOWN"
                    }
                    let variables = (customVariables ?? [:]).filter { params.customVariables[$0.key] != nil }
                    self.sendEvent(withName: "Checkpoints-onError", body: [
                        "requestId": requestId,
                        "checkpointIdentifier": params.checkpointIdentifier,
                        "error": ErrorContainer(error: params.error, extraPayload: [:]).info,
                        "customVariables": variables,
                        "kind": kind
                    ])
                }
            }
            Purchases.shared.checkpoint(identifier, customVariables: variables, presentationMode: mode,
                                        errorPresenter: errorHandler) { [weak self] result in
                guard let self, !self.invalidated else { return }
                let customer = result.customer.dictionary
                let entitlements = (customer["entitlements"] as? [String: Any])?["all"] as? [String: Any] ?? [:]
                let flow: Any = result.flow.map { flow -> [String: Any] in
                    [
                        "obtainedEntitlements": flow.obtainedEntitlements.sorted {
                            $0.entitlementInfo.identifier < $1.entitlementInfo.identifier
                        }.map { ["entitlementInfo": entitlements[$0.entitlementInfo.identifier] ?? NSNull()] },
                        "obtainedProducts": flow.obtainedProducts.sorted { $0.product.id < $1.product.id }.map {
                            // PHC exposes the product serializer through Package.dictionary. Use that
                            // serializer on the original product to preserve its billing plan and context.
                            let package = Package(identifier: $0.product.id, packageType: .custom,
                                                  storeProduct: $0.product, offeringIdentifier: "", webCheckoutUrl: nil)
                            return ["product": package.dictionary["product"] ?? NSNull()]
                        }
                    ]
                } ?? NSNull()
                self.sendEvent(withName: "Checkpoints-onPassed", body: [
                    "callId": callId, "result": ["flow": flow, "customer": customer]
                ])
            }
        }
    }

    @MainActor @objc func setErrorPresenterEnabled(_ enabled: Bool) {
        self.errorPresenterEnabled = enabled && !self.invalidated
        self.completePendingErrors()
    }

    @MainActor @objc func completeErrorPresentation(_ requestId: String) {
        self.errorCompletions.removeValue(forKey: requestId)?()
    }
    override func invalidate() {
        // Native UI can outlive a JS reload. Stop events immediately, even when teardown
        // starts off the main queue, before releasing main-actor error completions.
        self.invalidationLock.lock()
        self.didInvalidate = true
        self.invalidationLock.unlock()
        Task { @MainActor in
            self.errorPresenterEnabled = false
            self.completePendingErrors()
        }
        super.invalidate()
    }

    @MainActor private func completePendingErrors() {
        let completions = Array(self.errorCompletions.values)
        self.errorCompletions.removeAll()
        completions.forEach { $0() }
    }
}
