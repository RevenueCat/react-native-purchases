import React
import UIKit

@objc(RCCheckpointView)
class RCCheckpointView: UIView {
    private var storedSessionId: String?
    @objc var sessionId: String? {
        get { storedSessionId }
        set {
            guard storedSessionId != newValue else { return }
            // A mounted host view belongs to exactly one session.
            guard storedSessionId == nil else {
                onAttachmentFailed?([:])
                return
            }
            storedSessionId = newValue
            setNeedsLayout()
        }
    }
    @objc var onAttached: RCTDirectEventBlock?
    @objc var onAttachmentFailed: RCTDirectEventBlock?
    weak var bridge: RCTBridge?
    private var controller: UIViewController?
    private var attemptedAttachment = false

    override func layoutSubviews() {
        super.layoutSubviews()
        guard !attemptedAttachment, let sessionId = sessionId, window != nil,
              let onAttached = onAttached, let onAttachmentFailed = onAttachmentFailed else { return }
        attemptedAttachment = true
        guard let parent = parentViewController else {
            onAttachmentFailed([:])
            return
        }
        let module = bridge?.module(for: RNCheckpoints.self) as? RNCheckpoints
        guard let controller = module?.controller(forSessionId: sessionId),
              controller.parent == nil, controller.viewIfLoaded?.superview == nil else {
            onAttachmentFailed([:])
            return
        }
        self.controller = controller
        // Keep the native checkpoint controller and its existing delegate intact.
        parent.addChild(controller)
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        addSubview(controller.view)
        NSLayoutConstraint.activate([
            controller.view.topAnchor.constraint(equalTo: topAnchor),
            controller.view.bottomAnchor.constraint(equalTo: bottomAnchor),
            controller.view.leadingAnchor.constraint(equalTo: leadingAnchor),
            controller.view.trailingAnchor.constraint(equalTo: trailingAnchor)
        ])
        controller.didMove(toParent: parent)
        onAttached([:])
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        if window != nil { setNeedsLayout() }
        // Temporary window detachment is not final checkpoint dismissal.
    }

    deinit {
        if controller?.parent != nil { controller?.willMove(toParent: nil) }
        controller?.viewIfLoaded?.removeFromSuperview()
        controller?.removeFromParent()
    }
}

@objc(CheckpointViewManager)
class CheckpointViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool { true }

    override func view() -> UIView! {
        let view = RCCheckpointView()
        view.bridge = bridge
        return view
    }
}
