<p align="center">
  <img src="https://uploads-ssl.webflow.com/5e2613cf294dc30503dcefb7/5e752025f8c3a31d56a51408_logo_red%20(1).svg" width="350" alt="RevenueCat"/>
<br>

[![npm](https://img.shields.io/npm/v/react-native-purchases-admob.svg)](https://www.npmjs.com/package/react-native-purchases-admob)

## react-native-purchases-admob

*react-native-purchases-admob* connects [react-native-google-mobile-ads](https://github.com/invertase/react-native-google-mobile-ads) to [RevenueCat](https://www.revenuecat.com/)'s ad tracking and reward verification. Create your ads through the adapter and it reports loaded, failed-to-load, displayed, opened and revenue events for you; rewarded ads can additionally have their rewards verified server-side. See the [AdMob integration docs](https://www.revenuecat.com/docs/ad-monetization/admob) for the full picture.

## Installation

```sh
yarn add react-native-purchases react-native-google-mobile-ads react-native-purchases-admob
```

Requires `react-native-google-mobile-ads` 17 or newer (the first version that exposes `responseInfo` and `valueMicros` on every ad format). Configure `Purchases` and initialize `mobileAds()` as you normally would; the adapter only tracks while `Purchases` is configured.

## Tracking full-screen ads

Replace `InterstitialAd.createForAdRequest(...)` with the matching `RevenueCatAdMob.create...` call. The returned object is the same `InterstitialAd`, so `load()`, listeners and `destroy()` work as before; `placement` is a free-form label for where the ad is shown.

```ts
import { RevenueCatAdMob } from 'react-native-purchases-admob';

const interstitial = RevenueCatAdMob.createInterstitialAd(adUnitId, {
  placement: 'level_complete',
  requestOptions: { keywords: ['game'] },
});
interstitial.addAdEventListener(AdEventType.LOADED, () => setReady(true));
interstitial.load();

// Later. The placement given here overrides the load-time one for this impression.
await RevenueCatAdMob.showAndTrack(interstitial, { placement: 'level_complete_retry' });
```

`createAppOpenAd` works the same way. For an ad you created yourself, call `RevenueCatAdMob.trackAd(ad, { placement })` before `load()`.

## Banner and native ads

```tsx
<BannerAd {...RevenueCatAdMob.bannerAdProps({ unitId, size: BannerAdSize.BANNER, placement: 'home_bottom' })} />

const nativeAd = await NativeAd.createForAdRequest(adUnitId);
RevenueCatAdMob.trackNativeAd(nativeAd, { placement: 'feed' });
```

Your own banner callbacks (`onAdLoaded`, `onPaid`, ...) can be passed into `bannerAdProps` and are forwarded.

## Reward verification

`react-native-google-mobile-ads` only accepts server-side verification options when the ad request is created, before AdMob's response id exists. The adapter therefore generates the impression id itself when you opt in, attaches the RevenueCat token to the request, and uses that id for every tracking event of the ad.

```ts
const rewarded = await RevenueCatAdMob.createRewardedAd(adUnitId, {
  placement: 'extra_life',
  enableRewardVerification: true,
});
rewarded.load();

await RevenueCatAdMob.showWithRewardVerification(rewarded, {
  onRewardVerificationStarted: () => showSpinner(),
  onRewardVerificationCompleted: (result) => {
    if (result.failed) return showError();
    grant(result.reward);
  },
});
```

`onRewardVerificationCompleted` is called exactly once per show. The ad unit's server-side verification URL must point at RevenueCat and a reward must be configured for it in the RevenueCat dashboard; see the [rewards docs](https://www.revenuecat.com/docs/ad-monetization/rewards).

## Not covered

The `useInterstitialAd` / `useRewardedAd` hooks create their ads internally and cannot be routed through the adapter; use the class API above. Ad pools and multi-format requests are not tracked.

## Requirements

* iOS 15.0+ (ad tracking is unavailable below that; calls are ignored with a warning)
* `react-native-google-mobile-ads` 17.x, which itself needs React Native 0.86+ and the New Architecture
* `react-native-purchases` 10.12.2+
