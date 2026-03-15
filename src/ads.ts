/**
 * Ad tracking types for reporting ad events to RevenueCat.
 *
 * These types map to the native SDK's ad tracking API, enabling comprehensive
 * LTV tracking across subscriptions and ad monetization.
 */

/**
 * Predefined ad mediator names. You can also use custom string values.
 */
export const AD_MEDIATOR_NAME = {
  AD_MOB: "AdMob",
  APP_LOVIN: "AppLovin",
} as const;

/**
 * Predefined ad format types.
 */
export const AD_FORMAT = {
  OTHER: "other",
  BANNER: "banner",
  INTERSTITIAL: "interstitial",
  REWARDED: "rewarded",
  REWARDED_INTERSTITIAL: "rewarded_interstitial",
  NATIVE: "native",
  APP_OPEN: "app_open",
  MREC: "mrec",
} as const;

/**
 * Revenue precision levels for ad revenue reporting.
 */
export const AD_REVENUE_PRECISION = {
  EXACT: "exact",
  PUBLISHER_DEFINED: "publisher_defined",
  ESTIMATED: "estimated",
  UNKNOWN: "unknown",
} as const;

/**
 * Data for tracking a failed ad load event.
 */
export interface AdFailedToLoadData {
  /** The mediation SDK name (e.g. "AdMob", "AppLovin") */
  mediatorName: string;
  /** The ad format (e.g. "banner", "interstitial") */
  adFormat: string;
  /** The ad unit identifier */
  adUnitId: string;
  /** Optional placement identifier */
  placement?: string | null;
  /** Optional error code from the mediation SDK */
  mediatorErrorCode?: number | null;
}

/**
 * Data for tracking a successful ad load event.
 */
export interface AdLoadedData {
  /** The ad network name */
  networkName?: string | null;
  /** The mediation SDK name */
  mediatorName: string;
  /** The ad format */
  adFormat: string;
  /** The ad unit identifier */
  adUnitId: string;
  /** Unique impression identifier */
  impressionId: string;
  /** Optional placement identifier */
  placement?: string | null;
}

/**
 * Data for tracking an ad display/impression event.
 */
export interface AdDisplayedData {
  /** The ad network name */
  networkName?: string | null;
  /** The mediation SDK name */
  mediatorName: string;
  /** The ad format */
  adFormat: string;
  /** The ad unit identifier */
  adUnitId: string;
  /** Unique impression identifier */
  impressionId: string;
  /** Optional placement identifier */
  placement?: string | null;
}

/**
 * Data for tracking an ad opened/clicked event.
 */
export interface AdOpenedData {
  /** The ad network name */
  networkName?: string | null;
  /** The mediation SDK name */
  mediatorName: string;
  /** The ad format */
  adFormat: string;
  /** The ad unit identifier */
  adUnitId: string;
  /** Unique impression identifier */
  impressionId: string;
  /** Optional placement identifier */
  placement?: string | null;
}

/**
 * Data for tracking ad revenue.
 */
export interface AdRevenueData {
  /** The ad network name */
  networkName?: string | null;
  /** The mediation SDK name */
  mediatorName: string;
  /** The ad format */
  adFormat: string;
  /** The ad unit identifier */
  adUnitId: string;
  /** Unique impression identifier */
  impressionId: string;
  /** Optional placement identifier */
  placement?: string | null;
  /** Revenue in micro-units (e.g. 1500000 = $1.50) */
  revenueMicros: number;
  /** ISO 4217 currency code (e.g. "USD") */
  currency: string;
  /** Revenue accuracy level */
  precision: string;
}
