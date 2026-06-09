import type {
  PurchasesConfiguration,
} from "@revenuecat/purchases-typescript-internal";

export const GALAXY_BILLING_MODE = {
  PRODUCTION: "PRODUCTION",
  TEST: "TEST",
  ALWAYS_FAIL: "ALWAYS_FAIL",
} as const;

export type GALAXY_BILLING_MODE =
  (typeof GALAXY_BILLING_MODE)[keyof typeof GALAXY_BILLING_MODE];

export interface GalaxyConfigurationParams extends PurchasesConfiguration {
  galaxyBillingMode?: GALAXY_BILLING_MODE;
}

export interface GalaxyConfiguration extends GalaxyConfigurationParams {}

export class GalaxyConfiguration {
  public readonly store = "GALAXY";

  public constructor({
    galaxyBillingMode = GALAXY_BILLING_MODE.PRODUCTION,
    ...configuration
  }: GalaxyConfigurationParams) {
    Object.assign(this, configuration);
    this.galaxyBillingMode = galaxyBillingMode;
  }
}
