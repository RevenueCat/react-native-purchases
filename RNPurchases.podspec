require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |spec|
  spec.name         = "RNPurchases"
  spec.summary      = "Cross-platform subscriptions framework for ReactNative"
  spec.version      = package['version']

  spec.authors      = package['author']
  spec.homepage     = "https://github.com/RevenueCat/react-native-purchases"
  spec.license      = package['license']
  spec.platforms     = {:ios => "11.0", :tvos => "11.0"}

  spec.source       = { :git => "https://github.com/RevenueCat/react-native-purchases.git" }
  spec.source_files = "ios/**/*.{h,m,swift}"
  spec.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }

  # Ignore the Purchases.framework that would get downloaded by the download script, meant for
  # developers who don't want to use Cocoapods
  spec.exclude_files = [
    "ios/Purchases.framework",
    "ios/PurchasesHybridCommon.framework",
    "ios/PurchasesHybridCommonUI.framework"
  ]

  spec.dependency   "React-Core"
  spec.dependency   "PurchasesHybridCommon", '11.1.1'
  spec.swift_version    = '5.7'
end
