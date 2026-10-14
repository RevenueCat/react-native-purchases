# Checkpoint ErrorPresenter experiment

This is a throwaway native integration experiment for review. It is not a proposed public React Native API or a merge-ready implementation. Android coverage is incomplete, and the adapter leaves stale requests after some native dismissal paths.

The SDK presents the checkpoint with its default flow presenter. Its actual `ErrorPresenter` sends purchase errors to JavaScript. JavaScript displays an Alert, React Modal, or in-tree overlay and returns a decision to the original native completion. There is no custom `PaywallPresenter`, synthetic host, or completion delay.

## Code to review

- [CheckpointErrorPresenterScreen.tsx](app/screens/CheckpointErrorPresenterScreen.tsx): event subscriptions, error UI, direct responses, and runtime diagnostics.
- [CheckpointTestAdapter.swift](../../react-native-purchases-ui/ios/CheckpointTestAdapter.swift): iOS SPI registration and retained completions.
- [RNPaywalls.m](../../react-native-purchases-ui/ios/RNPaywalls.m): test-only methods and events.
- [RNPaywallsModule.kt](../../react-native-purchases-ui/android/src/main/java/com/revenuecat/purchases/react/ui/RNPaywallsModule.kt): Android registration and retained completions.

The example opens this screen by default on this branch. The test methods are exposed through `NativeModules.RNPaywalls`, without adding public TypeScript exports or browser support.

## Reproduce

1. Configure a Test Store project with products, packages, and a published paywall. Target a single-step workflow from checkpoint `rn_error_presenter_test` with a rule that matches a fresh customer.
2. Put that project's Test Store SDK key in the relevant platform entry in `app/APIKeys.tsx` locally. This file is tracked. Do not commit the key.
3. Build the packages, install native dependencies, and build the native example app. The new bridge methods require a native rebuild; a JS reload alone is insufficient.
4. Tap **Fresh test customer**. First use **Default presenter baseline (sheet)** to verify that the SDK paywall presents.
5. Choose an error UI and **Checkpoint sheet** or **Checkpoint fullscreen**. Tap the paywall's purchase button, then **Test failed purchase** in the Test Store dialog. Cancel does not produce a purchase error.
6. Choose a decision and inspect the separate `[CheckpointTest native]` and `[CheckpointTest JS]` logs. Check `requestId`, `flowCanContinue`, `pending`, `completionCount`, and `onPassed`.

For Retry, attempt a second purchase and select **Test valid purchase**. Use a fresh customer after a successful purchase. For a hidden overlay, close the native flow and check whether the stale panel appears underneath. Respond to that panel or reload before starting another case.

The fixture used offering `golf`, product `moodly_premium_annual`, and entitlement `moodly_premium`. The `golfPresent` diagnostic is specific to that fixture. Attaching Test Store packages to `golf` fixed its omission from SDK offerings.

## Environment

Tests ran on October 14, 2026:

| Component | Version |
|---|---|
| React Native | 0.87.1, Fabric/new architecture |
| Hybrid Common / UI | 19.12.0, already pinned on the base branch |
| iOS RevenueCat / RevenueCatUI | 5.95.0 |
| iOS simulator | iPhone 17 Pro, iOS 26.4 |
| Android purchases / purchases-ui | 10.27.0 |
| Android emulator | Pixel Tablet, API 35 |

The resolved Android SDK was 10.27.0, not the 10.27.1 stated in the initial plan. No dependency pins or minimum support versions changed.

The first Android checkpoint returned null with a “no started Activity” message. Backgrounding and foregrounding the app restored presentation. The cause was not established. Some unrelated workflows in the same project also produced unsupported-component decoding warnings.

## Purchase-error results

A pass requires an SDK-presented flow, a failed Test Store purchase, a native presenter event with `flowCanContinue=true`, visible JS error UI, and a response delivered to the original SDK completion.

| Platform | Mode | Error UI | Retry | Continue | Navigate Back |
|---|---|---|---|---|---|
| iOS | Sheet | Alert | Pass | Pass | Pass |
| iOS | Fullscreen | Alert | Pass | Pass | Pass |
| Android | Sheet | Alert | Pass | Pass | Pass |
| Android | Fullscreen | Alert | Pass | Pass | Pass |
| iOS | Sheet | React Modal | UI failed | UI failed | UI failed |
| iOS | Fullscreen | React Modal | UI failed | UI failed | UI failed |
| Android | Sheet | React Modal | Pass | Pass | Pass |
| Android | Fullscreen | React Modal | Pass | Pass | Untested |
| iOS | Sheet | In-tree overlay | Hidden | Hidden | Hidden |
| iOS | Fullscreen | In-tree overlay | Hidden | Hidden | Hidden |
| Android | Sheet | In-tree overlay | Untested | Untested | Untested |
| Android | Fullscreen | In-tree overlay | Untested | Untested | Untested |

