#!/usr/bin/env bash

# Builds the React Native SDK.
#
# Usage:
#   ./build.sh           Build the full SDK stack: JS/web, iOS, and Android.
#   ./build.sh ios       Install JS dependencies and pods, then build JS and the iOS example workspace.
#   ./build.sh android   Install JS dependencies, then build JS and Android.
#   ./build.sh web       Install JS dependencies, then build the web/Expo package.
#
# Valid platforms: ios, android, web

set -euo pipefail

usage() {
  echo "Usage: $0 [ios|android|web]"
}

if [ "$#" -gt 1 ]; then
  usage
  exit 1
fi

platform="${1:-}"

build_js_sdk() {
  yarn build
}

install_js_dependencies() {
  yarn
}

install_ios_dependencies() {
  yarn example pods
}

build_web_sdk() {
  yarn prepare-expo
}

is_xcpretty_installed() {
  command -v xcpretty >/dev/null 2>&1
}

compile_ios_sdk_and_purchase_tester() {
  if is_xcpretty_installed; then
    xcodebuild \
      -workspace examples/purchaseTesterTypescript/ios/PurchaseTester.xcworkspace \
      -scheme PurchaseTester \
      -configuration Debug \
      -sdk iphonesimulator \
      -destination "generic/platform=iOS Simulator" \
      build | xcpretty
  else
    xcodebuild \
      -workspace examples/purchaseTesterTypescript/ios/PurchaseTester.xcworkspace \
      -scheme PurchaseTester \
      -configuration Debug \
      -sdk iphonesimulator \
      -destination "generic/platform=iOS Simulator" \
      build
  fi
}

compile_android_sdk_and_purchase_tester() {
  (
    cd examples/purchaseTesterTypescript/android
    ./gradlew :react-native-purchases:assembleDebug
  )
}

case "$platform" in
  "")
    echo "About to build the RevenueCat React Native SDK for all platforms."
    yarn bootstrap
    compile_ios_sdk_and_purchase_tester
    compile_android_sdk_and_purchase_tester
    ;;
  ios)
    echo "About to build the RevenueCat React Native SDK for iOS only."
    install_js_dependencies
    install_ios_dependencies
    build_js_sdk
    compile_ios_sdk_and_purchase_tester
    ;;
  android)
    echo "About to build the RevenueCat React Native SDK for Android only."
    install_js_dependencies
    build_js_sdk
    compile_android_sdk_and_purchase_tester
    ;;
  web)
    echo "About to build the RevenueCat React Native SDK for web only."
    install_js_dependencies
    build_web_sdk
    ;;
  *)
    echo "Invalid platform: $platform"
    usage
    exit 1
    ;;
esac

echo "Done building the RevenueCat React Native SDK."
