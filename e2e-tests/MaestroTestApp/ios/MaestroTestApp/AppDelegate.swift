import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.moduleName = "MaestroTestApp"
    self.dependencyProvider = RCTAppDependencyProvider()

    var props: [String: Any] = [:]
    if let testFlow = UserDefaults.standard.string(forKey: "e2e_test_flow") {
      props["e2e_test_flow"] = testFlow
    }
    self.initialProps = props
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return bundleURL()
  }

  override func bundleURL() -> URL {
    guard let url = Bundle.main.url(forResource: "main", withExtension: "jsbundle") else {
      fatalError("main.jsbundle not found. Make sure FORCE_BUNDLING=1 is set when building for CI.")
    }
    return url
  }
}
