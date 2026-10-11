import { AdCaptureMethod, AdMediatorName } from "react-native-purchases";
import type {
  AdFormat,
  RewardedAdTrackingMetadata,
} from "react-native-purchases";
import type { ResponseInfo } from "react-native-google-mobile-ads";

/**
 * Per-ad bookkeeping, kept in a weak side table so the adapter never changes
 * the lifetime of the `react-native-google-mobile-ads` objects it tracks.
 */
export class TrackedAdState {
  public loadPlacement: string | null;
  public showPlacement: string | null = null;
  /**
   * Either AdMob's response id (read once the ad loads) or, for ads created
   * with reward verification, the id generated before the request so the SSV
   * token and every tracking event share one impression id.
   */
  public impressionId: string = "";
  public networkName: string | null = null;
  public clientTransactionId: string | null = null;
  public rewardVerificationDelivered = false;

  constructor(
    public readonly adFormat: AdFormat,
    public readonly adUnitId: string,
    placement?: string | null,
    public readonly pinnedImpressionId: string | null = null
  ) {
    this.loadPlacement = placement ?? null;
    if (pinnedImpressionId) {
      this.impressionId = pinnedImpressionId;
    }
  }

  public get placement(): string | null {
    return this.showPlacement ?? this.loadPlacement;
  }

  public updateFromResponse(info: ResponseInfo | null | undefined): void {
    if (!this.pinnedImpressionId) {
      this.impressionId = info?.responseId ?? "";
    }
    this.networkName =
      info?.loadedAdapterResponse?.adapterClassName ??
      info?.adapterClassName ??
      null;
  }

  public get trackingMetadata(): RewardedAdTrackingMetadata {
    return {
      networkName: this.networkName,
      mediatorName: AdMediatorName.adMob,
      adFormat: this.adFormat,
      placement: this.placement,
      adUnitId: this.adUnitId,
      impressionId: this.impressionId,
      captureMethod: AdCaptureMethod.reactNativeAdMobAdapter,
    };
  }
}

const states = new WeakMap<object, TrackedAdState>();

export function stateFor(ad: object): TrackedAdState | undefined {
  return states.get(ad);
}

export function setState(ad: object, state: TrackedAdState): TrackedAdState {
  states.set(ad, state);
  return state;
}

/** RFC 4122 v4 shape, enough for a correlation key; no crypto dependency. */
export function generateImpressionId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : 8 + (r % 4);
    return v.toString(16);
  });
}
