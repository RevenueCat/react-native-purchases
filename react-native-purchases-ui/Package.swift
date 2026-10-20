// swift-tools-version: 5.9

// Experimental SwiftPM integration requires React Native 0.88 or later.

import PackageDescription

let package = Package(
    // Must match `swiftpmConfig.name` in package.json.
    name: "ReactNativePurchasesUi",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "ReactNativePurchasesUi", targets: ["ReactNativePurchasesUi"]),
    ],
    dependencies: [
        // Resolved from the autolinker's ios/build/generated/autolinking/libs/<SwiftPM name>
        // symlink: four levels up reaches ios/build, where RN generates xcframeworks.
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
