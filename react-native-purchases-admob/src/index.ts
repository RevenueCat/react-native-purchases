import Purchases, { AdFormat } from "react-native-purchases";
import type { RewardVerificationResult } from "react-native-purchases";
import {
  AdEventType,
  AppOpenAd,
  InterstitialAd,
  NativeAd,
  NativeAdEventType,
  RewardedAd,
  RewardedAdEventType,
  RewardedInterstitialAd,
} from "react-native-google-mobile-ads";
import type {
  AdShowOptions,
  BannerAdProps,
  PaidEvent,
  RequestOptions,
  ResponseInfo,
  RewardedAdReward,
} from "react-native-google-mobile-ads";

import {
  generateImpressionId,
  setState,
  stateFor,
  TrackedAdState,
} from "./state";
import { AdMobTracker, logWarning } from "./tracker";

export type { TrackedAdState } from "./state";

/**
 * The structural shape of a `react-native-google-mobile-ads` full-screen ad
 * (`InterstitialAd`, `AppOpenAd`, `RewardedAd`, `RewardedInterstitialAd`).
 * Typed structurally so the adapter works across the library's per-class
 * listener generics and duplicate type installations.
 */
export interface TrackableAd {
  readonly adUnitId: string;
  readonly loaded: boolean;
  readonly responseInfo: ResponseInfo | null;
  load(): void;
  destroy(): void;
  addAdEventsListener(
    listener: (event: { type: string; payload?: unknown }) => void
  ): () => void;
  addAdEventListener(
    type: string,
    // tslint:disable-next-line:no-any
    listener: (payload: any) => void
  ): () => void;
  show(showOptions?: AdShowOptions): Promise<void>;
}

export interface TrackingOptions {
  /** Free-form label for where in your app the ad is shown. */
  placement?: string | null;
  /** Passed through to `createForAdRequest`. */
  requestOptions?: RequestOptions;
}

export interface RewardedTrackingOptions extends TrackingOptions {
  /**
   * Attach a RevenueCat reward-verification token to AdMob's server-side
   * verification options. The token has to exist before the ad request is
   * created, so the adapter generates the impression id itself and uses it for
   * every tracking event of this ad.
   */
  enableRewardVerification?: boolean;
}

export interface ShowOptions {
  /** Overrides the load-time placement for this impression's events. */
  placement?: string | null;
  showOptions?: AdShowOptions;
}

export type RewardVerificationStartedCallback = () => void;
export type RewardVerificationCompletedCallback = (
  result: RewardVerificationResult
) => void;

export interface ShowWithRewardVerificationOptions extends ShowOptions {
  onUserEarnedReward?: (reward: RewardedAdReward) => void;
  onRewardVerificationStarted?: RewardVerificationStartedCallback;
  onRewardVerificationCompleted: RewardVerificationCompletedCallback;
}


const failedResult: RewardVerificationResult = { failed: true, moreRewards: [] };

function formatOf(ad: TrackableAd): AdFormat | null {
  if (ad instanceof InterstitialAd) {
    return AdFormat.interstitial;
  }
  if (ad instanceof RewardedInterstitialAd) {
    return AdFormat.rewardedInterstitial;
  }
  if (ad instanceof RewardedAd) {
    return AdFormat.rewarded;
  }
  if (ad instanceof AppOpenAd) {
    return AdFormat.appOpen;
  }
  return null;
}

/**
 * Attaches RevenueCat tracking to an already created full-screen ad. Listeners
 * are additive, so your own `addAdEventListener` calls keep working.
 */
function trackAd(
  ad: TrackableAd,
  adFormat: AdFormat,
  placement: string | null | undefined,
  pinnedImpressionId: string | null = null
): TrackedAdState {
  const state = setState(
    ad,
    new TrackedAdState(adFormat, ad.adUnitId, placement, pinnedImpressionId)
  );
  const rewarded = ad instanceof RewardedAd || ad instanceof RewardedInterstitialAd;

  ad.addAdEventsListener(({ type, payload }) => {
    switch (type) {
      case AdEventType.LOADED:
      case RewardedAdEventType.LOADED:
        if (type === AdEventType.LOADED && rewarded) {
          return;
        }
        state.updateFromResponse(ad.responseInfo);
        AdMobTracker.trackLoaded(state);
        return;
      case AdEventType.ERROR: {
        const error = payload as { phase?: string; reason?: string } | undefined;
        if (error?.phase === "show") {
          return;
        }
        AdMobTracker.trackFailedToLoad(
          ad.adUnitId,
          adFormat,
          state.loadPlacement,
          error?.reason
        );
        return;
      }
      case AdEventType.IMPRESSION:
        AdMobTracker.trackDisplayed(state);
        return;
      case AdEventType.CLICKED:
        AdMobTracker.trackOpened(state);
        return;
      case AdEventType.PAID:
        AdMobTracker.trackRevenue(state, payload as PaidEvent);
        return;
      default:
        return;
    }
  });
  return state;
}

