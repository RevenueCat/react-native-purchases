// Created by Antonio Pallares. Copyright (c) 2026 RevenueCat, Inc.
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
    let arguments = ProcessInfo.processInfo.arguments
    var props: [String: Any] = [:]
    if let index = arguments.firstIndex(of: "-app_user_id_to_log_in"), index + 1 < arguments.count {
      props["app_user_id_to_log_in"] = arguments[index + 1]
    }
    self.initialProps = props
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return bundleURL()
  }

  override func bundleURL() -> URL {
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  }
}
