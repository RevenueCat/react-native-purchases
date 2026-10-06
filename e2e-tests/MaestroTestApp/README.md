# Maestro E2E Test App

A minimal React Native app used by Maestro end-to-end tests to verify RevenueCat SDK integration.

The test UI and flows are shared with the temporary iOS `SPMTestApp` host in
[`../maestro`](../maestro/README.md). The shared UI uses React state for its test
menu and configures Purchases before mounting the purchase screen.

## Prerequisites

- Node.js & Yarn
- Xcode (iOS) / Android Studio (Android)
- [Maestro](https://maestro.mobile.dev/) CLI
- CocoaPods (`gem install cocoapods`)

## Setup

```bash
yarn install
cd ios && pod install && cd ..
```

## Running Locally

```bash
# iOS
yarn ios

# Android
yarn android
```

## API Key

The app initialises RevenueCat with the placeholder `MAESTRO_TESTS_REVENUECAT_API_KEY`.
In CI, the Fastlane lane replaces this placeholder with the real key from the
`RC_E2E_TEST_API_KEY_PRODUCTION_TEST_STORE` environment variable (provided by the
CircleCI `e2e-tests` context) before building.

To run locally, either:
- Replace the placeholder in `App.tsx` with a valid API key (do **not** commit it), or
- Export the env var and run the same `sed` command the Fastlane lane uses.

## RevenueCat Project

The test uses a RevenueCat project configured with:
- A **V2 Paywall** (the test asserts "Paywall V2" is visible)
- A `pro` entitlement (the test checks entitlement status after purchase)
- The **Test Store** environment for purchase confirmation

## Dependencies

This app is part of the `react-native-purchases` Yarn workspace. It uses the same
local dependency mechanism as `examples/purchaseTesterTypescript`:
- **Babel module-resolver** aliases `react-native-purchases` and
  `react-native-purchases-ui` imports to the SDK source directories
- **Metro watchFolders** allows the bundler to access files outside the app's
  project root
- **Metro exclusionList** prevents duplicate peer dependency resolution between
  the app and the SDK's own `node_modules`

This ensures E2E tests always exercise the code on the current branch, not a
published npm version.

Type checking uses the SDKs' generated declarations. From the repository root,
run `yarn build` and `yarn workspace react-native-purchases-ui prepare` before
`yarn workspace MaestroTestApp build`.

## After CocoaPods removal

`MaestroTestApp` is the single long-term host, retaining Android and adopting
SwiftPM on iOS. The CocoaPods removal PR after December 2, 2026 must consolidate
the native hosts and delete `SPMTestApp`. Follow the required consolidation steps
in [`../maestro/README.md`](../maestro/README.md#required-consolidation-when-cocoapods-support-is-removed).
