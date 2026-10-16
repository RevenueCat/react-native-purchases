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
  loadPlacement: string | null;
  showPlacement: string | null = null;
  /**
   * Either AdMob's response id (read once the ad loads) or, for ads created
   * with reward verification, the id generated before the request so the SSV
   * token and every tracking event share one impression id.
   */
  impressionId: string = "";
  networkName: string | null = null;
  clientTransactionId: string | null = null;
  rewardVerificationDelivered = false;
  loadedOnce = false;

  constructor(
    readonly adFormat: AdFormat,
    readonly adUnitId: string,
    placement?: string | null,
    public pinnedImpressionId: string | null = null
  ) {
    this.loadPlacement = placement ?? null;
    if (pinnedImpressionId) {
      this.impressionId = pinnedImpressionId;
    }
  }

  get placement(): string | null {
    return this.showPlacement ?? this.loadPlacement;
  }

  updateFromResponse(info: ResponseInfo | null | undefined): void {
    if (!this.pinnedImpressionId) {
      this.impressionId = info?.responseId ?? "";
    }
    this.networkName =
      info?.loadedAdapterResponse?.adapterClassName ??
      info?.adapterClassName ??
      null;
  }

  get trackingMetadata(): RewardedAdTrackingMetadata {
    return {
      networkName: this.networkName,
      mediatorName: AdMediatorName.adMob,
      adFormat: this.adFormat,
      placement: this.placement,
      adUnitId: this.adUnitId,
      impressionId: this.impressionId,
      captureMethod: AdCaptureMethod.reactNativeAdMobAdapter,
    } as RewardedAdTrackingMetadata;
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

/**
 * UUID v4. Uses `crypto` when the runtime or a polyfill such as
 * `react-native-get-random-values` provides it; Hermes has none by default,
 * so it falls back to `Math.random`, which is enough for a correlation key.
 */
interface CryptoLike {
  randomUUID?: () => string;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
}

export function generateImpressionId(): string {
  const cryptoObj = (globalThis as { crypto?: CryptoLike }).crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}
