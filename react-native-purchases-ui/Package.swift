// swift-tools-version: 5.9

// Experimental SwiftPM integration requires React Native 0.88 or later.

import PackageDescription

let package = Package(
    // Must match `swiftpmConfig.name` in package.json.
    name: "ReactNativePurchasesUI",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "ReactNativePurchasesUI", targets: ["ReactNativePurchasesUI"]),
    ],
    dependencies: [
        // Resolved from the autolinker's ios/build/generated/autolinking/libs/<SwiftPM name>
        // symlink: four levels up reaches ios/build, where RN generates xcframeworks.
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(url: "https://github.com/RevenueCat/purchases-hybrid-common", exact: "20.7.0"),
    ],
    targets: [
        .target(
            name: "RNCheckpointPresenterBridge",
            dependencies: [
                .product(name: "PurchasesHybridCommon", package: "purchases-hybrid-common"),
                .product(name: "PurchasesHybridCommonUI", package: "purchases-hybrid-common"),
            ],
            path: "ios",
            sources: ["RNCheckpointPresenterBridge.swift"]
        ),
        .target(
            name: "ReactNativePurchasesUI",
            dependencies: [
                "RNCheckpointPresenterBridge",
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "PurchasesHybridCommonUI", package: "purchases-hybrid-common"),
            ],
            path: "ios",
            exclude: ["RNPaywalls.xcodeproj", "RNCheckpointPresenterBridge.swift"],
            publicHeadersPath: ".",
            cSettings: [.headerSearchPath(".")]
        ),
    ]
)
