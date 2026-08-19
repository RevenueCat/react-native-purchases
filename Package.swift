// swift-tools-version: 6.0
//
//  Package.swift
//  react-native-purchases
//
//  Created by Antonio Pallares.
//
// Swift Package Manager support for React Native's experimental SwiftPM
// integration (React Native 0.87+). CocoaPods remains the supported default;
// see RNPurchases.podspec.
//
// `ReactNative` is the package React Native's autolinker generates into the
// consuming app at `ios/build/xcframeworks`. This manifest is reached through a
// symlink at `ios/build/generated/autolinking/libs/ReactNativePurchases`, which
// always sits at the same depth, so the relative path holds for any app layout.

import PackageDescription

let package = Package(
    name: "ReactNativePurchases",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "ReactNativePurchases", targets: ["ReactNativePurchases"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(url: "https://github.com/RevenueCat/purchases-hybrid-common", exact: "18.31.0"),
    ],
    targets: [
        .target(
            name: "ReactNativePurchases",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "PurchasesHybridCommon", package: "purchases-hybrid-common"),
            ],
            path: "ios",
            exclude: ["RNPurchases.xcodeproj", "strip-frameworks.sh"],
            publicHeadersPath: ".",
            cSettings: [.headerSearchPath(".")],
            linkerSettings: [
                .linkedFramework("Foundation"),
                .linkedFramework("UIKit"),
                .linkedFramework("StoreKit"),
            ]
        ),
    ]
)
