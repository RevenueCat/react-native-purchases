# Ads Tester

A minimal React Native app that exercises RevenueCat's rewarded-ad **reward
verification** primitives (`Purchases.generateRewardVerificationToken` and
`Purchases.pollRewardVerification`) end to end, using
[`react-native-google-mobile-ads`](https://github.com/invertase/react-native-google-mobile-ads)
for the AdMob rewarded-interstitial. iOS and Android. The whole flow lives in
[`App.tsx`](./App.tsx).

## The flow

1. Assign a unique `impressionId` and generate a verification token —
   `Purchases.generateRewardVerificationToken(impressionId)` returns
   `{ customData, clientTransactionId, appUserID }`. (The screen shows the
   `impressionId` so you can see what flows through.)
2. Create the ad request with `serverSideVerificationOptions: { userId: appUserID, customData }`.
3. Show the ad, and on `EARNED_REWARD` poll with `pollRewardVerification(clientTransactionId)`
   and render the result.

## Run

```bash
# from the repo root (Yarn Berry installs this standalone project's own lockfile)
cd examples/adsTester
yarn install
```

### iOS

```bash
cd ios && pod install && cd ..
yarn ios --simulator "iPhone Air"
```

`pod install` pulls the released `PurchasesHybridCommon` (18.25.0+, via
`react-native-purchases`), which contains the reward-verification bridge — no
local override needed. Use `--simulator` so the build doesn't grab a physical
device (which would require a signing team).

### Android

```bash
yarn android
```

Needs an emulator or device already running (`yarn android` installs and
launches on whichever one `adb` sees). The Android SDK/toolchain has its own
version requirements independent of this app — if the build fails with a
Gradle/JDK error, that's usually the fix (this repo has been tested with JDK
17).

## Local SDK resolution

`react-native-purchases` is intentionally **not** in `package.json`; it resolves
from this branch's source via `babel.config.js` (alias → `../../src/index`),
`metro.config.js` (`watchFolders` + peer-dep dedup), and `react-native.config.js`
(native autolinking). So the app always exercises the code on the current branch.

## Values

Ships with placeholder/test values, safe to commit:

- `API_KEY` in `App.tsx` — set your RevenueCat public SDK key (a Test Store key
  works while developing).
- `AD_UNIT_ID` in `App.tsx` — Google's public **test** rewarded-interstitial unit
  (`TestIds.REWARDED_INTERSTITIAL`, resolved per-platform).
- `GADApplicationIdentifier` in `ios/adsTester/Info.plist` — Google's test
  app id for iOS.
- `react-native-google-mobile-ads.android_app_id` in `app.json` — Google's test
  app id for Android.

Out of the box the ad fills but `pollRewardVerification` returns `failed` (no
reward rule sits behind a test ad unit). For a real grant, swap these for your
own app's key, an AdMob unit whose server-side verification URL points at
RevenueCat, and your AdMob app id (both platforms) — then configure a reward
rule in the RevenueCat dashboard.