“UI failed” and “Hidden” describe a presentation failure for that UI/mode. They do not mean that three invisible buttons were exercised. Android fullscreen Modal Back and Android overlays remain untested because emulator window control failed. The earlier synthetic probe is not evidence of an actual checkpoint pass.

- Retry alone did not call `onPassed`. In each passing Retry case, the paywall remained usable and a second valid Test Store purchase returned `moodly_premium`.
- Continue closed the error UI and flow, with one `onPassed`. iOS returned an empty entitlement list. Android returned a null flow result. The bridge preserves that distinction.
- Navigate Back closed this single-step flow without `onPassed`. Multi-step navigation to a previous step was not verified.
- Normal responses removed the native request. Repeating a completed request on both platforms logged an ignored request ID without increasing `completionCount`.
- Android Modal fired `onShow` for all six real errors. No `onDismiss` was recorded. The tested response paths visibly returned to the paywall or root screen.

All passing responses completed directly from the JS button. The previous synthetic probe used a 400 ms delay. This experiment did not need that delay, but it was not a controlled timing comparison.

## Hidden UI and stale requests

On iOS, the custom React Modal did not appear above the native sheet or fullscreen flow. The overlay also stayed underneath. The native close button remained accessible while the adapter was waiting for a JS response.

Closing the flow left its request pending. For the overlay, the old error panel became visible on the React root afterward. For fullscreen Modal, `onShow` fired after native dismissal. This was observed with hidden/failed error presentation, not with the working blocking Alert. No corresponding UIKit presentation warning was captured.

The bridge retains the SDK completion until a decision arrives. The presenter function itself can return earlier. That distinction is why closing the paywall and leaving a pending request are possible at the same time.

This adapter does not observe every native terminal path. `onPassed` is insufficient because Back/close can suppress it. A production bridge needs a reliable way to invalidate stale requests and notify JS to dismiss their UI. Whether an existing native hook can cover that, or a new hook is needed, still needs investigation. This is a limitation of the experimental adapter, not a demonstrated bug in today's public React Native API.

## Lifecycle checks

- With iOS sheet Modal hidden, a second failed purchase produced a second native request. Both remained pending. Reload invoked each original completion once with Navigate Back and returned to the root screen.
- Reload also cleared the stale iOS fullscreen Modal request and the pending fullscreen overlay request.
- Android fullscreen Modal had a pending request when UI control failed. A Metro reload invoked its original completion once with Navigate Back. The app returned to the root with zero pending JS requests. This is reload evidence, not a user-selected Back pass.
- The iOS fullscreen Alert survived background/foreground and then completed Navigate Back normally.
- Android fullscreen Alert survived rotation, system Back with `cancelable: false`, and background/foreground. Retry then worked.
- Before `golf` had packages, iOS presented a blank native sheet and emitted a real nonrecoverable error with `flowCanContinue=false`. Alert Retry and Continue each closed the flow and emitted one `onPassed` with an empty entitlement list. Navigate Back closed without `onPassed`. This was a presentation error, not a purchase failure.

The local audit recorded 26 native presenter entries: 14 on iOS and 12 on Android. Each had one logged completion or invalidation decision by the end. That does not establish general lifecycle safety. External dismissal left requests retained until a later response or reload.

Invalidation uses an explicit experiment policy: clear the map, stop event emission, and complete outstanding handlers with Navigate Back. A multi-step flow might remain on its previous step under that policy. It is not a general cancel-flow implementation.

Still untested: Android overlays, Android fullscreen Modal user-selected Back, Android system Back through Modal, multi-step Back, Android nonrecoverable errors, an unknown action against a live request, and independently releasing an older request while preserving a newer one.

## Validation

- `yarn build`, `yarn typecheck`, and `yarn test --runInBand` passed. Jest ran 11 suites and 268 tests, including existing native-wrapper and browser fallback coverage.
- The new screen passed a focused typecheck using the example's compiler and local SDK path mappings.
- iOS simulator Debug build and Android arm64 Debug assemble passed before the runtime tests. Native implementation code is unchanged since those builds.
- The full example typecheck is not clean: it reports unresolved local SDK aliases and navigation/other example typing errors.
- `yarn tslint` exited zero but reported internal rule exceptions in untouched `src/normalizingRejections.ts`. It is not claimed as a clean lint run.
- The runtime matrix above supplies the actual ErrorPresenter integration evidence. Jest does not exercise those native UI flows.

Raw logs, screenshots, and the per-request audit are local under `.context/checkpoint-error-test/` in the experiment workspace. They are not included in this PR. No API key or planning artifacts are included.
