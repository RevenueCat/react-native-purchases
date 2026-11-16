# Internal Git-sourced CocoaPods smoke check

The existing bare React Native and Expo apps are the committed native skeletons.
CI replaces their screen with `App.js`, configures Purchases with a fake API key,
and asserts that `getAppUserID()` crosses the native bridge. UI bridge registration
and core/UI resource bundles are checked too. No backend credentials are needed.

Podfiles explicitly source all four RevenueCat/PHC pods from Git. Expo's `expo-build-properties`
configuration restores the same declarations on clean prebuild; CI generates twice and
checks the Podfile is unchanged before installing/building the app.

SPM is the supported Apple installation route. This fixture exercises the internal
legacy workaround. Before merging `12.0-dev` into main, replace all PHC branch
references with its release tag (SDK-4603). Future PHC bumps maintain these pins
through `update_hybrid_common`.
