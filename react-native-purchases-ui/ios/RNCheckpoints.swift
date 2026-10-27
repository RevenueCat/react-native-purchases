import Foundation
import React
import PurchasesHybridCommon
@_spi(Internal) import RevenueCat
@_spi(InviteOnlyCheckpointsApi) @_spi(Internal) import RevenueCatUI

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
            let mode: FlowPresentationMode
            switch presentationMode {
            case "MODAL_FULL_SCREEN": mode = .modalFullScreen
            case "MODAL_SHEET": mode = .modalSheet
            default: mode = .default
            }
            Purchases.shared.checkpoint(identifier, customVariables: Self.variables(customVariables),
                                        presentationMode: mode) { [weak self] result in
                guard let self, !self.invalidated else { return }
                self.sendEvent(withName: "Checkpoints-onPassed", body: [
                    "callId": callId, "result": Self.serialize(result)
                ])
            }
        }
    }

    override func invalidate() {
        // Native UI can outlive a JS reload. Stop events immediately, even when teardown
        // starts off the main queue.
        self.invalidationLock.lock()
        self.didInvalidate = true
        self.invalidationLock.unlock()
#if RC_CHECKPOINT_EMBED_ENABLED
        if Thread.isMainThread {
            MainActor.assumeIsolated { self.cancelAllEmbedded() }
        } else {
            DispatchQueue.main.async { self.cancelAllEmbedded() }
        }
#endif
        super.invalidate()
    }

    @available(iOS 15.0, *)
    static func serialize(_ result: CheckpointResult) -> [String: Any] {
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
        return ["flow": flow, "customer": customer]
    }

    @available(iOS 15.0, *)
    static func variables(_ customVariables: [String: Any]?) -> [String: CustomVariableValue] {
        return (customVariables ?? [:]).compactMapValues { value -> CustomVariableValue? in
            if let number = value as? NSNumber {
                return CFGetTypeID(number) == CFBooleanGetTypeID()
                    ? .bool(number.boolValue) : .number(number.doubleValue)
            }
            if let string = value as? String { return .string(string) }
            return nil
        }
    }

    // MARK: - Experimental: SDK-owned embedded checkpoints
    //
    // The bridge resolves the view controller React Native is currently showing and hands it to
    // purchases-ios, which performs all UIKit containment. The bridge never adds, lays out, or removes
    // the native child; it only correlates callbacks with JS call and error request ids.

#if RC_CHECKPOINT_EMBED_ENABLED
    @MainActor private var embeddedCoordinator: AnyObject?

    @MainActor
    @available(iOS 15.0, *)
    private var coordinator: EmbeddedCheckpointCoordinator {
        if let coordinator = self.embeddedCoordinator as? EmbeddedCheckpointCoordinator { return coordinator }
        let coordinator = EmbeddedCheckpointCoordinator(
            isInvalidated: { [weak self] in self?.invalidated ?? true },
            sendEvent: { [weak self] body in self?.sendEvent(withName: "Checkpoints-embedded", body: body) }
        )
        self.embeddedCoordinator = coordinator
        return coordinator
    }

    @MainActor
    @objc(checkpointEmbedded:customVariables:callId:)
    func checkpointEmbedded(_ identifier: String, customVariables: [String: Any]?, callId: String) {
        guard !self.invalidated else { return }
        guard #available(iOS 15.0, *) else {
            NSLog("[RevenueCatUI] Embedded checkpoints require iOS 15.")
            return
        }
        self.coordinator.start(identifier, customVariables: customVariables, callId: callId)
    }

    @MainActor
    @objc(cancelEmbedded:)
    func cancelEmbedded(_ callId: String) {
        if #available(iOS 15.0, *) { self.coordinator.cancel(callId) }
    }

    @MainActor
    @objc(completeEmbeddedError:requestId:)
    func completeEmbeddedError(_ callId: String, requestId: String) {
        if #available(iOS 15.0, *) { self.coordinator.completeError(callId, requestId: requestId) }
    }

    @MainActor
    private func cancelAllEmbedded() {
        if #available(iOS 15.0, *) { (self.embeddedCoordinator as? EmbeddedCheckpointCoordinator)?.cancelAll() }
    }
#endif

}

#if RC_CHECKPOINT_EMBED_ENABLED
/// Correlates one JS `checkpointEmbedded` call with its native execution and pending error acknowledgements.
@MainActor
@available(iOS 15.0, *)
private final class EmbeddedCheckpointCoordinator {

