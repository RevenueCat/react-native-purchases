// Author: Antonio Pallares
// EXPO_IOS_SWIFTPM=1 makes `expo prebuild` set up iOS with Swift Package
// Manager instead of CocoaPods (an Expo preview that needs React Native 0.88+).
module.exports = ({config}) => ({
  ...config,
  experiments: {
    ...config.experiments,
    swiftPackageManager: process.env.EXPO_IOS_SWIFTPM === '1',
  },
});
