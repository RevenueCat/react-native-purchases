// swift-tools-version: 6.0
//
//  Package.swift
//  react-native-purchases-ui
//
//  Created by Antonio Pallares.
//
// Swift Package Manager support for React Native's experimental SwiftPM
// integration, which requires React Native 0.88 or later: 0.87 recreated a
// library's package root on every sync, breaking the Xcode build of any app
// using a library that ships its own manifest. CocoaPods remains the supported
// default; see RNPaywalls.podspec.
//
// `ReactNative` is the package React Native's autolinker generates into the
// consuming app at `ios/build/xcframeworks`. The autolinker reaches a library
// that manages its own manifest through a symlink at
// `ios/build/generated/autolinking/libs/<SwiftPM name>`, and SwiftPM resolves
// relative package paths against that symlink rather than against
// `node_modules`. Four levels up is always `ios/build`, so this path holds
// whatever layout the app uses.
//
// The SwiftPM name below is declared in package.json as `swiftpmConfig.name`.
// Without it React Native would derive the name from RNPaywalls.podspec and
// look for a package named after the pod instead.

import PackageDescription

let package = Package(
    name: "ReactNativePurchasesUi",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "ReactNativePurchasesUi", targets: ["ReactNativePurchasesUi"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(url: "https://github.com/RevenueCat/purchases-hybrid-common", exact: "19.6.0"),
    ],
    targets: [
        .target(
            name: "ReactNativePurchasesUi",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "PurchasesHybridCommonUI", package: "purchases-hybrid-common"),
            ],
            path: "ios",
            exclude: ["RNPaywalls.xcodeproj"],
            publicHeadersPath: ".",
            cSettings: [.headerSearchPath(".")],
            linkerSettings: [
                .linkedFramework("Foundation"),
                .linkedFramework("UIKit"),
                .linkedFramework("CoreGraphics"),
                .linkedFramework("SwiftUI"),
            ]
        ),
    ]
)
