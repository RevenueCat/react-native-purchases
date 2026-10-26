import UIKit
import React

private final class PaywallPortalContainerView: UIView {
    var onLeftWindow: (() -> Void)?

    // Empty areas pass touches through to the flow underneath.
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hit = super.hitTest(point, with: event)
        return hit === self ? nil : hit
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        if self.window == nil {
            self.onLeftWindow?()
        }
    }
}

private final class PaywallPortalHostView: RCTView {
    @objc var onAnchored: RCTDirectEventBlock?
    @objc var onHostDismissed: RCTDirectEventBlock?
    weak var bridge: RCTBridge?

    private var container: PaywallPortalContainerView?
    private weak var hostController: UIViewController?
    private var touchHandler: RCTTouchHandler?
    // Fabric is optional in source-built React Native versions. Resolve its touch handler
    // at runtime so the portal also builds with only React-Core on the legacy architecture.
    private var surfaceTouchHandler: UIGestureRecognizer?
    private static let attachTouchHandler = NSSelectorFromString("attachToView:")
    private static let detachTouchHandler = NSSelectorFromString("detachFromView:")
    private var detached = false
    private var retryScheduled = false
    private var children: [UIView] { self.reactSubviews() ?? [] }

    override func didUpdateReactSubviews() {
        self.placeChildren()
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        // Full-screen presentation temporarily removes the covered app view from its window.
        if self.window != nil {
            self.placeChildren()
        }
    }

    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        self.detached = self.superview == nil
        if self.detached {
            self.children.forEach { $0.removeFromSuperview() }
            self.tearDownContainer(notifying: false)
        } else {
            self.placeChildren()
        }
    }

    deinit {
        self.container?.onLeftWindow = nil
        if let container = self.container {
            self.touchHandler?.detach(from: container)
            self.surfaceTouchHandler?.perform(Self.detachTouchHandler, with: container)
            container.removeFromSuperview()
        }
    }

    // A Modal chooses its presenter as soon as it enters a window. Keep children detached
    // during transitions so they cannot choose the covered app's root controller.
    private func placeChildren() {
        guard !self.detached else { return }
        if let container = self.container,
           let host = self.hostController,
           host.presentingViewController != nil,
           !host.isBeingDismissed {
            self.addChildren(to: container)
            return
        }

        let top = RCTPresentedViewController()
        let presentedAboveUs = top?.presentingViewController != nil
            && top?.view.window != nil
            && !(top.map { self.isDescendant(of: $0.view) } ?? false)
        guard !self.children.isEmpty else {
            self.tearDownContainer(notifying: false)
            self.addChildren(to: self)
            return
        }

        let inTransition = top?.presentedViewController ?? top
        let settling = top?.isBeingPresented == true || top?.isBeingDismissed == true
            || top?.presentedViewController != nil || inTransition?.transitionCoordinator != nil
        if settling {
            self.children.forEach { $0.removeFromSuperview() }
            guard !self.retryScheduled else { return }
            self.retryScheduled = true
            let retry: () -> Void = { [weak self] in
                DispatchQueue.main.async { [weak self] in
                    self?.retryScheduled = false
                    self?.placeChildren()
                }
            }
            if let coordinator = inTransition?.transitionCoordinator {
                coordinator.animate(alongsideTransition: nil) { _ in retry() }
            } else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.05, execute: retry)
            }
            return
        }

        guard presentedAboveUs, let top else {
            self.tearDownContainer(notifying: false)
            self.addChildren(to: self)
            return
        }
        self.anchorIfNeeded(to: top)
        self.addChildren(to: self.container ?? self)
    }

    private func addChildren(to target: UIView) {
        for child in self.children where child.superview !== target {
            target.addSubview(child)
        }
        if target === self.container {
            self.ensureTouchHandler()
        }
    }

    private func anchorIfNeeded(to top: UIViewController) {
        guard top.view.window != nil, !self.isDescendant(of: top.view) else {
            self.tearDownContainer(notifying: false)
            return
        }
        guard self.container?.superview !== top.view else { return }
        self.tearDownContainer(notifying: false)

        let container = PaywallPortalContainerView(frame: top.view.bounds)
        container.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        container.backgroundColor = .clear
        container.onLeftWindow = { [weak self] in self?.handleHostDismissed() }
        top.view.addSubview(container)
        self.container = container
        self.hostController = top
        self.onAnchored?(["controller": NSStringFromClass(type(of: top))])
    }

    private func handleHostDismissed() {
        // A full-screen child Modal can temporarily take the host view out of its window.
        if let host = self.hostController,
           host.presentingViewController != nil,
           !host.isBeingDismissed {
            return
        }
        // Returning a still-visible Modal to the root window would present it again.
        self.children.forEach { $0.removeFromSuperview() }
        self.tearDownContainer(notifying: true)
    }

    private func tearDownContainer(notifying notify: Bool) {
        guard let container = self.container else { return }
        container.onLeftWindow = nil
        self.touchHandler?.detach(from: container)
        self.surfaceTouchHandler?.perform(Self.detachTouchHandler, with: container)
        container.removeFromSuperview()
        self.container = nil
        self.hostController = nil
        self.touchHandler = nil
        self.surfaceTouchHandler = nil
        if notify {
            self.onHostDismissed?(nil)
        }
    }

    private func ensureTouchHandler() {
        guard self.touchHandler == nil, self.surfaceTouchHandler == nil,
              let container = self.container,
              let firstChild = self.children.first else { return }
        if firstChild.responds(to: NSSelectorFromString("touchEventEmitterAtPoint:")),
           let handlerType = NSClassFromString("RCTSurfaceTouchHandler") as? NSObject.Type,
           let handler = handlerType.init() as? UIGestureRecognizer,
           handler.responds(to: Self.attachTouchHandler),
           handler.responds(to: Self.detachTouchHandler) {
            handler.perform(Self.attachTouchHandler, with: container)
            self.surfaceTouchHandler = handler
        } else {
            guard let bridge = self.bridge, let handler = RCTTouchHandler(bridge: bridge) else { return }
            handler.attach(to: container)
            self.touchHandler = handler
        }
    }
}

@objc(PaywallPortalViewManager)
final class PaywallPortalViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool { true }

    override func view() -> UIView! {
        let view = PaywallPortalHostView()
        view.bridge = self.bridge
        return view
    }
}
