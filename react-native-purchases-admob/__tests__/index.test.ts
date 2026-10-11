type Listener = (info: { type: string; payload?: unknown }) => void;

class FakeAd {
  public static created: FakeAd[] = [];
  public loaded = false;
  public responseInfo: unknown = null;
  public listeners: Listener[] = [];
  public typed: Array<{ type: string; listener: (p: unknown) => void }> = [];
  public shown: unknown[] = [];
  constructor(public adUnitId: string, public requestOptions: unknown) {
    FakeAd.created.push(this);
  }
  static createForAdRequest(adUnitId: string, requestOptions?: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (this as any)(adUnitId, requestOptions ?? {});
  }
  addAdEventsListener(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  addAdEventListener(type: string, listener: (p: unknown) => void) {
    const entry = { type, listener };
    this.typed.push(entry);
    return () => {
      this.typed = this.typed.filter((e) => e !== entry);
    };
  }
  show(options?: unknown) {
    this.shown.push(options);
    return Promise.resolve();
  }
  emit(type: string, payload?: unknown) {
    this.listeners.forEach((l) => l({ type, payload }));
    this.typed.filter((e) => e.type === type).forEach((e) => e.listener(payload));
  }
}
class FakeInterstitial extends FakeAd {}
class FakeRewarded extends FakeAd {}
class FakeRewardedInterstitial extends FakeAd {}
class FakeAppOpen extends FakeAd {}

const adTracker = {
  trackAdLoaded: jest.fn(() => Promise.resolve()),
  trackAdFailedToLoad: jest.fn(() => Promise.resolve()),
  trackAdDisplayed: jest.fn(() => Promise.resolve()),
  trackAdOpened: jest.fn(() => Promise.resolve()),
  trackAdRevenue: jest.fn(() => Promise.resolve()),
};
const generateRewardVerificationToken = jest.fn();
const pollRewardVerification = jest.fn();

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    adTracker,
    generateRewardVerificationToken: (id: string) => generateRewardVerificationToken(id),
    pollRewardVerification: (id: string, meta: unknown) => pollRewardVerification(id, meta),
  },
  AdCaptureMethod: { reactNativeAdMobAdapter: "react_native_admob_adapter" },
  AdFormat: {
    banner: "banner",
    interstitial: "interstitial",
    rewarded: "rewarded",
    rewardedInterstitial: "rewarded_interstitial",
    nativeAd: "native",
    appOpen: "app_open",
  },
  AdMediatorName: { adMob: "AdMob" },
  AdRevenuePrecision: {
    exact: "exact",
    publisherDefined: "publisher_defined",
    estimated: "estimated",
    unknown: "unknown",
  },
}));

jest.mock("react-native-google-mobile-ads", () => ({
  AdEventType: {
    LOADED: "loaded",
    ERROR: "error",
    OPENED: "opened",
    PAID: "paid",
    CLICKED: "clicked",
    CLOSED: "closed",
    IMPRESSION: "impression",
  },
  RewardedAdEventType: {
    LOADED: "rewarded_loaded",
    EARNED_REWARD: "rewarded_earned_reward",
  },
  NativeAdEventType: { IMPRESSION: "impression", CLICKED: "clicked", PAID: "paid" },
  InterstitialAd: FakeInterstitial,
  RewardedAd: FakeRewarded,
  RewardedInterstitialAd: FakeRewardedInterstitial,
  AppOpenAd: FakeAppOpen,
  NativeAd: class {},
}));

import { RevenueCatAdMob } from "../src";

const responseInfo = (id: string) => ({
  responseId: id,
  adapterClassName: "Mediation",
  loadedAdapterResponse: { adapterClassName: "com.google.Adapter" },
  adapterResponses: [],
  extras: {},
});

