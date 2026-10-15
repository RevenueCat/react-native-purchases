// Standalone simulator probe. Compile together with the patched native context source.
import UIKit

@main
struct ContextLifecycleProbe {
    @MainActor
    static func main() {
        var controller: UIViewController? = UIViewController()
        let context = ErrorPresentationContext(viewController: controller)
        precondition(context.viewController === controller)
        controller = nil
        precondition(context.viewController == nil, "Context must not retain the paywall")

        var invalidations = 0
        context.onInvalidated = { invalidations += 1 }
        context.invalidate()
        context.invalidate()
        precondition(invalidations == 1, "Invalidation must be delivered once")
        precondition(!context.isValid)

        var lateInvalidations = 0
        context.onInvalidated = { lateInvalidations += 1 }
        precondition(lateInvalidations == 1, "Late subscribers must see invalidation")

        let owner = UIViewController()
        let active = ErrorPresentationContext(viewController: owner)
        active.invalidate()
        precondition(active.viewController == nil, "An ended flow must not remain presentable")
        print("PASS: weak ownership, one invalidation, late observer, ended-flow rejection")
    }
}
