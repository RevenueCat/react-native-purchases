Make sure react-native-purchases is not part of the examples package.json

Setup the development by running: 

    yarn run setup.example

That will link the local package so that changes are automatically applied to the example

---

- Plug a device and run:
`react-native run-android`
or 
`react-native run-ios`

---

To edit the iOS code, open the example project with XCode, there should be a subproject there RNPurchases.xcodeproj that can be used to edit the plugin. 
If touching common files, make sure you copy them to their repo after editing them, so that changes are not lost when re linking the plugin (since it will download the dependencies again and overwrite your changes). 
You can run the project from XCode without having to run `react-native run-ios`, but make sure that if you are touching `.ts` files, you run `npm run build` to compile the plugin.

In Android, the common code is uploaded to the repo. Make sure you commit the changes.

## Common issues

> ReferenceError: Module not registered in graph: /Users/cesardelavega/Development/repos/react-native/react-native-purchases/example/node_modules/@babel/runtime/helpers/get.js

Clean all the node_modules folders and restart the server

---

Make sure it's connected to the same wifi

---

Make sure the Android device doesn't have any app with the same package name you're running

---

Make sure your Android emulator has play services and you're logged in
