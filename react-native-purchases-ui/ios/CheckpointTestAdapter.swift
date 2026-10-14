// Throwaway checkpoint ErrorPresenter runtime experiment. Not a public RN API.
import Foundation
import RevenueCat
@_spi(InviteOnlyCheckpointsApi) import RevenueCatUI

@available(iOS 15.0, *)
@MainActor
@objc(CheckpointTestAdapter)
public final class CheckpointTestAdapter: NSObject {
    private struct Request {
        let flowID: UUID
        let completion: ErrorPresentationCompletion
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
                self.requests[requestID] = Request(flowID: flowID, completion: completion)
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
        request.completion.complete(result)
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
            completionCount += 1
            NSLog("[CheckpointTest native] invalidate requestId=%@ action=NAVIGATE_BACK pending=0 completionCount=%d",
                  requestID, completionCount)
            request.completion.complete(.navigateBack)
        }
    }
}
