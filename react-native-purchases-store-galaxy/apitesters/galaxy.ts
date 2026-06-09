import Purchases from "react-native-purchases";
import {
  GALAXY_BILLING_MODE,
  GalaxyConfiguration,
} from "react-native-purchases-store-galaxy";

Purchases.configure(new GalaxyConfiguration({ apiKey: "api_key" }));

Purchases.configure(
  new GalaxyConfiguration({
    apiKey: "api_key",
    galaxyBillingMode: GALAXY_BILLING_MODE.ALWAYS_FAIL,
  }),
);

Purchases.configure(
  new GalaxyConfiguration({
    apiKey: "api_key",
    appUserID: "app_user_id",
    purchasesAreCompletedBy: {
      type: Purchases.PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP,
      storeKitVersion: Purchases.STOREKIT_VERSION.STOREKIT_2,
    },
    entitlementVerificationMode: Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
    pendingTransactionsForPrepaidPlansEnabled: true,
    diagnosticsEnabled: true,
    automaticDeviceIdentifierCollectionEnabled: false,
    preferredUILocaleOverride: "en_US",
    galaxyBillingMode: GALAXY_BILLING_MODE.TEST,
  }),
);
