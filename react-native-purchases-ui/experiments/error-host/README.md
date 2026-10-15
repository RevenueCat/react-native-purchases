# Checkpoint error host prototype

This branch tests custom React error content above an SDK-presented iOS checkpoint paywall. It keeps the native paywall presentation unchanged. It does not fix React Native's standard `Modal` or introduce a public SDK API.

The consumer prototype is `examples/purchaseTesterTypescript/app/screens/ErrorPresentationHost.tsx`. Its content uses ordinary React views and buttons. The native view manager mounts those children in an over-fullscreen controller presented from the paywall associated with that specific error request. Native code dismisses the error controller before invoking the retained SDK completion.

## Native dependency

`native-sdk.patch` applies to purchases-ios **5.95.0**. It adds an internal SPI presentation context to error parameters, with a weak controller reference and invalidation when the native error is replaced, answered, or the flow ends. The patch covers both workflow and offering presenters. JavaScript only receives a request ID.

The RN adapter retains the context and completion under that ID. Native invalidation removes the retained request, dismisses its host, and notifies JavaScript. `onPassed` is not used as the sole cancellation signal.

This is an experimental native SDK change, not an API already available in released RevenueCatUI. The prototype requires the patched SDK to compile.

## Build and run

From the React Native repo root, create a separate checkout and apply the patch:

```sh
mkdir -p .context/error-host
git clone --depth 1 --branch 5.95.0 https://github.com/RevenueCat/purchases-ios.git .context/error-host/purchases-ios
git -C .context/error-host/purchases-ios apply "$PWD/react-native-purchases-ui/experiments/error-host/native-sdk.patch"
yarn build
```

Install Pods from the example's iOS directory, with the checkout's absolute path:

```sh
cd examples/purchaseTesterTypescript/ios
RC_ERROR_HOST_IOS_PATH="$(git rev-parse --show-toplevel)/.context/error-host/purchases-ios" pod install
```

Both RevenueCat and RevenueCatUI must resolve from that checkout. Hybrid Common remains at 19.12.0. Do not commit the generated local Podfile.lock paths. The example Podfile scopes React Native discovery to iOS to avoid scanning unrelated native projects during this experiment.

Start Metro from `examples/purchaseTesterTypescript` using `node node_modules/react-native/cli.js start --port 8081`, then build/run `PurchaseTester` in Xcode on an iOS 15+ simulator. Use the existing local Test Store configuration in `app/APIKeys.tsx`; never commit the key.

In the experiment screen:

1. Choose **Fresh test customer**, then **host**.
2. Start **Checkpoint sheet** or **Checkpoint fullscreen**.
3. Advance through the intro and tap the paywall's purchase button.
4. Choose **Test failed purchase** in Test Store.
5. Use Retry, Continue, or Navigate Back in the custom React panel.

The checkpoint identifier is `rn_error_presenter_test`. Its offering must have Test Store packages and a published workflow. The fixture used here was `golf`, product `moodly_premium_annual`, entitlement `moodly_premium`.

The **auto** selector answers Continue immediately without rendering UI. **modal** retains the original, failing standard RN Modal for comparison. **alert** and **overlay** retain the earlier experiment choices. The host option is iOS-only; Android hosting is unchanged.

The custom panel also includes **Close native flow (lifecycle probe)**. It dismisses the paywall and its presented UI from the paywall's presenting controller, without answering the error first. This is test plumbing for an app-driven terminal dismissal, not a proposed consumer API.

## Observed results

Tested on iPhone 17 Pro, iOS 26.4 simulator, RN 0.87.1/Fabric, actual Test Store purchase failures:

| Paywall mode | Retry | Continue | Navigate Back |
| --- | --- | --- | --- |
| Sheet | React panel closes; second valid purchase grants `moodly_premium` | Entire workflow closes; one callback with no entitlement | Returns to intro without checkpoint callback |
| Fullscreen | React panel closes; second valid purchase grants `moodly_premium` | Entire workflow closes; one callback with no entitlement | Returns to intro without checkpoint callback |

The panel is visible and responds to real taps in both modes. A fullscreen debugger snapshot shows the original React screen absent from the window and our error controller presented by `RCPaywallViewController`. Normal responses dismiss the error controller before invoking the SDK completion. Repeated completed IDs are ignored. Background/foreground preserved one sheet request, which was then retried successfully.

The no-UI callback path completed Continue without mounting a host. The app-driven terminal dismissal probe invalidated the context, dismissed the panel, removed the native/JS request, and ignored the late unmount response. It returned a null result from the interrupted native workflow; no error decision was fabricated.

Reload released its pending error request once with Navigate Back and removed the custom panel. **The multipage native workflow remained on its intro after reload.** This policy releases the error request; it does not cancel the whole checkpoint workflow. The app was restarted afterward to reset that still-active flow.

Build, root typecheck, focused screen typecheck, all 268 Jest tests, and the standalone context lifecycle probe passed. The complete purchases-ios test suite and Android runtime were not rerun. No public TS/browser API changed.

## Lifecycle probe

The standalone Swift probe checks weak ownership, one invalidation, late-observer notification, and rejection of presentation from an ended flow:

```sh
xcrun swiftc -parse-as-library -target arm64-apple-ios15.0-simulator \
  -sdk "$(xcrun --sdk iphonesimulator --show-sdk-path)" \
  .context/error-host/purchases-ios/RevenueCatUI/Checkpoints/ErrorPresentationContext.swift \
  react-native-purchases-ui/experiments/error-host/ContextLifecycleProbe.swift \
  -o .context/error-host/context-probe
xcrun simctl spawn <simulator-UDID> "$PWD/.context/error-host/context-probe"
```

Expected: `PASS: weak ownership, one invalidation, late observer, ended-flow rejection`.

## Scope and remaining work

This is disposable prototype code. It is not ready for release. The sample's unmount policy answers Navigate Back if a request is still active; that may return a multipage workflow to its previous step rather than cancel the whole flow. An invalidated native context drops a late response instead.

The host uses a dedicated Fabric touch handler when its children are Fabric views. Legacy view-manager `.m` files did not receive `RCT_NEW_ARCH_ENABLED` in this build, so relying on that macro initially selected the wrong touch handler. Detection now uses the mounted content. Legacy architecture behavior is not verified.

The patch has been exercised with actual workflow purchase errors on RN 0.87.1/Fabric, iOS 26.4 simulator. Physical devices, older RN/iOS versions, offering-only runtime errors, nonrecoverable errors, accessibility focus restoration, keyboard content, rotation, concurrent presentation transitions, and a production cancellation API still need validation. Presentation failure currently logs an explicit host failure and leaves the request available for cleanup; it does not invent a Continue decision.

Programmatically dismissing only the error controller, while leaving its owning paywall alive, is not handled as an automatic response. An early lifecycle probe exposed this case; the final terminal-flow probe correctly dismisses the entire flow from its parent. Host-only external dismissal remains a separate cleanup gap.

Local raw runtime logs and screenshots are under `.context/error-host/`. The source patch and this setup guide travel with the branch; credentials and raw logs do not.
