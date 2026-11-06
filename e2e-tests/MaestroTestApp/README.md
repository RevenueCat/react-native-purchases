# Maestro E2E Test App

A minimal React Native app used by Maestro end-to-end tests to verify RevenueCat SDK integration.

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

The custom presenter flows also accept a runtime key through the
`rc_test_api_key` launch argument, so local runs do not need a key in any source
file. Read `RC_TEST_API_KEY` from the macOS login Keychain and pass it through
Maestro's environment:

```bash
RC_TEST_API_KEY="$(security find-generic-password -s RC_TEST_API_KEY -w "$HOME/Library/Keychains/login.keychain-db")"
MAESTRO_RC_TEST_API_KEY="$RC_TEST_API_KEY" maestro --device DEVICE_ID test \
  e2e-tests/maestro/e2e_tests/checkpoint_custom_presenter_purchase.yaml
```

Run this from the repository root after installing the native app. An omitted
runtime key falls back to the existing CI placeholder substitution.

The Android app loads its bundled debug JavaScript, so a Metro server running in
another workspace cannot change which code the tests execute.

## RevenueCat Project

The test uses a RevenueCat project configured with:
- A **V2 Paywall** (the test asserts "Paywall V2" is visible)
- A `pro` entitlement (the test checks entitlement status after purchase)
- The **Test Store** environment for purchase confirmation

## Custom checkpoint presenter coverage

The `checkpoint_custom_presenter_*` Maestro flows use the existing
`donottouch_sdk_everyone` checkpoint and buy `pro_monthly_subscription` through
the real package received by the JS presenter. They cover purchasing before
explicit completion, navigating back and retrying, and completing app-owned UI
after its checkpoint owner unmounts. The latter then mounts a fresh owner and
checks that only its callback runs.

The harness keeps its callback counters outside the removable owner, so a late
callback from the old owner is observable. It removes the custom UI before
reporting its result to native. The same flows run in the existing Android and
iOS Maestro jobs, including SwiftPM; no separate CI configuration is needed.

## Dependencies

`react-native-pager-view` is pinned to 8.0.5 because version 9 and later use a
Compose pager on Android, which does not exercise the ViewPager2 detach regression.

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

## Swift Package Manager

The committed iOS project uses CocoaPods. The `run-maestro-e2e-tests-spm-ios`
CircleCI job converts a fresh checkout to SwiftPM with React Native's
`setup-apple-spm.js` and runs the same flows. That job differs from the CocoaPods
setup in three ways:

- It autolinks packed copies of the SDKs extracted outside the repository, selected
  by `MAESTRO_SPM_SDKS_DIR` in `react-native.config.js`. SwiftPM autolinking
  symlinks each library into `ios/build`, so linking the repository root would
  place a link to the repository inside itself.
- It generates a `Package.swift` for `react-native-screens`, which ships none,
  and adds the header search path its `<rnscreens/...>` imports need.
- It skips flows tagged `pager-view`, because SwiftPM cannot build
  `react-native-pager-view`.

Do not commit the converted project while CocoaPods is still supported.
