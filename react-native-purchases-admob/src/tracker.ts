import Purchases, {
  AdCaptureMethod,
  AdMediatorName,
  AdRevenuePrecision,
} from "react-native-purchases";
import type { AdFormat } from "react-native-purchases";
import type { PaidEvent } from "react-native-google-mobile-ads";

import { TrackedAdState } from "./state";

export function logWarning(message: string): void {
  // tslint:disable-next-line:no-console
  console.warn(`[react-native-purchases-admob] ${message}`);
}

const captureMethod = AdCaptureMethod.reactNativeAdMobAdapter;

/**
 * `react-native-google-mobile-ads` reports load failures with a string reason
 * rather than AdMob's numeric error code. The common ones map back onto the
 * AdMob codes so the dashboard groups them with native integrations.
 */
const mediatorErrorCodes: Record<string, number> = {
  "internal-error": 0,
  "invalid-request": 1,
  "network-error": 2,
  "no-fill": 3,
  "app-id-missing": 8,
  "mediation-no-fill": 9,
  "mediation-adapter-error": 10,
  "invalid-argument": 11,
  "invalid-ad-string": 13,
};

export function mediatorErrorCode(reason: string | undefined): number | null {
  if (!reason) {
    return null;
  }
  const mapped = mediatorErrorCodes[reason];
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
    case 3:
      return AdRevenuePrecision.exact;
    case 2:
      return AdRevenuePrecision.publisherDefined;
    case 1:
      return AdRevenuePrecision.estimated;
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
      })
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
      })
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
      })
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
      })
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
      })
    );
  },
};
