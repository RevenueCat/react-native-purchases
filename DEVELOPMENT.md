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

---

### Expo Go Mock Mode

For a streamlined development experience in JavaScript-only environments, particularly **Expo Go**, the RevenueCat SDK includes a mock mode.

**Automatic Activation in Expo Go:**
This mock mode is **enabled automatically** when the SDK detects it is running within the Expo Go client environment. This means no manual setup is required to use the mock SDK when you are developing and testing your app with Expo Go.

**Manual Activation with Global Flag:**
You can also manually enable the mock mode in other JavaScript-only environments (or for specific testing scenarios outside of Expo Go detection) by setting a global variable *before* the RevenueCat SDK is imported:

```javascript
global.__EXPO_GO_MOCK_REVENUECAT__ = true;
```

If this flag is set to `true`, mock mode will be enabled even if an Expo Go environment is not detected. Note that if Expo Go *is* detected, mock mode will be active regardless of this flag's value (due to the automatic activation).

**Behavior in Mock Mode:**
When mock mode is active (either automatically via Expo Go detection or manually via the global flag):

*   **Core SDK (`react-native-purchases`):**
    *   All API calls will return sensible mock data (e.g., mock CustomerInfo, Offerings).
    *   No actual native purchasing modules will be called, preventing errors in environments where native code is not available or fully built.
*   **UI SDK (`react-native-purchases-ui`):**
    *   The `Paywall` component will render a placeholder UI instead of the native paywall.
    *   This placeholder allows you to simulate:
        *   A successful purchase.
        *   A cancelled purchase or an error.
        *   A restore operation.
    *   Methods like `presentPaywall()` will log their invocation but will not display a separate modal in mock mode; testing the visual paywall flow should be done using the `<Paywall />` component.

This setup allows you to test your RevenueCat integration's logic, API calls, and purchase/restore flows within Expo Go without needing to create a custom development build immediately.
