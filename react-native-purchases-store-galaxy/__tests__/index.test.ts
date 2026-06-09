import {
  GALAXY_BILLING_MODE,
  GalaxyConfiguration,
} from "../src";
import {
  ENTITLEMENT_VERIFICATION_MODE,
  PURCHASES_ARE_COMPLETED_BY_TYPE,
  STOREKIT_VERSION,
} from "@revenuecat/purchases-typescript-internal";

describe("GalaxyConfiguration", () => {
  it("sets Galaxy store and defaults billing mode to production", () => {
    const configuration = new GalaxyConfiguration({ apiKey: "key" });

    expect(configuration.store).toEqual("GALAXY");
    expect(configuration.galaxyBillingMode).toEqual(GALAXY_BILLING_MODE.PRODUCTION);
  });

  it("preserves base Purchases configuration fields", () => {
    const configuration = new GalaxyConfiguration({
      apiKey: "key",
      appUserID: "app-user-id",
      purchasesAreCompletedBy: {
        type: PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP,
        storeKitVersion: STOREKIT_VERSION.STOREKIT_2,
      },
      userDefaultsSuiteName: "suite-name",
      storeKitVersion: STOREKIT_VERSION.STOREKIT_2,
      shouldShowInAppMessagesAutomatically: false,
      entitlementVerificationMode: ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
      pendingTransactionsForPrepaidPlansEnabled: true,
      diagnosticsEnabled: true,
      automaticDeviceIdentifierCollectionEnabled: false,
      preferredUILocaleOverride: "en_US",
    });

    expect(configuration.apiKey).toEqual("key");
    expect(configuration.appUserID).toEqual("app-user-id");
    expect(configuration.purchasesAreCompletedBy).toEqual({
      type: PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP,
      storeKitVersion: STOREKIT_VERSION.STOREKIT_2,
    });
    expect(configuration.userDefaultsSuiteName).toEqual("suite-name");
    expect(configuration.storeKitVersion).toEqual(STOREKIT_VERSION.STOREKIT_2);
    expect(configuration.shouldShowInAppMessagesAutomatically).toEqual(false);
    expect(configuration.entitlementVerificationMode).toEqual(ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL);
    expect(configuration.pendingTransactionsForPrepaidPlansEnabled).toEqual(true);
    expect(configuration.diagnosticsEnabled).toEqual(true);
    expect(configuration.automaticDeviceIdentifierCollectionEnabled).toEqual(false);
    expect(configuration.preferredUILocaleOverride).toEqual("en_US");
  });

  it("passes explicit Galaxy billing mode through", () => {
    const configuration = new GalaxyConfiguration({
      apiKey: "key",
      galaxyBillingMode: GALAXY_BILLING_MODE.TEST,
    });

    expect(configuration.store).toEqual("GALAXY");
    expect(configuration.galaxyBillingMode).toEqual(GALAXY_BILLING_MODE.TEST);
  });
});
