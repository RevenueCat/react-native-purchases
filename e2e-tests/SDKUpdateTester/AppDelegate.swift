// Created by Antonio Pallares. Copyright (c) 2026 RevenueCat, Inc.
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
    let arguments = ProcessInfo.processInfo.arguments
    var props: [String: Any] = [:]
    if let index = arguments.firstIndex(of: "-app_user_id_to_log_in"), index + 1 < arguments.count {
      props["app_user_id_to_log_in"] = arguments[index + 1]
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
    return bundleURL()
  }

  override func bundleURL() -> URL {
    guard let url = Bundle.main.url(forResource: "main", withExtension: "jsbundle") else {
      fatalError("main.jsbundle not found. Build with FORCE_BUNDLING=1.")
    }
    return url
  }
}
