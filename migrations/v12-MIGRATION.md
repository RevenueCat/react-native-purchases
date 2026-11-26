## v12 Installation Changes

Starting with this major, RevenueCat's Apple dependencies are no longer published to CocoaPods. Swift Package Manager (SPM) is the supported way to integrate RevenueCat on Apple platforms.

Before upgrading, follow the [React Native CocoaPods-to-SPM migration guide](https://rev.cat/react-native-spm-migration). Migrate both the core and UI packages if your app uses RevenueCat UI.

### React Native and Expo compatibility

SPM availability and stability depend on the React Native and Expo versions your app uses. Follow the migration guide for the current framework requirements and recommendations.
