import Purchases from "react-native-purchases";
import {
  GALAXY_BILLING_MODE,
} from "react-native-purchases-store-galaxy";

Purchases.configure({
  apiKey: "api_key",
  store: "GALAXY",
});

Purchases.configure({
  apiKey: "api_key",
  store: "GALAXY",
  galaxyBillingMode: GALAXY_BILLING_MODE.ALWAYS_FAIL,
});

Purchases.configure({
  apiKey: "api_key",
  appUserID: "app_user_id",
  store: "GALAXY",
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
});

Purchases.configure({
  apiKey: "api_key",
  store: "PLAY_STORE",
  // @ts-expect-error Galaxy billing mode can only be passed when store is GALAXY.
  galaxyBillingMode: GALAXY_BILLING_MODE.TEST,
});
