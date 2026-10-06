#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
spm_work_dir="$(mktemp -d "${TMPDIR:-/tmp}/rc-spm-ci.XXXXXX")"
spm_app_dir="$spm_work_dir/app"
spm_derived_dir="$spm_work_dir/DerivedData"
mkdir -p "$repo_root/build/spm-ci"
spm_artifacts_dir="$(mktemp -d "$repo_root/build/spm-ci/run.XXXXXX")"

cd "$repo_root"
# Keep mise's selected Node version when the generated app is outside the repo.
spm_node_binary="$(node -p 'process.execPath')"
export PATH="$(dirname "$spm_node_binary"):$PATH"
yarn build
yarn workspace react-native-purchases-ui prepare
yarn pack --out "$spm_work_dir/react-native-purchases.tgz"
yarn workspace react-native-purchases-ui pack --out "$spm_work_dir/react-native-purchases-ui.tgz"

# Pin the stock template, including its RN 0.88 RC and React versions. RN 0.87
# recreated self-managed package symlinks during sync and cannot run this test.
cd "$spm_work_dir"
template_archive="$(npm pack @react-native-community/template@0.88.0-rc.3-ada64d0 --silent)"
tar -xzf "$template_archive"
node - "$spm_work_dir" <<'JS'
const fs = require('fs');
const path = require('path');
const workDir = process.argv[2];
const templateDir = path.join(workDir, 'package', 'template');
const appDir = path.join(workDir, 'app');
const template = JSON.parse(fs.readFileSync(path.join(templateDir, 'package.json'), 'utf8'));
fs.mkdirSync(appDir);
for (const file of ['ios', 'app.json', 'index.js', 'babel.config.js', 'metro.config.js']) {
  fs.cpSync(path.join(templateDir, file), path.join(appDir, file), { recursive: true });
}
const devDependencies = Object.fromEntries([
  '@babel/core', '@babel/runtime', '@react-native-community/cli',
  '@react-native-community/cli-platform-ios', '@react-native-community/cli-platform-android',
  '@react-native/babel-preset', '@react-native/metro-config',
].map(name => [name, template.devDependencies[name]]));
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify({
  name: template.name,
  version: '0.0.1',
  private: true,
  dependencies: {
    react: template.dependencies.react,
    'react-native': template.dependencies['react-native'],
    'react-native-purchases': 'file:../react-native-purchases.tgz',
    'react-native-purchases-ui': 'file:../react-native-purchases-ui.tgz',
  },
  devDependencies,
}, null, 2) + '\n');
fs.renameSync(path.join(appDir, 'ios', '_xcode.env'), path.join(appDir, 'ios', '.xcode.env'));
fs.writeFileSync(path.join(appDir, 'App.tsx'), `
import React from 'react';
import {Text} from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

export default function App() {
  return <Text>{typeof Purchases.configure} / {typeof RevenueCatUI.presentPaywall}</Text>;
}
`);
JS

cd "$spm_app_dir"
# npm excludes prerelease RN versions from the SDKs' existing >= 0.73 peer range.
# The SDK tarballs already contain compiled JS, so their prepare scripts are unnecessary.
npm install --legacy-peer-deps --ignore-scripts --no-audit --no-fund 2>&1 \
  | tee "$spm_artifacts_dir/npm-install.log"
cd ios
# Only deintegrate the stock template; never install pods in the consuming app.
node ../node_modules/react-native/scripts/setup-apple-spm.js add --deintegrate --yes 2>&1 \
  | tee "$spm_artifacts_dir/setup.log"

export RCT_NO_LAUNCH_PACKAGER=1
export FORCE_BUNDLING=1

build_app() {
  local configuration="$1"
  local build_name="$2"
  xcodebuild -project HelloWorld.xcodeproj -scheme HelloWorld \
    -configuration "$configuration" -sdk iphonesimulator \
    -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath "$spm_derived_dir" \
    -resultBundlePath "$spm_artifacts_dir/$build_name.xcresult" \
    -jobs 6 CODE_SIGNING_ALLOWED=NO ARCHS=arm64 ONLY_ACTIVE_ARCH=YES build 2>&1 \
    | tee "$spm_artifacts_dir/$build_name.log"

  local app_bundle="$spm_derived_dir/Build/Products/$configuration-iphonesimulator/HelloWorld.app"
  if [[ ! -s "$app_bundle/main.jsbundle" ]]; then
    echo "Missing JavaScript bundle in $app_bundle" >&2
    return 1
  fi
  local binary="$app_bundle/HelloWorld"
  if [[ -f "$app_bundle/HelloWorld.debug.dylib" ]]; then
    binary="$app_bundle/HelloWorld.debug.dylib"
  fi
  local symbols_file="$spm_artifacts_dir/$build_name-symbols.txt"
  xcrun nm -gj "$binary" > "$symbols_file"
  # Compiling a static library is insufficient: RN discovers these through Obj-C
  # registration, so make sure the app actually links every bridge/view manager.
  local native_class
  for native_class in RNPurchases RNPaywalls RNCustomerCenter PaywallViewManager \
    CustomerCenterViewManager RCPaywallFooterViewManager; do
    if ! grep -Fx "_OBJC_CLASS_\$_$native_class" "$symbols_file"; then
      echo "Missing native class $native_class in $binary" >&2
      return 1
    fi
  done
}

build_app Debug debug
build_app Release release

libs_dir="$spm_app_dir/ios/build/generated/autolinking/libs"
stat -f '%N %i' "$libs_dir/ReactNativePurchases" "$libs_dir/ReactNativePurchasesUi" \
  > "$spm_artifacts_dir/symlinks-before.txt"
touch "$spm_app_dir/package.json"
build_app Debug debug-resync
# Confirm the build actually ran the sync hook rather than reusing stale output.
grep -F 'SPM sync inputs changed' "$spm_artifacts_dir/debug-resync.log"
stat -f '%N %i' "$libs_dir/ReactNativePurchases" "$libs_dir/ReactNativePurchasesUi" \
  > "$spm_artifacts_dir/symlinks-after.txt"
diff -u "$spm_artifacts_dir/symlinks-before.txt" "$spm_artifacts_dir/symlinks-after.txt"
