# Migrate an iOS app from CocoaPods to Swift Package Manager

Use this guide for a React Native Community CLI app that manages its own `ios/`
project. React Native's Swift Package Manager (SwiftPM) integration is
[experimental](https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/spm/__docs__/spm-scripts.md).
Expo Prebuild projects are outside this guide's scope.

## Prerequisites

- React Native **0.88.0 or later**, with its required Node.js and Xcode versions.
- An iOS deployment target of **15.1 or higher**, including any higher dependency minimum.
- React Native Purchases **v11 or later**. If using `react-native-purchases-ui`,
  install the matching version. Apply the [v11 API changes](v11-MIGRATION.md) separately.
- SwiftPM support in every React Native library. For libraries without a manifest,
  follow [React Native's guidance](https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/spm/__docs__/spm-scripts.md#community-packages-without-a-packageswift).
- A working CocoaPods build committed to version control. Keep CocoaPods installed
  for the conversion.

Install the SPM-aware CLI **in this app**, keeping its packages at the same version:

```sh
npm install --save-dev --save-exact \
  @react-native-community/cli@21.0.0-alpha.1 \
  @react-native-community/cli-platform-ios@21.0.0-alpha.1 \
  @react-native-community/cli-platform-android@21.0.0-alpha.1
```

Omit the Android package for an iOS-only app. Use your package manager's equivalent
command if needed. Run the following commands from the app root on macOS.

## 1. Convert the Xcode project

If your app manages CocoaPods through a `Gemfile`, run:

```sh
bundle exec npx react-native spm add --deintegrate
```

Otherwise, run `npx react-native spm add --deintegrate`.

RevenueCat autolinks from the installed npm packages. You don't need to scaffold
manifests or add RevenueCat packages manually in Xcode. Remove any previous manual
RevenueCat pod or framework integration for the migrated target.

## 2. Remove the old CocoaPods files

If other native dependencies still need CocoaPods, follow
[Keeping other pods](#keeping-other-pods) instead of this step.

Remove `ios/Podfile`, `ios/Podfile.lock`, and `ios/Pods/`. Remove the app-level
`.xcworkspace` only if CocoaPods was its sole purpose; keep custom workspaces.
Open the `.xcodeproj`, or your custom workspace. Update scripts and CI commands
that still reference the deleted CocoaPods workspace.

## 3. Build and verify

```sh
npx react-native run-ios
```

Also build Release and validate your release archive. In your existing test
environment, fetch offerings, complete a purchase, and open any paywall or
Customer Center your app uses. If you use Test Store keys, use them only in Debug.
The dependency-manager change doesn't require new API keys or purchase code.
Check Android too if you upgraded React Native or its CLI packages.

## 4. Update fresh-checkout and CI setup

After installing JavaScript dependencies, run this on macOS **before opening Xcode
or building**:

```sh
npx react-native spm update --yes
```

Add it to your iOS setup or CI steps in place of React Native's `pod install`.
Keep a separate pod installation if other pods remain. Avoid an unconditional
`postinstall` that also runs on Linux or Windows.

Commit the package-manager lockfile, Xcode project, `.spm-injected.json`, shared
scheme, and `.gitignore` changes. Keep generated `ios/build/` files ignored.
Verify a fresh checkout with dependency installation, the command above, and a build.

## Keeping other pods

<details>
<summary>Optional: retain non-React-Native CocoaPods dependencies</summary>

RN 0.88 removes directive lines from the Podfile, which can leave invalid Ruby.
Before running `pod install`, remove leftover `use_react_native!` arguments,
RN-only `require` statements, `react_native_post_install` calls, and references
to the removed `config` variable. Replace `min_ios_version_supported` with your
app's deployment target. Preserve setup required by the remaining pods.

From the app root, run `(cd ios && bundle exec pod install)`; omit `bundle exec`
if you don't use Bundler. Open the `.xcworkspace`. The remaining pods must not
pull in another copy of React Native or RevenueCat.

</details>
