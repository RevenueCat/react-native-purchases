## v12 Installation Changes

Starting with this major, RevenueCat's Apple dependencies are no longer published to CocoaPods. Swift Package Manager (SPM) is the supported way to integrate RevenueCat on Apple platforms.

Before upgrading, follow the [React Native CocoaPods-to-SPM migration guide](https://rev.cat/react-native-spm-migration). Migrate both the core and UI packages if your app uses RevenueCat UI.

### React Native and Expo compatibility

Upgrade to React Native 0.88 or later before installing version 12. This minimum applies to iOS, Android, and web. Expo apps need SDK 58 or later. If you cannot upgrade React Native or Expo yet, stay on version 11 of the RevenueCat SDK.

Follow the migration guide for Swift Package Manager requirements and recommendations.
