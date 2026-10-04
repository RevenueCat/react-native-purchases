# SDK update tests

Created by Antonio Pallares.

This React Native app purchases the Workflows Test Store project's `no_paywall`
offering's monthly package (`$rc_monthly`, product `pro_monthly_subscription`),
which grants `pro`. CI supplies its `WORKFLOWS_TEST_STORE_API_KEY` through the
`maestro` context. The build lane writes the key into an ignored generated
`build-config.json`; keys must never be committed.

The build lane creates isolated `release` and `local` projects under
`build/sdk_update_tests/<platform>`. The released project installs the stable
version found by the shared release-discovery action from npm. The local project
installs a tarball packed from this checkout after `yarn build`. Both use stock
Metro resolution and React Native autolinking. The lane checks npm integrity,
the installed package and native wrapper versions, autolinking, and the resolved
hybrid-common dependency. Each SDK keeps its declared native dependencies.
`version.txt`, `source.txt`, dependency reports and build logs record what was
compiled; the app displays the verified React Native SDK version and source.

The test host uses React Native 0.85.3 and its minimum iOS version, 15.1. The lane
reuses the existing MaestroTestApp
native project scaffolding, with startup and Android build configuration matching
the 0.85.3 template, and replaces its UI with `App.tsx`. The two native entry points
only pass the current launch's `app_user_id_to_log_in` argument to React. Purchases and state are handled
through `react-native-purchases`. There is no automatic login after an update.
Customer info is fetched when opening the purchase screen, and purchase/login
results update it without a customer-info listener.

Both variants use `com.revenuecat.SDKUpdateTester`. Android copies the same
existing debug keystore into both projects and uses version codes 1 and 2.
Both apps contain their JavaScript bundle and run without Metro.

## Running locally

Install the repository's mise tools, Ruby gems, Android SDK/Xcode and Maestro.
Export the Workflows Test Store key, then build and run each platform:

```sh
bundle exec fastlane build_sdk_update_test_apps platform:ios
bundle exec fastlane run_sdk_update_test platform:ios test_case:anonymous_user
bundle exec fastlane run_sdk_update_test platform:ios test_case:logged_in_user

bundle exec fastlane build_sdk_update_test_apps platform:android
bundle exec fastlane run_sdk_update_test platform:android test_case:anonymous_user
bundle exec fastlane run_sdk_update_test platform:android test_case:logged_in_user
```

Boot only the target simulator/emulator. Android defaults to arm64 on an Apple
Silicon host and x86_64 elsewhere; `android_architectures` can override this.
`release_version` can select a particular published version.
Use Xcode 27.0, as in the SDK update CI jobs. React Native 0.85.3 includes the
updated `fmt` dependency required by newer Xcode compilers.

The seven YAML files in `../maestro/sdk_update_tests` are identical to the native
implementations. The shared runner installs the released app, purchases, installs
the local app over it, and compares cropped screenshots of the app user ID and
active entitlements. It starts each case/retry with clean app state, retries up to
three times, and records diagnostics for every attempt. Only the final attempt's
JUnit reports are submitted, under `fastlane/test_output/sdk_update_tests`.

## CI and coverage

Separate iOS and Android build jobs each build both variants. Separate run jobs
run the anonymous and logged-in cases in individual steps; the second runs even
if the first fails. Built apps move between jobs through workspaces and are never
published as artifacts. Only dependency/build reports and test diagnostics are
stored as artifacts. These jobs run with normal test/release gates, the existing
Maestro schedule, or pipeline parameter `action: sdk-update-tests`.

An online customer-info refresh can restore entitlements after a lost local
entitlement cache, so these tests do not prove offline cache survival. Stronger
cache assertions need to be agreed across the native and hybrid implementations
and added to their shared flows together.
