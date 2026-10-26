# Migrate an iOS app from CocoaPods to Swift Package Manager

This guide covers the Swift Package Manager (SwiftPM) integration introduced in
React Native Purchases v11. Apply the [v11 API changes](v11-MIGRATION.md)
separately when upgrading the SDK.

React Native's SwiftPM support is still
[experimental and opt-in in RN 0.88](https://reactnative.dev/blog/2026/10/19/react-native-0.88).
The steps below target RN 0.88's tooling. Check the
[React Native SwiftPM guide](https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/spm/__docs__/spm-scripts.md)
when using a newer React Native version.

These steps use React Native Community CLI autolinking and an app-owned `ios/`
project. Expo apps need their framework's autolinking and native-project setup.
If using [Expo Prebuild/CNG](https://docs.expo.dev/workflow/continuous-native-generation/),
account for native project regeneration: a clean Prebuild can overwrite manual
Xcode changes. This guide does not cover automating that conversion with Expo.

## 1. Prepare the app

- Upgrade to **React Native 0.88.0 or later**, including its Node.js and Xcode
  requirements.
- Set the iOS deployment target to **15.1 or higher**, or the higher minimum
  required by another dependency.
- Install the SPM-enabled v11 SDK version you intend to use through npm or Yarn.
  If you use `react-native-purchases-ui`, install the matching version. Confirm
  that each installed RevenueCat package contains a root `Package.swift` before converting
  the native project.
- Check SwiftPM compatibility for your other native dependencies. RevenueCat's
  packages already include their manifests and need no scaffolding. For another
  library without a manifest, follow its migration instructions and React Native's
  [community package guidance](https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/spm/__docs__/spm-scripts.md#community-packages-without-a-packageswift).
- Commit a working CocoaPods integration before changing the native project.
  Keep CocoaPods available for the one-time deintegration step.

For apps without a Podfile, RN Community CLI **21.0.0-alpha.1** supports project
discovery. Install it locally in the app you are migrating, keeping the CLI
packages at matching versions:

```sh
npm install --save-dev --save-exact \
  @react-native-community/cli@21.0.0-alpha.1 \
  @react-native-community/cli-platform-ios@21.0.0-alpha.1
```

If the app also has Android, update its `@react-native-community/cli-platform-android`
dependency to the same CLI version. Use the equivalent commands for your package
manager and commit its lockfile.

## 2. Convert the existing Xcode project

From the app's root directory:

```sh
cd ios
npx react-native spm add --deintegrate
```

Use your project's Bundler environment if needed so that `pod` is available to
this command. It runs `pod deintegrate`, removes React Native directives from the
Podfile, and adds SwiftPM integration to the existing Xcode project.

React Native autolinks the RevenueCat manifests from the installed npm packages.
They declare PurchasesHybridCommon and its native SDK dependencies, so you do
not need to add separate RevenueCat packages in Xcode. Review any existing manual
RevenueCat pod declarations or framework links and remove duplicate integrations
for the migrated target.

Review the native project and Podfile changes before building. **RN 0.88's
Podfile cleanup removes matching lines, so multiline arguments and React
Native-specific hooks can remain.** If retaining a Podfile, remove leftover
`use_react_native!` arguments, RN-only `require` statements and
`react_native_post_install` calls, and references to the removed `config`
variable. Replace `min_ios_version_supported` with your app's explicit iOS
deployment target. Preserve configuration needed by your remaining pods.

## 3. Choose the project to build

### All native dependencies use SwiftPM

Remove the unused app-level `Podfile`, `Podfile.lock`, and `Pods/` directory.
If the app-level `.xcworkspace` existed only for CocoaPods, remove that workspace as
well so the CLI discovers the `.xcodeproj`. Keep custom workspaces that contain
other projects.

Open the app's **`.xcodeproj`**. Update local scripts and CI commands that still
build the old CocoaPods workspace.

Keep the SDKs' `.podspec` files inside their npm packages: React Native still
uses them for dependency discovery, including with SwiftPM.

### Some non-React-Native dependencies still use CocoaPods

After reviewing the remaining Podfile, run `pod install` in `ios/` and open the
app's **`.xcworkspace`**. React Native and RevenueCat must resolve through
SwiftPM; the remaining pods must not bring in a second copy of those libraries.
Check those dependencies' compatibility with this setup. See React Native's
[coexistence instructions](https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/spm/__docs__/spm-scripts.md#keeping-non-rn-pods).

## 4. Update fresh-checkout and CI setup

After installing JavaScript dependencies on a fresh checkout, run this from the
app's root **before opening Xcode or invoking `xcodebuild`**:

```sh
cd ios
npx react-native spm update --yes
```

This regenerates the local packages and downloads React Native artifacts.
Xcode's build-time sync cannot bootstrap a clean checkout because package
resolution happens first. Replace the React Native `pod install` setup step
with this command; retain a separate pod installation only if other pods remain.

Commit the changed Xcode project, its `.spm-injected.json` marker, shared schemes,
and the generated `.gitignore` changes. Leave generated packages, downloaded
XCFrameworks, and build outputs ignored. For details, see React Native's
[fresh-clone and CI instructions](https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/spm/__docs__/spm-scripts.md#fresh-clones--ci).

## 5. Validate the migration

Build and install a new iOS binary; a JavaScript reload or OTA update cannot
apply this native integration change.

- Build Debug and Release, and validate an archive for your release destination.
- Run your existing Purchases configuration, fetch offerings, complete a test
  purchase, and verify that customer entitlements update.
- If using `react-native-purchases-ui`, present your paywall and Customer Center
  and exercise the UI features your app uses.
- Validate Android as well if you upgraded React Native or shared CLI packages.

Use RevenueCat Test Store keys in **Debug** builds; those keys are blocked in
Release. Changing the iOS dependency manager does not require changing your
RevenueCat API keys, product identifiers, or JavaScript purchase/paywall calls.

## Troubleshooting

| Symptom                                                      | Check                                                                                                                                          |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| No iOS project found after removing the Podfile              | Check that the app uses the SPM-aware CLI version from step 1.                                                                                 |
| Missing `build/generated/autolinking` or local package paths | Run `spm update` before Xcode package resolution, including on CI.                                                                             |
| Missing manifest for a RevenueCat package                    | Confirm that the installed SDK version includes `Package.swift`; reinstall or upgrade it. Both RevenueCat packages supply their own manifests. |
| Duplicate symbols or React/RevenueCat linked twice           | Remove duplicate pod declarations or manual framework/package references for the migrated target.                                              |
| A package requires a newer iOS deployment target             | Raise the app target to the highest dependency minimum, then rerun `spm update`.                                                               |
| Invalid Podfile after conversion                             | Review the remaining multiline arguments and RN-specific hooks described in step 2 before running `pod install`.                               |

## Returning to CocoaPods

From `ios/`, run `npx react-native spm deinit`. Restore the pre-migration Podfile
and related native configuration from version control, then run `pod install`
and reopen the CocoaPods workspace. `deinit` removes the injected SwiftPM project
settings but does not restore the Podfile or CocoaPods integration for you.
