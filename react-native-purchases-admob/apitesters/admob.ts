import type {
  AppOpenAd,
  BannerAdProps,
  InterstitialAd,
  NativeAd,
  RewardedAd,
  RewardedInterstitialAd,
} from "react-native-google-mobile-ads";
import type { RewardVerificationResult } from "react-native-purchases";
import RevenueCatAdMob, {
  RevenueCatAdMob as Named,
  useTrackingBannerAdProps,
} from "react-native-purchases-admob";
import type {
  RewardedTrackingOptions,
  ShowWithRewardVerificationOptions,
  TrackableAd,
  BannerAdTrackingProps,
  TrackingOptions,
} from "react-native-purchases-admob";

async function checkApi(nativeAd: NativeAd) {
  const options: TrackingOptions = { placement: "p", requestOptions: {} };
  const rewardedOptions: RewardedTrackingOptions = {
    ...options,
    enableRewardVerification: true,
  };
  const interstitial: InterstitialAd = RevenueCatAdMob.createInterstitialAd(
    "u",
    options
  );
  const appOpen: AppOpenAd = Named.createAppOpenAd("u");
  const rewarded: RewardedAd = await RevenueCatAdMob.createRewardedAd(
    "u",
    rewardedOptions
  );
  const rewardedInterstitial: RewardedInterstitialAd =
    await RevenueCatAdMob.createRewardedInterstitialAd("u");
  RevenueCatAdMob.trackAd(appOpen, { placement: "x" });
  await RevenueCatAdMob.showAndTrack(interstitial, { placement: "y" });
  const showOptions: ShowWithRewardVerificationOptions = {
    placement: "z",
    onUserEarnedReward: (reward) => reward.amount,
    onRewardVerificationStarted: () => undefined,
    onRewardVerificationCompleted: (result: RewardVerificationResult) =>
      result.failed,
  };
  await RevenueCatAdMob.showWithRewardVerification(rewarded, showOptions);
  await RevenueCatAdMob.showWithRewardVerification(
    rewardedInterstitial,
    showOptions
  );
  const trackedBannerProps: BannerAdTrackingProps = {
    unitId: "u",
    size: "BANNER",
    placement: "b",
  };
  const bannerProps: BannerAdProps =
    RevenueCatAdMob.trackingBannerAdProps(trackedBannerProps);
  RevenueCatAdMob.trackNativeAd(nativeAd, { placement: "n" });
  const impressionId: string | null = RevenueCatAdMob.impressionIdOf(rewarded);
  const trackable: TrackableAd = interstitial;
  return { bannerProps, impressionId, trackable };
}

function checkHooks() {
  const bannerProps: BannerAdProps = useTrackingBannerAdProps({
    unitId: "u",
    size: "BANNER",
    placement: "b",
    onPaid: (paid) => paid.value,
  });
  return bannerProps;
}

export { checkApi, checkHooks };
