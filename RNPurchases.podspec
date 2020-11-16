require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |spec|
  spec.name         = "RNPurchases"
  spec.summary      = "Cross-platform subscriptions framework for ReactNative"
  spec.version      = package['version']

  spec.authors      = package['author']
  spec.homepage     = "https://github.com/RevenueCat/react-native-purchases"
  spec.license      = package['license']
  spec.platform     = :ios, "9.0"

  spec.source       = { :git => "https://github.com/RevenueCat/react-native-purchases.git" }
  spec.source_files = "ios/**/*.{h,m,swift}"

  # Ignore the downloaded Purchases.framework
  spec.exclude_files = [
    "ios/Purchases.framework",
    "ios/PurchasesHybridCommon.framework"
  ]

  spec.dependency   "React-Core"
  spec.dependency   "PurchasesHybridCommon", '1.4.5'
  spec.swift_version    = '5.0'
end
