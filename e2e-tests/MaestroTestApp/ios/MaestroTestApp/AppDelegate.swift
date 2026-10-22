import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    var props: [String: Any] = [:]
    if let testFlow = UserDefaults.standard.string(forKey: "e2e_test_flow") {
      props["e2e_test_flow"] = testFlow
    }

    factory.startReactNative(
      withModuleName: "MaestroTestApp",
      in: window,
      initialProperties: props,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    guard let url = Bundle.main.url(forResource: "main", withExtension: "jsbundle") else {
      fatalError("main.jsbundle not found. Make sure FORCE_BUNDLING=1 is set when building for CI.")
    }
    return url
  }
}
