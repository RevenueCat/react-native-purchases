# Shared Maestro tests

`app/` contains the React Native test UI used by both native hosts:

- `../MaestroTestApp`: CocoaPods on iOS and Gradle on Android.
- `../SPMTestApp`: SwiftPM on iOS, using freshly packed SDKs.

Both hosts import the same components. The test menu uses React state, so sharing
the UI does not add navigation libraries or native dependencies to the SPM host.
Each host's Metro configuration resolves React, React Native, and the SDKs from
that host's own dependencies. The RN 0.88/CLI 21 prereleases remain isolated to
`SPMTestApp`.

## Coverage

`e2e_tests/purchase_through_paywall.yaml` exercises RevenueCat Test Store: present
the V2 paywall, purchase the yearly package, and observe the `pro` entitlement.
There are no restore tests. Both native hosts pass the `e2e_test_flow` launch
argument to the shared UI.

Flows default to `com.revenuecat.automatedsdktests`, preserving the existing iOS
and Android jobs. For SPM, run the same suite with its bundle ID:

```sh
maestro test -e APP_ID=org.reactjs.native.example.SPMTestApp e2e-tests/maestro/
```

Both hosts keep an API key placeholder in their `App.tsx` entry point. CI injects
`RC_E2E_TEST_API_KEY_PRODUCTION_TEST_STORE` from the existing `e2e-tests` context.
Do not commit an injected key. The shared UI configures Purchases before mounting
the purchase screen; build-only jobs can leave the placeholder intact.

The separate SPM Maestro job runs on branch builds and the existing Maestro
schedule, uploads JUnit results and debug artifacts, and is required before
release tagging. The SPM compile/link/resync job remains separate.

## Required consolidation when CocoaPods support is removed

The two native hosts are temporary. **The CocoaPods removal PR after December 2,
2026 must consolidate them; it must not leave two similar test apps behind.**
The final app is named `MaestroTestApp`, with SwiftPM on iOS and Gradle on Android,
and a single UI and Maestro suite.

That removal PR must:

1. Replace `MaestroTestApp`'s CocoaPods iOS project with the validated SPM setup,
   updating its RN/tooling dependencies and validating Android at the same time.
2. Move `app/` into `MaestroTestApp/src/`, update imports, and remove the temporary
   Metro configuration for sharing source between hosts.
3. Point the SPM build/resync job and SPM Maestro job at `MaestroTestApp`; retain
   the Android Maestro job and remove the CocoaPods Maestro job and lane.
4. Delete `SPMTestApp`, its standalone lockfile/cache references, and the old
   CocoaPods iOS files. Update the app documentation and API key injection paths.
5. Run the existing Test Store flow on both iOS and Android, and the iOS SPM
   build/link/resync checks, before merging the consolidation.
