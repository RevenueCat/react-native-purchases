Make sure react-native-purchases is not part of the `example/package.json`

Setup the development by running: 

    `yarn bootstrap`

That will link the local package so that changes are automatically applied to the example

---

- Plug a device and run:
`yarn android`
or 
`yarn ios`


You can install Flipper https://fbflipper.com/docs/features/index in your machine as a helper for debugging. I don't think it works with physical iOS devices.

---

To edit the iOS code, open the example project with XCode, there should be a subproject there RNPurchases.xcodeproj that can be used to edit the plugin. 
If touching common files, you can point to your local project in the podspec. 
You can run the project from XCode without having to run `react-native run-ios`, but make sure that if you are touching `.ts` files, you run `npm run build` to compile the plugin.

In Android, if you are touching common files, you can run in `example/android` the following command `gradle enableLocalBuild -PcommonPath="$HOME/Development/repos/purchases-hybrid-common/android"`. Make sure you set the right path in your local machine. This will add the `purchases-hybrid-common` as a project that you can edit on the fly when opening the example project.

## Common issues

> ReferenceError: Module not registered in graph: /Users/cesardelavega/Development/repos/react-native/react-native-purchases/example/node_modules/@babel/runtime/helpers/get.js

Clean all the node_modules folders and restart the server

---

Make sure it's connected to the same wifi

---

Make sure the Android device doesn't have any app with the same package name you're running

---

Make sure your Android emulator has play services and you're logged in
