import { useRef } from "react";
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
   * every tracking event of this ad. Tokens are single-use: create a new ad
   * for each verified show instead of calling `load()` again on this one.
   */
  enableRewardVerification?: boolean;
}

export interface ShowOptions {
  /** Overrides the load-time placement for this impression's events. */
  placement?: string | null;
  showOptions?: AdShowOptions;
}

export type BannerAdTrackingProps = BannerAdProps & {
  placement?: string | null;
};

export type RewardVerificationStartedCallback = () => void;
export type RewardVerificationCompletedCallback = (
  result: RewardVerificationResult
) => void;

export interface ShowWithRewardVerificationOptions extends ShowOptions {
  onUserEarnedReward?: (reward: RewardedAdReward) => void;
  onRewardVerificationStarted?: RewardVerificationStartedCallback;
  onRewardVerificationCompleted: RewardVerificationCompletedCallback;
}

const failedResult: RewardVerificationResult = {
  failed: true,
  moreRewards: [],
};

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
  const rewarded =
    ad instanceof RewardedAd || ad instanceof RewardedInterstitialAd;

  ad.addAdEventsListener(({ type, payload }) => {
    switch (type) {
      case AdEventType.LOADED:
      case RewardedAdEventType.LOADED:
        if (type === AdEventType.LOADED && rewarded) {
          return;
        }
        state.loadedOnce = true;
        state.updateFromResponse(ad.responseInfo);
        AdMobTracker.trackLoaded(state);
        return;
      case AdEventType.ERROR: {
        const error = payload as
          | { phase?: string; reason?: string }
          | undefined;
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
      case RewardedAdEventType.EARNED_REWARD:
        // With verification enabled the core SDK reports earning from the poll.
        if (!state.clientTransactionId) {
          AdMobTracker.trackRewardEarnedUnverified(state);
        }
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
  if (pinnedImpressionId) {
    preventReload(ad, state);
  }
  return ad;
}

/**
 * The SSV token travels with the request options, which the library reuses
 * and attaches natively on every successful load, so a reload after the ad
 * has loaded would send the already used token to AdMob. Shadow `load` on
 * the instance so it is ignored once the ad has loaded; a retry after a load
 * error never consumed the token and still goes through.
 */
function preventReload(ad: TrackableAd, state: TrackedAdState): void {
  const load = ad.load.bind(ad);
  ad.load = () => {
    if (state.loadedOnce) {
      logWarning(
        "Reward verification tokens are single-use; load() was ignored. " +
          "Create a new ad through createRewardedAd for each verified show."
      );
      return;
    }
    load();
  };
}

function trackedBannerProps(
  state: TrackedAdState,
  props: BannerAdProps
): BannerAdProps {
  return {
    ...props,
    onAdLoaded: (dimensions) => {
      state.updateFromResponse(dimensions.responseInfo);
      AdMobTracker.trackLoaded(state);
      props.onAdLoaded?.(dimensions);
    },
    onAdFailedToLoad: (error) => {
      AdMobTracker.trackFailedToLoad(
        props.unitId,
        AdFormat.banner,
        state.loadPlacement,
        error.reason
      );
      props.onAdFailedToLoad?.(error);
    },
    onAdImpression: () => {
      AdMobTracker.trackDisplayed(state);
      props.onAdImpression?.();
    },
    onAdClicked: () => {
      AdMobTracker.trackOpened(state);
      props.onAdClicked?.();
    },
    onPaid: (paid) => {
      AdMobTracker.trackRevenue(state, paid);
      props.onPaid?.(paid);
    },
  };
}

/**
 * Returns `BannerAd` props that report to RevenueCat, forwarding to the
 * props you pass in. Spread the result into `<BannerAd {...props} />`.
 * The tracking state lives for the lifetime of the calling component, so
 * rerenders keep the impression id of the banner that loaded.
 *
 * @example
 * ```tsx
 * function HomeBanner() {
 *   const bannerProps = useTrackingBannerAdProps({
 *     unitId,
 *     size: BannerAdSize.BANNER,
 *     placement: "home_bottom",
 *   });
 *   return <BannerAd {...bannerProps} />;
 * }
 * ```
 */
export function useTrackingBannerAdProps(
  props: BannerAdTrackingProps
): BannerAdProps {
  const { placement, ...rest } = props;
  const state = useRef<TrackedAdState | null>(null);
  if (state.current === null) {
    state.current = new TrackedAdState(
      AdFormat.banner,
      props.unitId,
      placement
    );
  }
  return trackedBannerProps(state.current, rest);
}

function prepareShow(
  ad: TrackableAd,
  placement?: string | null
): TrackedAdState | undefined {
  const state = stateFor(ad);
  if (!state) {
    logWarning(
      "This ad was not created through RevenueCatAdMob; it will not be tracked."
    );
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
 * `useTrackingBannerAdProps(...)`; native ads go through `trackNativeAd`.
 */
export const RevenueCatAdMob = {
  /**
   * Creates an interstitial ad whose loaded, displayed, opened, revenue and
   * failed-to-load events are reported to RevenueCat. Use it in place of
   * `InterstitialAd.createForAdRequest`, then `load()` and show it through
   * `showAndTrack`.
   *
   * @example
   * ```typescript
   * const interstitial = RevenueCatAdMob.createInterstitialAd(adUnitId, {
   *   placement: "level_complete",
   * });
   * interstitial.addAdEventListener(AdEventType.LOADED, () => setReady(true));
   * interstitial.load();
   * // Later
   * await RevenueCatAdMob.showAndTrack(interstitial);
   * ```
   */
  createInterstitialAd(
    adUnitId: string,
    options: TrackingOptions = {}
  ): InterstitialAd {
    const ad = InterstitialAd.createForAdRequest(
      adUnitId,
      options.requestOptions
    );
    trackAd(ad, AdFormat.interstitial, options.placement);
    return ad;
  },

  /**
   * Creates an app open ad tracked by RevenueCat. Use it in place of
   * `AppOpenAd.createForAdRequest`, then `load()` and show it through
   * `showAndTrack`.
   *
   * @example
   * ```typescript
   * const appOpen = RevenueCatAdMob.createAppOpenAd(adUnitId, {
   *   placement: "cold_start",
   * });
   * appOpen.load();
   * // When the app comes to the foreground
   * await RevenueCatAdMob.showAndTrack(appOpen);
   * ```
   */
  createAppOpenAd(adUnitId: string, options: TrackingOptions = {}): AppOpenAd {
    const ad = AppOpenAd.createForAdRequest(adUnitId, options.requestOptions);
    trackAd(ad, AdFormat.appOpen, options.placement);
    return ad;
  },

  /**
   * Creates a rewarded ad tracked by RevenueCat. Use it in place of
   * `RewardedAd.createForAdRequest`. With `enableRewardVerification` the
   * adapter requests a verification token first, which is why this resolves
   * asynchronously; show such ads through `showWithRewardVerification`.
   *
   * @example
   * ```typescript
   * const rewarded = await RevenueCatAdMob.createRewardedAd(adUnitId, {
   *   placement: "extra_life",
   *   enableRewardVerification: true,
   * });
   * rewarded.load();
   * // Later
   * await RevenueCatAdMob.showWithRewardVerification(rewarded, {
   *   onRewardVerificationCompleted: (result) => {
   *     if (!result.failed) grant(result.reward);
   *   },
   * });
   * ```
   */
  createRewardedAd(
    adUnitId: string,
    options: RewardedTrackingOptions = {}
  ): Promise<RewardedAd> {
    return createRewarded(
      (requestOptions) =>
        RewardedAd.createForAdRequest(adUnitId, requestOptions),
      AdFormat.rewarded,
      options
    );
  },

  /**
   * Creates a rewarded interstitial ad tracked by RevenueCat. Use it in place
   * of `RewardedInterstitialAd.createForAdRequest`; otherwise identical to
   * `createRewardedAd`.
   *
   * @example
   * ```typescript
   * const ad = await RevenueCatAdMob.createRewardedInterstitialAd(adUnitId, {
   *   placement: "chapter_end",
   * });
   * ad.load();
   * // Later
   * await RevenueCatAdMob.showAndTrack(ad);
   * ```
   */
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

  /**
   * Shows a tracked full-screen ad, optionally overriding its placement.
   *
   * @example
   * ```typescript
   * await RevenueCatAdMob.showAndTrack(interstitial, {
   *   placement: "level_complete_retry",
   * });
   * ```
   */
  showAndTrack(ad: TrackableAd, options: ShowOptions = {}): Promise<void> {
    prepareShow(ad, options.placement);
    return ad.show(options.showOptions);
  },

  /**
   * Shows a rewarded ad and verifies the earned reward with RevenueCat.
   * `onRewardVerificationCompleted` is called at most once per show, after
   * the user earns the reward; it is not called when the ad is dismissed or
   * fails before a reward. It receives a failed result when the ad was
   * created without `enableRewardVerification`.
   *
   * @example
   * ```typescript
   * await RevenueCatAdMob.showWithRewardVerification(rewarded, {
   *   onRewardVerificationStarted: () => showSpinner(),
   *   onRewardVerificationCompleted: (result) => {
   *     if (result.failed) return showError();
   *     grant(result.reward);
   *   },
   * });
   * ```
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
        Purchases.pollRewardVerification(
          clientTransactionId,
          state.trackingMetadata
        )
          .then(deliver)
          .catch((e) => {
            logWarning(`Reward verification failed: ${e}`);
            deliver(failedResult);
          });
      }
    );
    const unsubscribeAll = () => {
      unsubscribe();
      unsubscribeOnClose();
      unsubscribeOnError();
    };
    const unsubscribeOnClose = ad.addAdEventListener(
      AdEventType.CLOSED,
      unsubscribeAll
    );
    const unsubscribeOnError = ad.addAdEventListener(
      AdEventType.ERROR,
      unsubscribeAll
    );
    const shown = ad.show(options.showOptions);
    // A rejected show never emits CLOSED, so the listeners would outlive it.
    shown.catch(unsubscribeAll);
    return shown;
  },

  /**
   * Returns `BannerAd` props that report to RevenueCat, forwarding to the
   * props you pass in. Spread the result into `<BannerAd {...props} />`.
   * Each call starts a new tracking state, so call it once per banner
   * instance (for example in a class component's constructor), never inside
   * `render`. Function components should use `useTrackingBannerAdProps` instead.
   *
   * @example
   * ```tsx
   * class HomeBanner extends React.Component {
   *   bannerProps = RevenueCatAdMob.trackingBannerAdProps({
   *     unitId,
   *     size: BannerAdSize.BANNER,
   *     placement: "home_bottom",
   *   });
   *   render() {
   *     return <BannerAd {...this.bannerProps} />;
   *   }
   * }
   * ```
   */
  trackingBannerAdProps(props: BannerAdTrackingProps): BannerAdProps {
    const { placement, ...rest } = props;
    return trackedBannerProps(
      new TrackedAdState(AdFormat.banner, props.unitId, placement),
      rest
    );
  },

  /**
   * Tracks a loaded native ad. `NativeAd.createForAdRequest` resolves with a
   * loaded ad, so the loaded event is reported immediately.
   *
   * @example
   * ```typescript
   * const nativeAd = await NativeAd.createForAdRequest(adUnitId);
   * RevenueCatAdMob.trackNativeAd(nativeAd, { placement: "feed" });
   * ```
   */
  trackNativeAd(
    ad: NativeAd,
    options: { placement?: string | null } = {}
  ): void {
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
