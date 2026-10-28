import Foundation
import React
import PurchasesHybridCommonUI

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
        ["Checkpoints-onPassed"]
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
        CheckpointProxy.present(
            identifier: identifier,
            customVariables: customVariables,
            presentationMode: presentationMode,
            onPassed: { [weak self] result in
                guard let self, !self.invalidated else { return }
                self.sendEvent(withName: "Checkpoints-onPassed", body: ["callId": callId, "result": result])
            },
            // PurchasesHybridCommonUI already logs why the checkpoint could not start.
            onError: { _, _ in }
        )
    }

    override func invalidate() {
        // Native UI can outlive a JS reload. Stop events immediately, even when teardown
        // starts off the main queue.
        self.invalidationLock.lock()
        self.didInvalidate = true
        self.invalidationLock.unlock()
        super.invalidate()
    }

}
