# Old Architecture Tester

A small React Native 0.81 app that autolinks `react-native-purchases` from this
repository and always builds with React Native's old architecture. React Native
0.82 removed the option to disable the New Architecture, so keep this app on the
0.81 release line until support for the old architecture is intentionally
dropped.

The app calls `Purchases.setLogLevel()` and `Purchases.isConfigured()` at launch.
The success marker is only shown after the exported native method is callable
through the legacy bridge, and the Maestro smoke test asserts that marker on
both platforms in CI.

## Run it

Install the repository dependencies first, then the app's pinned dependencies:

```bash
yarn install
cd examples/oldArchTester
yarn install
```

For Android:

```bash
yarn android
```

For iOS, install the pods once before running the app:

```bash
bundle install
cd ios
bundle exec pod install
cd ..
yarn ios
```

CI builds, installs, and launches both native projects, then runs
`maestro/bridge_smoke.yaml`. The architecture is pinned with
`newArchEnabled=false` in `android/gradle.properties` and
`RCT_NEW_ARCH_ENABLED=0` in the Podfile; do not remove those settings or upgrade
this app to React Native 0.82 or newer.
