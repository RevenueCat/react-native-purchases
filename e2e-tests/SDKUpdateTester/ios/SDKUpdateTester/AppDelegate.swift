// Created by Antonio Pallares. Copyright (c) 2026 RevenueCat, Inc.
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
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
    return true
  }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else {
      fatalError("React Native factory was not initialized")
    }
    window = UIWindow(windowScene: windowScene)
    let arguments = ProcessInfo.processInfo.arguments
    var props: [String: Any] = [:]
    if let index = arguments.firstIndex(of: "-app_user_id_to_log_in"), index + 1 < arguments.count {
      props["app_user_id_to_log_in"] = arguments[index + 1]
    }
    factory.startReactNative(
      withModuleName: "SDKUpdateTester",
      in: window,
      initialProperties: props,
      launchOptions: nil
    )
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
