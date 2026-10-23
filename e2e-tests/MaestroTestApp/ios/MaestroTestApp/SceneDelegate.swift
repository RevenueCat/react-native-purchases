import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UIKit

class SceneDelegate: RCTDefaultReactNativeFactoryDelegate, UIWindowSceneDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    dependencyProvider = RCTAppDependencyProvider()
    reactNativeFactory = RCTReactNativeFactory(delegate: self)
    window = UIWindow(windowScene: windowScene)

    var props: [String: Any] = [:]
    if let testFlow = UserDefaults.standard.string(forKey: "e2e_test_flow") {
      props["e2e_test_flow"] = testFlow
    }

    reactNativeFactory?.startReactNative(
      withModuleName: "MaestroTestApp",
      in: window,
      initialProperties: props,
      connectionOptions: connectionOptions
    )
  }

  override func bundleURL() -> URL? {
    guard let url = Bundle.main.url(forResource: "main", withExtension: "jsbundle") else {
      fatalError("main.jsbundle not found. Make sure FORCE_BUNDLING=1 is set when building for CI.")
    }
    return url
  }
}
