## RevenueCat SDK
### 💥 Breaking Changes

**Drop CocoaPods support.** RevenueCat’s iOS dependencies require Swift Package Manager. Migrate before upgrading or stay on 11.x. [React Native migration guide](https://rev.cat/react-native-spm-migration)

**Require React Native 0.88.** SDK 12 and its add-ons require React Native 0.88+ on all platforms. The 0.88 release improves the SwiftPM tooling used by the SDK on iOS. Expo apps require Expo SDK 58+.

**Change JavaScript packaging.** Metro and Re.Pack compile SDK TypeScript from `node_modules`. Custom Babel configurations must support this. Precompiled `dist` output, used by Jest and Node, targets ES2016.

**Make static `Purchases` methods non-enumerable.** `Object.keys(Purchases)` and `{...Purchases}` omit static methods. Mock them explicitly or use `jest.spyOn`.

### 📦 Dependency Updates
* Updates purchases-hybrid-common to 21.0.0 ([#94](https://github.com/RevenueCat/react-native-purchases_internal/pull/94)) via Antonio Pallares ([@ajpallares](https://github.com/ajpallares))
* Updates RevenueCat CircleCI orb to 4.15.0 ([#97](https://github.com/RevenueCat/react-native-purchases_internal/pull/97)) via [@RCGitBot](https://github.com/RCGitBot)

### 🔄 Other Changes
* Upgrade sample apps to React Native 0.88 ([#99](https://github.com/RevenueCat/react-native-purchases_internal/pull/99))
* Mirror main and release tags ([#100](https://github.com/RevenueCat/react-native-purchases_internal/pull/100))
* Add CircleCI success check ([#95](https://github.com/RevenueCat/react-native-purchases_internal/pull/95))
