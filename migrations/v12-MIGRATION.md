## v12 Installation Changes

This major adopts Purchases Hybrid Common 21, which is no longer published to CocoaPods trunk. Swift Package Manager (SPM) is the supported way to integrate RevenueCat's Apple dependencies.

Before upgrading, follow the [React Native CocoaPods-to-SPM migration guide](https://rev.cat/react-native-spm-migration). Migrate both the core and UI packages if your app uses RevenueCat UI.

### Beta release policy

React Native 12 remains beta while React Native or Expo support for SPM is experimental. The final release requires stable SPM support and validated integration for both. Compatibility-breaking adaptations will stay within the beta period.

<!-- TODO: before the final React Native 12 release, verify stable RN/Expo SPM support and update this beta status. (SDK-4603) -->
