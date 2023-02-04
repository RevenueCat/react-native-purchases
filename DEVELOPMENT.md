Make sure react-native-purchases is not part of the `example/package.json`

Setup the development by running: 

```
yarn bootstrap
```

That will link the local package so that changes are automatically applied to the purchaseTesterTypescript example. MagicWeather will not point to the local package and will point to the latest release instead.

---

To run purchaseTesterTypescript on a device run the following from the root of the repository:

`yarn example android` or `npx example ios`

If you have a connected device, the app will run on that device. If not, it will run on a simulator. If you get issues when running iOS try opening the xcworkspace with xcode and build the project, it might point to what the error is, like for example a missing Team for signing.

You can install Flipper https://fbflipper.com/docs/features/index in your machine as a helper for debugging. I don't think it works with physical iOS devices.

MagicWeather should be run from its directory directly since it's a completely separate proyect. Do `yarn` to build the dependencies then `yarn pods` and `yarn ios` or `yarn android` to run it.

---

To edit the iOS code, open the example project with Xcode, there should be a subproject there RNPurchases.xcodeproj that can be used to edit the plugin. 
If touching common files, you can point to your local project in the podspec. 
You can run the project from Xcode without having to run `react-native run-ios` (or `yarn example ios` from the root). If you are touching `.ts` files, watchman should detect the changes and compile them automatically, or run `npm run build` to compile.

In Android, if you are touching common files, you can run in `examples/purchaseTesterTypescript/android` the following command `gradle enableLocalBuild -PcommonPath="$HOME/Development/repos/purchases-hybrid-common/android"`. Make sure you set the right path in your local machine. This will add the `purchases-hybrid-common` as a project that you can edit on the fly when opening the example project.

---

To update the `PurchasesHybridCommon` version, use `fastlane update_hybrid_common version:{new version}`

## Common issues

> ReferenceError: Module not registered in graph: ~/Development/repos/react-native/react-native-purchases/examples/purchaseTesterTypescript/node_modules/@babel/runtime/helpers/get.js

Clean all the node_modules folders and restart the server

---

Make sure it's connected to the same wifi

---

Make sure the Android device doesn't have any app with the same package name you're running

---

Make sure your Android emulator has play services and you're logged in
