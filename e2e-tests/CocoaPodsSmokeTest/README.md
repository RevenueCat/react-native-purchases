# Internal Git-sourced CocoaPods smoke check

The existing bare React Native and Expo apps are the committed native skeletons.
CI replaces their screen with `App.js`, configures Purchases with a fake API key,
and asserts that `getAppUserID()` crosses the native bridge. UI bridge registration
and core/UI resource bundles are checked too. No backend credentials are needed.

Podfiles explicitly source all four RevenueCat/PHC pods from Git. Expo's `expo-build-properties`
configuration generates the same declarations on clean prebuild. CI generates the iOS
project once, installs its pods, then builds and launches the app.

SPM is the supported Apple installation route. This fixture exercises the internal
legacy workaround. The `update_hybrid_common` lane maintains the PHC and native tags.
