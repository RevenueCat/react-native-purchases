# Custom React content above a checkpoint paywall

This prototype adds an optional `ErrorPresentationHost` for iOS. It presents ordinary React children from the native paywall that owns the error. The native paywall keeps its existing presentation mode.

## Consumer

The example screen subscribes to native error requests and renders:

```tsx
<ErrorPresentationHost
  key={pendingError.requestId}
  request={pendingError}
  onClosed={() => setPendingError(null)}
  onError={setStatus}
>
  {({complete}) => (
    <MyErrorPanel message={pendingError.error.message} onDone={complete} />
  )}
</ErrorPresentationHost>
```

Keep the host mounted until `onClosed`. Native code dismisses the panel before calling `ErrorPresentationCompletion.complete()`. The current iOS API reports that error presentation is finished; the SDK chooses the workflow outcome. It does not accept Retry, Continue, or Navigate Back. Handlers that do not need UI can complete directly without mounting a host.

## How the request finds its paywall

1. The patched iOS SDK supplies a presentation context alongside the error. It holds a weak reference to the owning paywall controller.
2. `CheckpointTestAdapter.swift` stores that context and the SDK completion under a request ID. JavaScript receives the ID and error details.
3. `ErrorPresentationHost.tsx` creates a native host with that ID and the consumer's React children.
4. `CheckpointErrorHostViewManager.m` looks up the request and presents its children from that specific paywall controller.
5. A response dismisses the host, then invokes the original SDK completion. Native invalidation removes a stale request and closes its host.

These are prototype components and bridge methods, not public SDK APIs. The native context lives in [purchases-ios#8044](https://github.com/RevenueCat/purchases-ios/pull/8044), based on the current native API. That PR preserves `CheckpointFailureKind`, parameterless completion, and `CheckpointResult.flow`.

## Run the example

The iOS companion branch is required to compile this prototype. From the repo root, use a fresh checkout path:

```sh
mkdir -p .context/error-host
git clone --depth 1 --branch cesar/checkpoint-error-presentation-context https://github.com/RevenueCat/purchases-ios.git .context/error-host/purchases-ios
# Local CocoaPods metadata only: Hybrid Common 19.12.0 pins both SDK pods to 5.95.0.
ruby -pi -e 'gsub(/5\.96\.0-SNAPSHOT/, "5.95.0")' .context/error-host/purchases-ios/{RevenueCat,RevenueCatUI}.podspec
yarn build
cd examples/purchaseTesterTypescript/ios
RC_ERROR_HOST_IOS_PATH="$(git rev-parse --show-toplevel)/.context/error-host/purchases-ios" pod install
```

Both RevenueCat pods must resolve from that checkout. The temporary podspec version override satisfies the existing Hybrid Common pin without changing SDK source or shipping dependency versions. Keep those local podspec edits, generated Podfile.lock paths, and the Test Store key in `app/APIKeys.tsx` out of commits.

Start Metro from `examples/purchaseTesterTypescript` with `node node_modules/react-native/cli.js start --port 8081`. Build/run `PurchaseTester` in Xcode on an iOS 15+ simulator.

The example opens the error screen by default. Choose **Fresh test customer**, **Custom React host**, then **Open sheet** or **Open fullscreen**. Advance to the purchase page and choose **Test failed purchase** in Test Store.

The checkpoint `rn_error_presenter_test` needs a published workflow with Test Store packages. The tested fixture uses offering `golf` and entitlement `moodly_premium`.

Alert, React Native Modal, in-tree overlay, and no-UI options remain available for comparison. Errors without an owning paywall, such as startup or post-flow synchronization errors, fall back to Alert when host mode is selected. Android retains the older three-decision bridge and has no custom host implementation.

## Validation and limits

The current API passed 129 iOS simulator tests across the presenters, error queue/checkpoint manager, outcomes, and default error presenter. New integration checks cover the owning controller, completion/dismissal invalidation, and an old completion arriving while a replacement error is active. The React Native app builds against this branch. With real Test Store failures, the custom panel appeared and accepted Done in both sheet and fullscreen. Done dismissed the panel and left the purchase page usable. A second sheet error was presented successfully, and a subsequent valid fullscreen purchase granted `moodly_premium`.

The earlier 5.95.0 prototype was tested with real purchase failures in sheet and fullscreen on RN 0.87.1/Fabric and an iOS 26.4 simulator. Its three-decision results do not describe the new completion-only API.

This does not fix React Native's standard `Modal`. It presents from the owning paywall instead. In-tree overlays remain behind the native flow on both platforms.

Unmount/reload finishes the pending error presentation after dismissing its host. It does not select a navigation outcome or explicitly cancel the checkpoint. Cancelled requests also complete their serialized queue entry; the SDK rejects their stale presentation IDs. Dismissing only the error controller externally remains a cleanup gap. Presentation failures surface through `onError` and leave the request for cleanup.

Physical devices, older RN/iOS versions, the legacy architecture, offering-only flows, nonrecoverable errors, accessibility focus restoration, keyboard content, rotation, and presentation races need validation. `ContextLifecycleProbe.swift` checks weak ownership and invalidation independently of React Native.
