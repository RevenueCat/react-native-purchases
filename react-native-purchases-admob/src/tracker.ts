import Purchases, {
  AdCaptureMethod,
  AdMediatorName,
  AdRevenuePrecision,
} from "react-native-purchases";
import type {
  AdDisplayedData,
  AdFailedToLoadData,
  AdFormat,
  AdLoadedData,
  AdOpenedData,
  AdRevenueData,
  AdRewardEarnedUnverifiedData,
} from "react-native-purchases";
import type { PaidEvent } from "react-native-google-mobile-ads";
import { Platform } from "react-native";

import { TrackedAdState } from "./state";

export function logWarning(message: string): void {
  // tslint:disable-next-line:no-console
  console.warn(`[react-native-purchases-admob] ${message}`);
}

// The data types mark this field @internal, hence the assertions below.
const captureMethod = AdCaptureMethod.reactNativeAdMobAdapter;

/**
 * `react-native-google-mobile-ads` reports load failures with a string reason
 * rather than the platform SDK's numeric error code, and the two SDKs number
 * their codes differently. Each table inverts the library's own native mapping
 * for that platform (ReactNativeGoogleMobileAdsCommon.java and
 * RNGoogleMobileAdsOwnedMappers.m), so the emitted number matches what the
 * native integration on the same platform reports.
 */
const androidErrorCodes: Record<string, number> = {
  "internal-error": 0,
  "invalid-request": 1,
  "network-error": 2,
  "no-fill": 3,
  "app-id-missing": 8,
  "mediation-no-fill": 9,
  "request-id-mismatch": 10,
  "invalid-ad-string": 11,
};

const iosErrorCodes: Record<string, number> = {
  "invalid-request": 0,
  "no-fill": 1,
  "network-error": 2,
  "server-error": 3,
  timeout: 5,
  "mediation-data-error": 7,
  "mediation-adapter-error": 8,
  "mediation-invalid-ad-size": 10,
  "internal-error": 11,
  "invalid-argument": 12,
  "ad-already-used": 19,
  "app-id-missing": 20,
  "invalid-ad-string": 21,
};

export function mediatorErrorCode(reason: string | undefined): number | null {
  if (!reason) {
    return null;
  }
  const table = Platform.OS === "ios" ? iosErrorCodes : androidErrorCodes;
  const mapped = table[reason];
  if (mapped !== undefined) {
    return mapped;
  }
  const numeric = Number(reason);
  return Number.isInteger(numeric) ? numeric : null;
}

export function revenueMicrosFrom(paid: PaidEvent): number {
  if (paid.valueMicros != null) {
    const micros = Number(paid.valueMicros);
    if (Number.isFinite(micros)) {
      return Math.round(micros);
    }
  }
  return Math.round(paid.value * 1_000_000);
}

export function precisionFrom(precision: number): AdRevenuePrecision {
  switch (precision) {
    case 1:
      return AdRevenuePrecision.estimated;
    case 2:
      return AdRevenuePrecision.publisherDefined;
    case 3:
      return AdRevenuePrecision.exact;
    default:
      return AdRevenuePrecision.unknown;
  }
}

function swallow(event: string, promise: Promise<void>): void {
  promise.catch((e) => logWarning(`Could not track ${event}: ${e}`));
}

export const AdMobTracker = {
  trackLoaded(state: TrackedAdState): void {
    swallow(
      "ad loaded",
      Purchases.adTracker.trackAdLoaded({
        networkName: state.networkName,
        mediatorName: AdMediatorName.adMob,
        adFormat: state.adFormat,
        placement: state.loadPlacement,
        adUnitId: state.adUnitId,
        impressionId: state.impressionId,
        captureMethod,
      } as AdLoadedData)
    );
  },

  trackFailedToLoad(
    adUnitId: string,
    adFormat: AdFormat,
    placement: string | null,
    reason: string | undefined
  ): void {
    swallow(
      "ad failed to load",
      Purchases.adTracker.trackAdFailedToLoad({
        mediatorName: AdMediatorName.adMob,
        adFormat,
        placement,
        adUnitId,
        mediatorErrorCode: mediatorErrorCode(reason),
        captureMethod,
      } as AdFailedToLoadData)
    );
  },

  trackDisplayed(state: TrackedAdState): void {
    swallow(
      "ad displayed",
      Purchases.adTracker.trackAdDisplayed({
        networkName: state.networkName,
        mediatorName: AdMediatorName.adMob,
        adFormat: state.adFormat,
        placement: state.placement,
        adUnitId: state.adUnitId,
        impressionId: state.impressionId,
        captureMethod,
      } as AdDisplayedData)
    );
  },

  trackOpened(state: TrackedAdState): void {
    swallow(
      "ad opened",
      Purchases.adTracker.trackAdOpened({
        networkName: state.networkName,
        mediatorName: AdMediatorName.adMob,
        adFormat: state.adFormat,
        placement: state.placement,
        adUnitId: state.adUnitId,
        impressionId: state.impressionId,
        captureMethod,
      } as AdOpenedData)
    );
  },

  trackRewardEarnedUnverified(state: TrackedAdState): void {
    swallow(
      "reward earned",
      Purchases.adTracker.trackAdRewardEarnedUnverified({
        networkName: state.networkName,
        mediatorName: AdMediatorName.adMob,
        adFormat: state.adFormat,
        placement: state.placement,
        adUnitId: state.adUnitId,
        impressionId: state.impressionId,
        captureMethod,
      } as AdRewardEarnedUnverifiedData)
    );
  },

  trackRevenue(state: TrackedAdState, paid: PaidEvent): void {
    swallow(
      "ad revenue",
      Purchases.adTracker.trackAdRevenue({
        networkName: state.networkName,
        mediatorName: AdMediatorName.adMob,
        adFormat: state.adFormat,
        placement: state.placement,
        adUnitId: state.adUnitId,
        impressionId: state.impressionId,
        revenueMicros: revenueMicrosFrom(paid),
        currency: paid.currency,
        precision: precisionFrom(paid.precision),
        captureMethod,
      } as AdRevenueData)
    );
  },
};
