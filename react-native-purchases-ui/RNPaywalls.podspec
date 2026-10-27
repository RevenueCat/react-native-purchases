require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |spec|
  spec.name         = "RNPaywalls"
  spec.summary      = "Cross-platform subscriptions framework for ReactNative"
  spec.version      = package['version']

  spec.authors      = package['author']
  spec.homepage     = "https://github.com/RevenueCat/react-native-purchases"
  spec.license      = package['license']
  spec.platform     = :ios, "13.0"

  spec.source       = { :git => "https://github.com/RevenueCat/react-native-purchases.git" }
  spec.source_files = "ios/**/*.{h,m,swift}"
  spec.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }

  spec.dependency   "React-Core"
  # Experiment: an unpinned dependency lets the Podfile resolve a local purchases-hybrid-common checkout.
  if ENV['RC_CHECKPOINT_LOCAL_DEPS'] == '1'
    spec.dependency "PurchasesHybridCommonUI"
  else
    spec.dependency "PurchasesHybridCommonUI", '19.17.0'
  end
  spec.swift_version    = '5.7'
end
