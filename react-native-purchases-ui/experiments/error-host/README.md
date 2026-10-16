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
  {({respond}) => (
    <MyErrorPanel
      message={pendingError.error.message}
      onRetry={() => respond('RETRY')}
      onContinue={() => respond('CONTINUE')}
      onBack={() => respond('NAVIGATE_BACK')}
    />
  )}
</ErrorPresentationHost>
```

Keep the host mounted until `onClosed`. Native code dismisses the panel before completing the SDK error request. Error handlers that do not need UI can respond directly without mounting a host.

## How the request finds its paywall

1. The patched iOS SDK supplies a presentation context alongside the error. It holds a weak reference to the owning paywall controller.
2. `CheckpointTestAdapter.swift` stores that context and the SDK completion under a request ID. JavaScript receives the ID and error details.
3. `ErrorPresentationHost.tsx` creates a native host with that ID and the consumer's React children.
4. `CheckpointErrorHostViewManager.m` looks up the request and presents its children from that specific paywall controller.
5. A response dismisses the host, then invokes the original SDK completion. Native invalidation removes a stale request and closes its host.

These are prototype components and bridge methods, not public SDK APIs. The native context is an experimental SPI added by `native-sdk.patch`.

## Run the example

The patch applies to purchases-ios **5.95.0** and is required to compile this branch. From the repo root:

```sh
mkdir -p .context/error-host
git clone --depth 1 --branch 5.95.0 https://github.com/RevenueCat/purchases-ios.git .context/error-host/purchases-ios
git -C .context/error-host/purchases-ios apply "$PWD/react-native-purchases-ui/experiments/error-host/native-sdk.patch"
yarn build
cd examples/purchaseTesterTypescript/ios
RC_ERROR_HOST_IOS_PATH="$(git rev-parse --show-toplevel)/.context/error-host/purchases-ios" pod install
```

Both RevenueCat pods must resolve from that checkout. Keep the generated local Podfile.lock paths and Test Store key in `app/APIKeys.tsx` out of commits.

Start Metro from `examples/purchaseTesterTypescript` with `node node_modules/react-native/cli.js start --port 8081`. Build/run `PurchaseTester` in Xcode on an iOS 15+ simulator.

The example opens the error screen by default. Choose **Fresh test customer**, **Custom React host**, then **Open sheet** or **Open fullscreen**. Advance to the purchase page and choose **Test failed purchase** in Test Store.

The checkpoint `rn_error_presenter_test` needs a published workflow with Test Store packages. The tested fixture uses offering `golf` and entitlement `moodly_premium`.

Alert, React Native Modal, in-tree overlay, and no-UI options remain available for comparison. Android uses the existing bridge and has no custom host implementation.

## Validation and limits

The host was tested with real purchase failures on RN 0.87.1/Fabric and an iOS 26.4 simulator, in sheet and fullscreen:

- Retry dismissed the error panel and allowed a subsequent successful purchase.
- Continue ended the workflow without granting access.
- Navigate Back returned to the previous workflow page.
- Closing the owning native flow invalidated the pending request and dismissed the panel.

This does not fix React Native's standard `Modal`. It presents from the owning paywall instead. In-tree overlays remain behind the native flow on both platforms.

The prototype unmount/reload policy answers Navigate Back. A multipage workflow can remain on its previous page afterward. Dismissing only the error controller externally is still a cleanup gap. Presentation failures surface through `onError` and leave the request for cleanup.

Physical devices, older RN/iOS versions, the legacy architecture, offering-only flows, nonrecoverable errors, accessibility focus restoration, keyboard content, rotation, and presentation races need validation. `ContextLifecycleProbe.swift` checks weak ownership and invalidation independently of React Native.
