# SPMTestApp

A minimal iOS app based on the React Native 0.88 RC3 community template, with
its Xcode project already configured for Swift Package Manager. This version
includes React Native's fix for preserving library symlinks during autolinking
resyncs. The app imports the same test UI as `MaestroTestApp` from
[`../maestro/app`](../maestro/README.md). Build-only jobs leave the API key
placeholder intact; the separate Maestro job configures RevenueCat Test Store
and exercises the paywall purchase flow.

React Native CLI 21.0.0-alpha.1 discovers the SPM-configured project directly,
so the app has no Podfile. The CLI version is pinned alongside React Native.
This app is installed independently of the root Yarn workspace; the alpha CLI
is used only by this fixture.

The committed npm lockfile pins the app's React Native and tooling dependencies.
The SDKs are installed separately from freshly packed tarballs, so SDK changes
are tested without committing tarball integrity hashes or linking to the repo's
source. `react-native.config.js` explicitly autolinks these unsaved dependencies.

From the repository root:

```bash
yarn install
yarn build
yarn workspace react-native-purchases-ui prepare
mkdir -p build/spm-ci
yarn pack --out build/spm-ci/react-native-purchases.tgz
yarn workspace react-native-purchases-ui pack --out "$PWD/build/spm-ci/react-native-purchases-ui.tgz"

cd e2e-tests/SPMTestApp
npm ci --ignore-scripts --no-audit --no-fund
npm install --no-save --package-lock=false --legacy-peer-deps --ignore-scripts --no-audit --no-fund \
  ../../build/spm-ci/react-native-purchases.tgz ../../build/spm-ci/react-native-purchases-ui.tgz
cd ios
node ../node_modules/react-native/scripts/setup-apple-spm.js update --yes
FORCE_BUNDLING=1 RCT_NO_LAUNCH_PACKAGER=1 xcodebuild \
  -project SPMTestApp.xcodeproj -scheme SPMTestApp -configuration Release \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath ../build/DerivedData CODE_SIGNING_ALLOWED=NO ARCHS=arm64 ONLY_ACTIVE_ARCH=YES build
```

`--legacy-peer-deps` is needed only when installing the SDKs because their existing
React Native peer range excludes prereleases. Install scripts are disabled
because the tarballs already contain the SDKs' compiled JavaScript.

The `spm_ios` CircleCI job builds Debug and Release, rebuilds after touching
`package.json` to verify that autolinking preserves the SDK links, and checks the
JavaScript bundles and all six SDK bridge/view-manager classes in the app binaries.
To run interactively, open `ios/SPMTestApp.xcodeproj` after preparing dependencies.
Avoid CocoaPods in this app; the existing iOS CI jobs cover that integration.

The `run-maestro-e2e-tests-spm-ios` job uses the same preparation command as
`spm_ios`, injects the CI Test Store API key, builds Release with bundled
JavaScript, installs the app on an iPhone 17 simulator, and runs the shared flows
with `APP_ID=org.reactjs.native.example.SPMTestApp`. It uploads JUnit results and
Maestro debug artifacts. Keep injected keys out of commits.

This is a temporary native host. The CocoaPods removal PR after December 2, 2026
must move its SPM setup into `MaestroTestApp` and delete this directory, preserving
the existing Android tests. See the required consolidation steps in
[`../maestro/README.md`](../maestro/README.md#required-consolidation-when-cocoapods-support-is-removed).
