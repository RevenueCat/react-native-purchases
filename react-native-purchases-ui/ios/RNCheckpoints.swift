import Foundation
import React
import PurchasesHybridCommon
import PurchasesHybridCommonUI
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

    override static func requiresMainQueueSetup() -> Bool { true }

    override var methodQueue: DispatchQueue! { DispatchQueue.main }

    override func supportedEvents() -> [String]! {
        ["Checkpoints-onPassed", "Checkpoints-embedded"]
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
            Purchases.shared.checkpoint(identifier, customVariables: variables, presentationMode: mode) { [weak self] result in
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
        } else {
            NSLog("[RevenueCatUI] Checkpoints require iOS 15 or later.")
        }
    }

    override func invalidate() {
        // Native UI can outlive a JS reload. Stop events immediately, even when teardown
        // starts off the main queue.
        self.invalidationLock.lock()
        self.didInvalidate = true
        self.invalidationLock.unlock()
        if Thread.isMainThread {
            MainActor.assumeIsolated { self.cancelAllEmbedded() }
        } else {
            DispatchQueue.main.async { self.cancelAllEmbedded() }
        }
        super.invalidate()
    }

    // MARK: - Experimental: SDK-owned embedded checkpoints
    //
    // Only React's part lives here: which view controller React is showing, and relaying events.
    // PurchasesHybridCommonUI's EmbeddedCheckpointProxy owns sessions, error acknowledgements, and
    // serialization; purchases-ios owns the UIKit containment.

    @MainActor private var embeddedProxy: AnyObject?

    @MainActor
    @available(iOS 15.0, *)
    private var proxy: EmbeddedCheckpointProxy {
        if let proxy = self.embeddedProxy as? EmbeddedCheckpointProxy { return proxy }
        let proxy = EmbeddedCheckpointProxy { [weak self] event in
            guard let self, !self.invalidated else { return }
            self.sendEvent(withName: "Checkpoints-embedded", body: event)
        }
        self.embeddedProxy = proxy
        return proxy
    }

    @MainActor
    @objc(checkpointEmbedded:customVariables:callId:presentsErrors:)
    func checkpointEmbedded(_ identifier: String, customVariables: [String: Any]?, callId: String,
                            presentsErrors: Bool) {
        guard !self.invalidated, #available(iOS 15.0, *) else { return }
        // The controller React is showing: the root view's controller or an open <Modal>. Without a JS
        // error presenter the SDK shows its default error UI.
        self.proxy.start(callId: callId, identifier: identifier, customVariables: customVariables,
                         parentViewController: RCTPresentedViewController(), presentsErrors: presentsErrors)
    }

    @MainActor
    @objc(cancelEmbedded:)
    func cancelEmbedded(_ callId: String) {
        if #available(iOS 15.0, *) { self.proxy.cancel(callId: callId) }
    }

    @MainActor
    @objc(completeEmbeddedError:requestId:)
    func completeEmbeddedError(_ callId: String, requestId: String) {
        if #available(iOS 15.0, *) { self.proxy.completeError(callId: callId, requestId: requestId) }
    }

    @MainActor
    private func cancelAllEmbedded() {
        if #available(iOS 15.0, *) { (self.embeddedProxy as? EmbeddedCheckpointProxy)?.cancelAll() }
    }

}