beforeEach(() => {
  jest.clearAllMocks();
  FakeAd.created = [];
  generateRewardVerificationToken.mockResolvedValue({
    customData: "custom-data",
    clientTransactionId: "ctx-1",
    appUserID: "user-1",
  });
  pollRewardVerification.mockResolvedValue({
    failed: false,
    reward: { type: "virtual_currency", code: "GEM", amount: 3 },
    moreRewards: [],
  });
});

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("interstitial", () => {
  it("tracks the lifecycle with a show-time placement override", async () => {
    const ad = RevenueCatAdMob.createInterstitialAd("unit-1", {
      placement: "home",
    }) as unknown as FakeAd;
    ad.responseInfo = responseInfo("resp-1");
    ad.emit("loaded");
    expect(adTracker.trackAdLoaded).toHaveBeenCalledWith({
      networkName: "com.google.Adapter",
      mediatorName: "AdMob",
      adFormat: "interstitial",
      placement: "home",
      adUnitId: "unit-1",
      impressionId: "resp-1",
      captureMethod: "react_native_admob_adapter",
    });

    await RevenueCatAdMob.showAndTrack(ad as never, { placement: "home_retry" });
    expect(ad.shown).toHaveLength(1);
    ad.emit("impression");
    ad.emit("clicked");
    ad.emit("paid", { currency: "USD", precision: 3, value: 1.5, valueMicros: "1500000" });

    expect(adTracker.trackAdDisplayed).toHaveBeenCalledWith(
      expect.objectContaining({ placement: "home_retry", impressionId: "resp-1" })
    );
    expect(adTracker.trackAdOpened).toHaveBeenCalledWith(
      expect.objectContaining({ placement: "home_retry" })
    );
    expect(adTracker.trackAdRevenue).toHaveBeenCalledWith(
      expect.objectContaining({
        revenueMicros: 1500000,
        currency: "USD",
        precision: "exact",
        captureMethod: "react_native_admob_adapter",
      })
    );
  });

  it("derives micros from value when valueMicros is missing", () => {
    const ad = RevenueCatAdMob.createInterstitialAd("unit-1") as unknown as FakeAd;
    ad.emit("paid", { currency: "EUR", precision: 1, value: 0.0125 });
    expect(adTracker.trackAdRevenue).toHaveBeenCalledWith(
      expect.objectContaining({ revenueMicros: 12500, precision: "estimated" })
    );
  });

  it("tracks load failures but ignores show failures", () => {
    const ad = RevenueCatAdMob.createAppOpenAd("unit-2", { placement: "launch" }) as unknown as FakeAd;
    ad.emit("error", { phase: "load", reason: "no-fill" });
    ad.emit("error", { phase: "show", reason: "internal-error" });
    expect(adTracker.trackAdFailedToLoad).toHaveBeenCalledTimes(1);
    expect(adTracker.trackAdFailedToLoad).toHaveBeenCalledWith({
      mediatorName: "AdMob",
      adFormat: "app_open",
      placement: "launch",
      adUnitId: "unit-2",
      mediatorErrorCode: 3,
      captureMethod: "react_native_admob_adapter",
    });
  });

  it("does not throw when the tracker rejects", async () => {
    adTracker.trackAdLoaded.mockRejectedValueOnce(new Error("not configured"));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const ad = RevenueCatAdMob.createInterstitialAd("unit-1") as unknown as FakeAd;
    ad.emit("loaded");
    await flush();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Could not track ad loaded"));
    warn.mockRestore();
  });
});

