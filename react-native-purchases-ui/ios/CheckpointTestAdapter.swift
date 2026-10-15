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
    private var completionCount = 0
    private var invalidated = false
    private var emit: ((String, [String: Any]) -> Void)?

    @objc(initWithEmit:)
    public init(emit: @escaping (String, [String: Any]) -> Void) {
        self.emit = emit
        super.init()
    }

    @objc(checkpoint:mode:useDefaultPresenter:)
    public func checkpoint(_ identifier: String, mode: String, useDefaultPresenter: Bool) {
        guard !invalidated, mode == "sheet" || mode == "fullscreen" else { return }
        let flowID = UUID()
        var handler: ErrorPresentationHandler?
        if !useDefaultPresenter {
            handler = { [weak self] params, completion in
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
                NSLog("[CheckpointTest native] presenter requestId=%@ flowCanContinue=%@ pending=%d completionCount=%d",
                      requestID, String(params.flowCanContinue), self.requests.count, self.completionCount)
                self.emit?("checkpointErrorForTest", [
                    "requestId": requestID,
                    "checkpointIdentifier": params.checkpointIdentifier,
                    "error": ["message": params.error.localizedDescription, "code": (params.error as NSError).code],
                    "flowCanContinue": params.flowCanContinue
                ])
            }
        }
        NSLog("[CheckpointTest native] start mode=%@ defaultPresenter=%@", mode, String(useDefaultPresenter))
        Purchases.shared.checkpoint(identifier,
                                   presentationMode: mode == "fullscreen" ? .modalFullScreen : .modalSheet,
                                   errorPresenter: handler) { [weak self] result in
            guard let self, !self.invalidated else { return }
            // onPassed is only one terminal path. Back/dismissal can suppress it; see evidence's API gap.
            self.requests = self.requests.filter { $0.value.flowID != flowID }
            NSLog("[CheckpointTest native] onPassed resultIsNull=%@ pending=%d completionCount=%d",
                  String(result == nil), self.requests.count, self.completionCount)
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
            NSLog("[CheckpointHost native] rejected requestId=%@", requestID)
            return false
        }
        request.host = host
        NSLog("[CheckpointHost native] present requestId=%@ from=%@", requestID, String(describing: type(of: controller)))
        host.present(from: controller)
        return true
    }

    private func cancel(_ requestID: String) {
        guard let request = requests.removeValue(forKey: requestID) else { return }
        NSLog("[CheckpointHost native] cancelled requestId=%@ pending=%d", requestID, requests.count)
        request.host?.dismiss(completion: {})
        emit?("checkpointErrorCancelledForTest", ["requestId": requestID])
    }

    // Lifecycle probe: emulate the app dismissing its native flow before an error is answered.
    @objc public func closeFlowForTest() {
        requests.values.first?.context?.viewController?.presentingViewController?.dismiss(animated: true)
    }

    @objc(complete:action:)
    public func complete(_ requestID: String, action: String) {
        let result: ErrorPresentationCompletion.Result
        switch action {
        case "RETRY": result = .retry
        case "CONTINUE": result = .continue
        case "NAVIGATE_BACK": result = .navigateBack
        default:
            NSLog("[CheckpointTest native] rejected unknown action requestId=%@ pending=%d", requestID, requests.count)
            return
        }
        guard let request = requests.removeValue(forKey: requestID) else {
            NSLog("[CheckpointTest native] ignored unknown requestId=%@ pending=%d completionCount=%d", requestID, requests.count, completionCount)
            return
        }
        completionCount += 1
        NSLog("[CheckpointTest native] completion requestId=%@ action=%@ pending=%d completionCount=%d",
              requestID, action, requests.count, completionCount)
        let finish = { [weak self] in
            guard request.context?.isValid != false else {
                NSLog("[CheckpointHost native] ignored ended requestId=%@", requestID)
                return
            }
            NSLog("[CheckpointHost native] complete after dismissal requestId=%@ action=%@", requestID, action)
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
        for (requestID, request) in outstanding {
            request.context?.onInvalidated = nil
            completionCount += 1
            NSLog("[CheckpointTest native] invalidate requestId=%@ action=NAVIGATE_BACK pending=0 completionCount=%d",
                  requestID, completionCount)
            let finish = { request.completion.complete(.navigateBack) }
            if let host = request.host {
                host.dismiss(completion: finish)
            } else {
                finish()
            }
        }
    }
}
