import Purchases from "../dist";

async function checkAttributes(purchases: Purchases) {
  const attributes: { [key: string]: string | null } = {};
  const stringOrNull: string | null = "";

  await Purchases.setAttributes(attributes);
  await Purchases.setEmail(stringOrNull);
  await Purchases.setPhoneNumber(stringOrNull);
  await Purchases.setDisplayName(stringOrNull);
  await Purchases.setPushToken(stringOrNull);
  await Purchases.setAdjustID(stringOrNull);
  await Purchases.setAppsflyerID(stringOrNull);
  await Purchases.setFBAnonymousID(stringOrNull);
  await Purchases.setMparticleID(stringOrNull);
  await Purchases.setCleverTapID(stringOrNull);
  await Purchases.setMixpanelDistinctID(stringOrNull);
  await Purchases.setFirebaseAppInstanceID(stringOrNull);
  await Purchases.setTenjinAnalyticsInstallationID(stringOrNull);
  await Purchases.setKochavaDeviceID(stringOrNull);
  await Purchases.setOnesignalID(stringOrNull);
  await Purchases.setAirshipChannelID(stringOrNull);
  await Purchases.setMediaSource(stringOrNull);
  await Purchases.setCampaign(stringOrNull);
  await Purchases.setAdGroup(stringOrNull);
  await Purchases.setAd(stringOrNull);
  await Purchases.setKeyword(stringOrNull);
  await Purchases.setCreative(stringOrNull);

  // Asserts the full AppsFlyer onInstallConversionData callback object is accepted as-is.
  const conversionData = {
    status: "success" as const,
    type: "onInstallConversionDataLoaded" as const,
    data: {
      is_first_launch: "true",
      media_source: "",
      campaign: "",
      af_status: "Organic",
    } as { [key: string]: any },
  };
  await Purchases.setAppsFlyerConversionData(conversionData);

  await Purchases.collectDeviceIdentifiers();
  await Purchases.enableAdServicesAttributionTokenCollection();
}