describe("reward verification", () => {
  it("pins the impression id, attaches SSV options and polls once", async () => {
    const ad = (await RevenueCatAdMob.createRewardedInterstitialAd("ri-1", {
      placement: "bonus",
      enableRewardVerification: true,
      requestOptions: { keywords: ["a"] },
    })) as unknown as FakeAd;

    const impressionId = RevenueCatAdMob.impressionIdOf(ad)!;
    expect(impressionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(generateRewardVerificationToken).toHaveBeenCalledWith(impressionId);
    expect(ad.requestOptions).toEqual({
      keywords: ["a"],
      serverSideVerificationOptions: { userId: "user-1", customData: "custom-data" },
    });

    ad.responseInfo = responseInfo("ri-resp");
    ad.emit("loaded");
    ad.emit("rewarded_loaded");
    expect(adTracker.trackAdLoaded).toHaveBeenCalledTimes(1);
    expect(adTracker.trackAdLoaded).toHaveBeenCalledWith(
      expect.objectContaining({ impressionId, adFormat: "rewarded_interstitial" })
    );

    const results: unknown[] = [];
    let started = 0;
    const rewards: unknown[] = [];
    await RevenueCatAdMob.showWithRewardVerification(ad as never, {
      placement: "bonus_shown",
      onUserEarnedReward: (r) => rewards.push(r),
      onRewardVerificationStarted: () => started++,
      onRewardVerificationCompleted: (r) => results.push(r),
    });
    ad.emit("rewarded_earned_reward", { type: "coin", amount: 1 });
    ad.emit("rewarded_earned_reward", { type: "coin", amount: 1 });
    await flush();

    expect(rewards).toHaveLength(2);
    expect(started).toBe(2);
    expect(results).toHaveLength(1);
    expect(pollRewardVerification).toHaveBeenCalledWith("ctx-1", {
      networkName: "com.google.Adapter",
      mediatorName: "AdMob",
      adFormat: "rewarded_interstitial",
      placement: "bonus_shown",
      adUnitId: "ri-1",
      impressionId,
      captureMethod: "react_native_admob_adapter",
    });

    ad.emit("closed");
    ad.emit("rewarded_earned_reward", { type: "coin", amount: 1 });
    expect(rewards).toHaveLength(2);
  });

  it("fails fast when verification was not enabled", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const ad = (await RevenueCatAdMob.createRewardedAd("r-1")) as unknown as FakeAd;
    const results: { failed: boolean }[] = [];
    await RevenueCatAdMob.showWithRewardVerification(ad as never, {
      onRewardVerificationCompleted: (r) => results.push(r),
    });
    ad.emit("rewarded_earned_reward", { type: "coin", amount: 1 });
    expect(results).toEqual([{ failed: true, moreRewards: [] }]);
    expect(pollRewardVerification).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("reports a failed result when polling rejects", async () => {
    pollRewardVerification.mockRejectedValueOnce(new Error("boom"));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const ad = (await RevenueCatAdMob.createRewardedAd("r-1", {
      enableRewardVerification: true,
    })) as unknown as FakeAd;
    const results: { failed: boolean }[] = [];
    await RevenueCatAdMob.showWithRewardVerification(ad as never, {
      onRewardVerificationCompleted: (r) => results.push(r),
    });
    ad.emit("rewarded_earned_reward", { type: "coin", amount: 1 });
    await flush();
    expect(results).toEqual([{ failed: true, moreRewards: [] }]);
    warn.mockRestore();
  });

  it("falls back to tracking without verification when the token fails", async () => {
    generateRewardVerificationToken.mockRejectedValueOnce(new Error("offline"));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const ad = (await RevenueCatAdMob.createRewardedAd("r-1", {
      enableRewardVerification: true,
    })) as unknown as FakeAd;
    expect(ad.requestOptions).toEqual({});
    ad.responseInfo = responseInfo("r-resp");
    ad.emit("rewarded_loaded");
    expect(adTracker.trackAdLoaded).toHaveBeenCalledWith(
      expect.objectContaining({ impressionId: "r-resp" })
    );
    warn.mockRestore();
  });
});

describe("banner", () => {
  it("wraps banner props and forwards to the developer's handlers", () => {
    const userLoaded = jest.fn();
    const props = RevenueCatAdMob.bannerAdProps({
      unitId: "banner-1",
      size: "BANNER",
      placement: "bottom",
      onAdLoaded: userLoaded,
    });
    expect((props as { placement?: string }).placement).toBeUndefined();
    props.onAdLoaded!({ width: 320, height: 50, responseInfo: responseInfo("b-1") as never });
    props.onAdImpression!();
    props.onPaid!({ currency: "USD", precision: 2, value: 0.002, valueMicros: "2000" });
    props.onAdLoaded!({ width: 320, height: 50, responseInfo: responseInfo("b-2") as never });
    props.onAdClicked!();
    props.onAdFailedToLoad!(Object.assign(new Error("x"), { reason: "network-error" }));

    expect(userLoaded).toHaveBeenCalledTimes(2);
    expect(adTracker.trackAdLoaded.mock.calls.map((c) => (c as unknown[])[0])).toEqual([
      expect.objectContaining({ impressionId: "b-1", adFormat: "banner" }),
      expect.objectContaining({ impressionId: "b-2" }),
    ]);
    expect(adTracker.trackAdDisplayed).toHaveBeenCalledWith(
      expect.objectContaining({ impressionId: "b-1", placement: "bottom" })
    );
    expect(adTracker.trackAdRevenue).toHaveBeenCalledWith(
      expect.objectContaining({ revenueMicros: 2000, precision: "publisher_defined" })
    );
    expect(adTracker.trackAdOpened).toHaveBeenCalledWith(
      expect.objectContaining({ impressionId: "b-2" })
    );
    expect(adTracker.trackAdFailedToLoad).toHaveBeenCalledWith(
      expect.objectContaining({ mediatorErrorCode: 2 })
    );
  });
});
