// Prototype bridge for the current checkpoint ErrorPresenter API.
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
            guard let self, !self.invalidated, params.presentationContext?.isValid != false else {
                completion.complete()
                return
            }
            let requestID = UUID().uuidString
            self.requests[requestID] = Request(flowID: flowID, completion: completion, context: params.presentationContext)
            params.presentationContext?.onInvalidated = { [weak self] in
                self?.cancel(requestID)
            }
            let kind = params.kind == .flowActionFailed ? "flowActionFailed"
                : params.kind == .flowResultSyncFailed ? "flowResultSyncFailed" : "flowCouldNotBeShown"
            self.emit?("checkpointErrorForTest", [
                "requestId": requestID,
                "checkpointIdentifier": params.checkpointIdentifier,
                "error": ["message": params.error.localizedDescription, "code": (params.error as NSError).code],
                "kind": kind,
                "canHost": params.presentationContext?.viewController?.viewIfLoaded?.window != nil
            ])
        }
        Purchases.shared.checkpoint(identifier,
                                   presentationMode: mode == "fullscreen" ? .modalFullScreen : .modalSheet,
                                   errorPresenter: handler) { [weak self] result in
            guard let self, !self.invalidated else { return }
            self.requests = self.requests.filter { $0.value.flowID != flowID }
            self.emit?("checkpointPassedForTest", [
                "checkpointIdentifier": identifier,
                "obtainedEntitlementIdentifiers": result.flow.map {
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
        emit?("checkpointErrorCancelledForTest", ["requestId": requestID])
        finish(request)
    }

    @objc(complete:)
    public func complete(_ requestID: String) {
        guard let request = requests.removeValue(forKey: requestID) else { return }
        finish(request)
    }

    private func finish(_ request: Request) {
        // Even a stale request must complete its queue entry. The SDK ignores its old presentation ID.
        let complete = { request.completion.complete() }
        if let host = request.host {
            host.dismiss(completion: complete)
        } else {
            complete()
        }
    }

    @objc public func invalidate() {
        invalidated = true
        emit = nil
        let outstanding = requests
        requests.removeAll()
        for request in outstanding.values {
            request.context?.onInvalidated = nil
            finish(request)
        }
    }
}
