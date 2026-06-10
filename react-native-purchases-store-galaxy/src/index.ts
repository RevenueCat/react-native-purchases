import type {} from "react-native-purchases";

export const GALAXY_BILLING_MODE = {
  PRODUCTION: "PRODUCTION",
  TEST: "TEST",
  ALWAYS_FAIL: "ALWAYS_FAIL",
} as const;

export type GalaxyBillingMode =
  (typeof GALAXY_BILLING_MODE)[keyof typeof GALAXY_BILLING_MODE];

declare module "react-native-purchases" {
  interface ConfigurationsByStore {
    GALAXY: {
      galaxyBillingMode?: GalaxyBillingMode;
    };
  }
}
