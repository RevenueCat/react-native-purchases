import React
import UIKit
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
import PurchasesHybridCommonUI
#endif

@objc(RNCheckpoints)
class RNCheckpoints: RCTEventEmitter {
    // RCTInvalidating may run off the main method queue. Only this flag crosses queues.
    private let invalidationLock = NSLock()
    private var invalidated = false
    @MainActor private var checkpointProxy: AnyObject?

    override init() {
        super.init()
        // React Native constructs this module on main (requiresMainQueueSetup).
        MainActor.assumeIsolated { initializeCheckpoints() }
    }

    override init(disabledObservation: ()) {
        super.init(disabledObservation: disabledObservation)
        MainActor.assumeIsolated { initializeCheckpoints() }
    }

    @MainActor private func initializeCheckpoints() {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) {
            checkpointProxy = CheckpointProxy { [weak self] event in
                guard let self = self, !self.isInvalidated else { return }
                self.sendEvent(withName: "Checkpoints-event", body: event)
            }
        }
#endif
    }

    private var isInvalidated: Bool {
        invalidationLock.lock()
        defer { invalidationLock.unlock() }
        return invalidated
    }

    override static func requiresMainQueueSetup() -> Bool { true }
    override var methodQueue: DispatchQueue! { DispatchQueue.main }
    override func supportedEvents() -> [String]! { ["Checkpoints-event"] }
    override func constantsToExport() -> [AnyHashable: Any]! {
        let isSupported = MainActor.assumeIsolated { checkpointProxy != nil }
        return ["isSupported": isSupported]
    }

    @objc(start:identifier:customVariables:presentationMode:)
    @MainActor func start(_ sessionId: String, identifier: String,
                          customVariables: [String: Any], presentationMode: String) {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) {
            (checkpointProxy as? CheckpointProxy)?.start(sessionId: sessionId, identifier: identifier,
                customVariables: customVariables, presentationMode: presentationMode)
        }
#endif
    }

    @objc(controllerForSessionId:)
    @MainActor func controller(forSessionId sessionId: String) -> UIViewController? {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) {
            return (checkpointProxy as? CheckpointProxy)?.controller(sessionId: sessionId)
        }
#endif
        return nil
    }

    @objc(didPresent:)
    @MainActor func didPresent(_ sessionId: String) {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) { (checkpointProxy as? CheckpointProxy)?.didPresent(sessionId: sessionId) }
#endif
    }

    @objc(didFailToPresent:)
    @MainActor func didFailToPresent(_ sessionId: String) {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) { (checkpointProxy as? CheckpointProxy)?.didFailToPresent(sessionId: sessionId) }
#endif
    }

    @objc(didDismiss:)
    @MainActor func didDismiss(_ sessionId: String) {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) { (checkpointProxy as? CheckpointProxy)?.didDismiss(sessionId: sessionId) }
#endif
    }

    @objc(cancel:)
    @MainActor func cancel(_ sessionId: String) {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) { (checkpointProxy as? CheckpointProxy)?.cancel(sessionId: sessionId) }
#endif
    }

    @objc(completeError:requestId:)
    @MainActor func completeError(_ sessionId: String, requestId: String) {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) {
            (checkpointProxy as? CheckpointProxy)?.completeError(sessionId: sessionId, requestId: requestId)
        }
#endif
    }

    // Host teardown cannot receive Modal.onDismiss. Detach before releasing only its own session.
    @objc(releaseSession:)
    @MainActor func releaseSession(_ sessionId: String) {
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *), let proxy = checkpointProxy as? CheckpointProxy {
            let controller = proxy.controller(sessionId: sessionId)
            if controller?.parent != nil { controller?.willMove(toParent: nil) }
            controller?.viewIfLoaded?.removeFromSuperview()
            controller?.removeFromParent()
            proxy.cancel(sessionId: sessionId)
            proxy.didDismiss(sessionId: sessionId)
        }
#endif
    }

    override func invalidate() {
        invalidationLock.lock()
        invalidated = true
        invalidationLock.unlock()
        // JS may already be gone. Retain the module until main-queue cleanup completes.
        if Thread.isMainThread {
            MainActor.assumeIsolated { cleanup() }
        } else {
            DispatchQueue.main.async { self.cleanup() }
        }
        super.invalidate()
    }

    @MainActor private func cleanup() {
        let proxy = checkpointProxy
        checkpointProxy = nil
#if RC_CHECKPOINT_HOST_ENABLED && os(iOS) && !targetEnvironment(macCatalyst)
        if #available(iOS 15.0, *) { (proxy as? CheckpointProxy)?.invalidate() }
#endif
    }
}