async function createRewarded<T extends TrackableAd>(
  create: (requestOptions: RequestOptions) => T,
  adFormat: AdFormat,
  options: RewardedTrackingOptions
): Promise<T> {
  let requestOptions = options.requestOptions ?? {};
  let pinnedImpressionId: string | null = null;
  let clientTransactionId: string | null = null;

  if (options.enableRewardVerification) {
    pinnedImpressionId = generateImpressionId();
    try {
      const token = await Purchases.generateRewardVerificationToken(
        pinnedImpressionId
      );
      clientTransactionId = token.clientTransactionId;
      requestOptions = {
        ...requestOptions,
        serverSideVerificationOptions: {
          userId: token.appUserID,
          customData: token.customData,
        },
      };
    } catch (e) {
      logWarning(`Could not enable reward verification: ${e}`);
      pinnedImpressionId = null;
    }
  }

  const ad = create(requestOptions);
  const state = trackAd(ad, adFormat, options.placement, pinnedImpressionId);
  state.clientTransactionId = clientTransactionId;
  return ad;
}

function prepareShow(ad: TrackableAd, placement?: string | null): TrackedAdState | undefined {
  const state = stateFor(ad);
  if (!state) {
    logWarning("This ad was not created through RevenueCatAdMob; it will not be tracked.");
    return undefined;
  }
  if (placement != null) {
    state.showPlacement = placement;
  }
  return state;
}

/**
 * Entry point of the RevenueCat AdMob adapter for React Native.
 *
 * Create full-screen ads through `create...` instead of
 * `createForAdRequest`, then `load()` and show them through
 * `showAndTrack` / `showWithRewardVerification`. Banner components spread
 * `bannerAdProps(...)`; native ads go through `trackNativeAd`.
 */
