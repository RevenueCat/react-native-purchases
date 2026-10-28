// swift-tools-version: 5.9

// Experimental SwiftPM integration requires React Native 0.88 or later.

import PackageDescription

let package = Package(
    // Must match `swiftpmConfig.name` in package.json.
    name: "ReactNativePurchases",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "ReactNativePurchases", targets: ["ReactNativePurchases"]),
    ],
    dependencies: [
        // Resolved from the autolinker's ios/build/generated/autolinking/libs/<SwiftPM name>
        // symlink: four levels up reaches ios/build, where RN generates xcframeworks.
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(url: "https://github.com/RevenueCat/purchases-hybrid-common", exact: "20.1.0"),
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
            cSettings: [.headerSearchPath(".")]
        ),
    ]
)
