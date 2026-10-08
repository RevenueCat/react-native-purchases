# SDK update tests

Created by Antonio Pallares.

This React Native app purchases the `no_paywall` offering's monthly package, granting `pro`.
Maestro installs a build using the released SDK, then installs a build using this checkout over it.
It compares screenshots of the app user ID and active entitlements for anonymous and logged-in users.

## Run locally

From the repository root, install the tools (`mise install`), Ruby gems (`bundle install`),
Maestro and the Android SDK or Xcode. Set `WORKFLOWS_TEST_STORE_API_KEY` to the
`Workflows Test Store` project's key.

Boot one Android emulator, then run:

```sh
bundle exec fastlane build_sdk_update_test_apps platform:android
bundle exec fastlane run_sdk_update_test platform:android test_case:anonymous_user
bundle exec fastlane run_sdk_update_test platform:android test_case:logged_in_user
```

For iOS, replace `android` with `ios` on a Mac with a booted simulator.
