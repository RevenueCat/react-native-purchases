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
  # Experiment: compile the embedded checkpoint bridge only against the local purchases-ios SPI.
  if ENV['RC_CHECKPOINT_LOCAL_DEPS'] == '1'
    spec.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES',
      'GCC_PREPROCESSOR_DEFINITIONS' => '$(inherited) RC_CHECKPOINT_EMBED_ENABLED=1',
      'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited) RC_CHECKPOINT_EMBED_ENABLED' }
  end

  spec.dependency   "React-Core"
  spec.dependency   "PurchasesHybridCommonUI", '19.17.0'
  spec.swift_version    = '5.7'
end