export const RevenueCatAdMob = {
  createInterstitialAd(adUnitId: string, options: TrackingOptions = {}): InterstitialAd {
    const ad = InterstitialAd.createForAdRequest(adUnitId, options.requestOptions);
    trackAd(ad, AdFormat.interstitial, options.placement);
    return ad;
  },

  createAppOpenAd(adUnitId: string, options: TrackingOptions = {}): AppOpenAd {
    const ad = AppOpenAd.createForAdRequest(adUnitId, options.requestOptions);
    trackAd(ad, AdFormat.appOpen, options.placement);
    return ad;
  },

  createRewardedAd(
    adUnitId: string,
    options: RewardedTrackingOptions = {}
  ): Promise<RewardedAd> {
    return createRewarded(
      (requestOptions) => RewardedAd.createForAdRequest(adUnitId, requestOptions),
      AdFormat.rewarded,
      options
    );
  },

  createRewardedInterstitialAd(
    adUnitId: string,
    options: RewardedTrackingOptions = {}
  ): Promise<RewardedInterstitialAd> {
    return createRewarded(
      (requestOptions) =>
        RewardedInterstitialAd.createForAdRequest(adUnitId, requestOptions),
      AdFormat.rewardedInterstitial,
      options
    );
  },

  /**
   * Attaches tracking to a full-screen ad you created yourself. Call before
   * `load()`. Reward verification is only available for ads created through
   * `createRewardedAd` / `createRewardedInterstitialAd`.
   */
  trackAd(ad: TrackableAd, options: TrackingOptions = {}): void {
    const adFormat = formatOf(ad);
    if (!adFormat) {
      logWarning("Unsupported ad type; it will not be tracked.");
      return;
    }
    trackAd(ad, adFormat, options.placement);
  },

  /** Shows a tracked full-screen ad, optionally overriding its placement. */
  showAndTrack(ad: TrackableAd, options: ShowOptions = {}): Promise<void> {
    prepareShow(ad, options.placement);
    return ad.show(options.showOptions);
  },

  /**
   * Shows a rewarded ad and verifies the earned reward with RevenueCat.
   * `onRewardVerificationCompleted` is called exactly once per show; it
   * receives a failed result when the ad was created without
   * `enableRewardVerification`.
   */
  showWithRewardVerification(
    ad: TrackableAd,
    options: ShowWithRewardVerificationOptions
  ): Promise<void> {
    const state = prepareShow(ad, options.placement);
    if (state) {
      state.rewardVerificationDelivered = false;
    }

    const unsubscribe = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward: RewardedAdReward) => {
        options.onUserEarnedReward?.(reward);
        options.onRewardVerificationStarted?.();

        const deliver = (result: RewardVerificationResult) => {
          if (state?.rewardVerificationDelivered) {
            return;
          }
          if (state) {
            state.rewardVerificationDelivered = true;
          }
          options.onRewardVerificationCompleted(result);
        };

        const clientTransactionId = state?.clientTransactionId;
        if (!state || !clientTransactionId) {
          logWarning(
            "Reward earned but reward verification was not enabled for this ad. " +
              "Create it with enableRewardVerification: true."
          );
          deliver(failedResult);
          return;
        }
        Purchases.pollRewardVerification(clientTransactionId, state.trackingMetadata)
          .then(deliver)
          .catch((e) => {
            logWarning(`Reward verification failed: ${e}`);
            deliver(failedResult);
          });
      }
    );
    const unsubscribeOnClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribe();
      unsubscribeOnClose();
    });
    return ad.show(options.showOptions);
  },

  /**
   * Returns `BannerAd` props that report to RevenueCat, forwarding to the
   * props you pass in. Spread the result into `<BannerAd {...props} />`.
   */
  bannerAdProps(
    props: BannerAdProps & { placement?: string | null }
  ): BannerAdProps {
    const { placement, ...rest } = props;
    const state = new TrackedAdState(AdFormat.banner, props.unitId, placement);
    return {
      ...rest,
      onAdLoaded: (dimensions) => {
        state.updateFromResponse(dimensions.responseInfo);
        AdMobTracker.trackLoaded(state);
        rest.onAdLoaded?.(dimensions);
      },
      onAdFailedToLoad: (error) => {
        AdMobTracker.trackFailedToLoad(
          props.unitId,
          AdFormat.banner,
          state.loadPlacement,
          error.reason
        );
        rest.onAdFailedToLoad?.(error);
      },
      onAdImpression: () => {
        AdMobTracker.trackDisplayed(state);
        rest.onAdImpression?.();
      },
      onAdClicked: () => {
        AdMobTracker.trackOpened(state);
        rest.onAdClicked?.();
      },
      onPaid: (paid) => {
        AdMobTracker.trackRevenue(state, paid);
        rest.onPaid?.(paid);
      },
    };
  },

  /**
   * Tracks a loaded native ad. `NativeAd.createForAdRequest` resolves with a
   * loaded ad, so the loaded event is reported immediately.
   */
  trackNativeAd(ad: NativeAd, options: { placement?: string | null } = {}): void {
    const state = setState(
      ad,
      new TrackedAdState(AdFormat.nativeAd, ad.adUnitId, options.placement)
    );
    state.updateFromResponse(
      ad.responseInfo ?? ({ responseId: ad.responseId } as ResponseInfo)
    );
    AdMobTracker.trackLoaded(state);
    ad.addAdEventListener(NativeAdEventType.IMPRESSION, () =>
      AdMobTracker.trackDisplayed(state)
    );
    ad.addAdEventListener(NativeAdEventType.CLICKED, () =>
      AdMobTracker.trackOpened(state)
    );
    ad.addAdEventListener(NativeAdEventType.PAID, (paid) =>
      AdMobTracker.trackRevenue(state, paid as unknown as PaidEvent)
    );
  },

  /** The impression id the adapter uses for a tracked ad, once known. */
  impressionIdOf(ad: object): string | null {
    return stateFor(ad)?.impressionId ?? null;
  },
};

export default RevenueCatAdMob;