    private final class Session {
        var execution: EmbeddedCheckpointExecution?
        var errors: [String: () -> Void] = [:]
        var finished = false
    }

    private let isInvalidated: () -> Bool
    private let sendEvent: ([String: Any]) -> Void
    private var sessions: [String: Session] = [:]

    init(isInvalidated: @escaping () -> Bool, sendEvent: @escaping ([String: Any]) -> Void) {
        self.isInvalidated = isInvalidated
        self.sendEvent = sendEvent
    }

    func start(_ identifier: String, customVariables: [String: Any]?, callId: String) {
        guard self.sessions[callId] == nil else { return }
        let session = Session()
        self.sessions[callId] = session
        guard Purchases.isConfigured else {
            self.fail(callId, message: "Configure Purchases before calling a checkpoint.")
            return
        }
        // The current React-owned controller: the root view's controller or an open <Modal>. A transient
        // alert (for example a Test Store purchase dialog) cannot contain a checkpoint.
        guard let parent = RCTPresentedViewController(), !(parent is UIAlertController),
              parent.isViewLoaded, parent.view.window != nil, !parent.isBeingDismissed else {
            self.fail(callId, message: "No presentable React Native view controller is on screen.")
            return
        }

        let execution = Purchases.shared.checkpoint(
            identifier,
            customVariables: Self.variables(customVariables),
            parentViewController: parent,
            errorPresenter: { [weak self, weak session] params, completion in
                guard let self, let session, !session.finished, !self.isInvalidated() else {
                    completion.complete()
                    return
                }
                let requestId = UUID().uuidString
                session.errors[requestId] = { completion.complete() }
                self.sendEvent([
                    "callId": callId, "type": "error", "requestId": requestId,
                    "kind": Self.kindName(params.kind),
                    "error": ErrorContainer(error: params.error, extraPayload: [:]).info
                ])
            },
            onPassed: { [weak self, weak session] result in
                guard let self, let session, !session.finished, !self.isInvalidated() else { return }
                self.sendEvent(["callId": callId, "type": "passed", "result": Self.serialize(result)])
            },
            onFinished: { [weak self] in
                self?.finish(callId)
            }
        )
        // onFinished may already have run synchronously (for example, an immediate failure).
        self.sessions[callId]?.execution = execution
    }

    func cancel(_ callId: String) {
        guard let session = self.sessions[callId] else { return }
        if let execution = session.execution {
            execution.cancel()
        } else {
            self.finish(callId)
        }
    }

    func completeError(_ callId: String, requestId: String) {
        self.sessions[callId]?.errors.removeValue(forKey: requestId)?()
    }

    func cancelAll() {
        for callId in Array(self.sessions.keys) {
            self.cancel(callId)
            // A JS reload cannot acknowledge anything; release what is left synchronously.
            self.finish(callId)
        }
    }

    private func fail(_ callId: String, message: String) {
        guard let session = self.sessions[callId] else { return }
        let error = NSError(domain: "RNCheckpoints", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
        let requestId = UUID().uuidString
        session.errors[requestId] = { [weak self] in self?.finish(callId) }
        self.sendEvent([
            "callId": callId, "type": "error", "requestId": requestId, "kind": "flowCouldNotBeShown",
            "error": ErrorContainer(error: error, extraPayload: [:]).info
        ])
    }

    private func finish(_ callId: String) {
        guard let session = self.sessions.removeValue(forKey: callId), !session.finished else { return }
        session.finished = true
        let pending = Array(session.errors.values)
        session.errors.removeAll()
        pending.forEach { $0() }
        session.execution = nil
        guard !self.isInvalidated() else { return }
        self.sendEvent(["callId": callId, "type": "finished"])
    }

    private static func kindName(_ kind: CheckpointFailureKind) -> String {
        switch kind {
        case .flowCouldNotBeShown: return "flowCouldNotBeShown"
        case .flowActionFailed: return "flowActionFailed"
        case .flowResultSyncFailed: return "flowResultSyncFailed"
        default: return "flowCouldNotBeShown"
        }
    }

    static func serialize(_ result: CheckpointResult) -> [String: Any] {
        return RNCheckpoints.serialize(result)
    }

    static func variables(_ customVariables: [String: Any]?) -> [String: CustomVariableValue] {
        return RNCheckpoints.variables(customVariables)
    }

}
#endif
