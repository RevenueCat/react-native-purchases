// Throwaway checkpoint ErrorPresenter runtime experiment. Not a public RN API.
import Foundation
import UIKit
import RevenueCat
@_spi(InviteOnlyCheckpointsApi) @_spi(Internal) import RevenueCatUI

@objc public protocol CheckpointErrorHostForTest: AnyObject {
    func present(from controller: UIViewController)
    func dismiss(completion: @escaping () -> Void)
}

@available(iOS 15.0, *)
@MainActor
@objc(CheckpointTestAdapter)
public final class CheckpointTestAdapter: NSObject {
    private final class Request {
        let flowID: UUID
        let completion: ErrorPresentationCompletion
        let context: ErrorPresentationContext?
        weak var host: CheckpointErrorHostForTest?

        init(flowID: UUID, completion: ErrorPresentationCompletion, context: ErrorPresentationContext?) {
            self.flowID = flowID
            self.completion = completion
            self.context = context
        }
    }
    private var requests: [String: Request] = [:]
    private var invalidated = false
    private var emit: ((String, [String: Any]) -> Void)?

    @objc(initWithEmit:)
    public init(emit: @escaping (String, [String: Any]) -> Void) {
        self.emit = emit
        super.init()
    }

    @objc(checkpoint:mode:)
    public func checkpoint(_ identifier: String, mode: String) {
        guard !invalidated, mode == "sheet" || mode == "fullscreen" else { return }
        let flowID = UUID()
        let handler: ErrorPresentationHandler = { [weak self] params, completion in
            guard let self, !self.invalidated else {
                // Explicit teardown policy: no JS runtime means navigate back, never Continue.
                completion.complete(.navigateBack)
                return
            }
            let requestID = UUID().uuidString
            self.requests[requestID] = Request(flowID: flowID, completion: completion, context: params.presentationContext)
            params.presentationContext?.onInvalidated = { [weak self] in
                self?.cancel(requestID)
            }
            self.emit?("checkpointErrorForTest", [
                "requestId": requestID,
                "checkpointIdentifier": params.checkpointIdentifier,
                "error": ["message": params.error.localizedDescription, "code": (params.error as NSError).code],
                "flowCanContinue": params.flowCanContinue
            ])
        }
        Purchases.shared.checkpoint(identifier,
                                   presentationMode: mode == "fullscreen" ? .modalFullScreen : .modalSheet,
                                   errorPresenter: handler) { [weak self] result in
            guard let self, !self.invalidated else { return }
            // Native context invalidation also handles terminal paths that suppress this callback.
            self.requests = self.requests.filter { $0.value.flowID != flowID }
            self.emit?("checkpointPassedForTest", [
                "checkpointIdentifier": identifier,
                "obtainedEntitlementIdentifiers": result.map {
                    $0.obtainedEntitlements.map { $0.entitlementInfo.identifier }.sorted() as Any
                } ?? NSNull()
            ])
        }
    }

    @objc(attachHost:requestID:)
    public func attachHost(_ host: CheckpointErrorHostForTest, requestID: String) -> Bool {
        guard let request = requests[requestID], let context = request.context,
              context.isValid, let controller = context.viewController,
              controller.viewIfLoaded?.window != nil, request.host == nil else {
            return false
        }
        request.host = host
        host.present(from: controller)
        return true
    }

    private func cancel(_ requestID: String) {
        guard let request = requests.removeValue(forKey: requestID) else { return }
        request.host?.dismiss(completion: {})
        emit?("checkpointErrorCancelledForTest", ["requestId": requestID])
    }

    @objc(complete:action:)
    public func complete(_ requestID: String, action: String) {
        let result: ErrorPresentationCompletion.Result
        switch action {
        case "RETRY": result = .retry
        case "CONTINUE": result = .continue
        case "NAVIGATE_BACK": result = .navigateBack
        default:
            return
        }
        guard let request = requests.removeValue(forKey: requestID) else {
            return
        }
        let finish = { [weak self] in
            guard request.context?.isValid != false else {
                return
            }
            // The bridge may invalidate while native dismissal is in flight.
            request.completion.complete(self?.invalidated == false ? result : .navigateBack)
        }
        if let host = request.host {
            host.dismiss(completion: finish)
        } else {
            finish()
        }
    }

    @objc public func invalidate() {
        invalidated = true
        emit = nil
        let outstanding = requests
        requests.removeAll()
        // No global presenter is registered. Per-call closures capture this adapter weakly.
        // Explicit experiment policy: release requests first, then navigate back once per original completion.
        // This may leave a multi-step flow on its previous step; it is not a general flow-cancellation API.
        for request in outstanding.values {
            request.context?.onInvalidated = nil
            let finish = { request.completion.complete(.navigateBack) }
            if let host = request.host {
                host.dismiss(completion: finish)
            } else {
                finish()
            }
        }
    }
}
