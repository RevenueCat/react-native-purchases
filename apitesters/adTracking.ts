import Purchases, {
  AdMediatorName,
  AdFormat,
  AdRevenuePrecision,
  AdDisplayedData,
  AdOpenedData,
  AdLoadedData,
  AdRevenueData,
  AdFailedToLoadData,
} from "../src";

function checkAdTrackingTypes() {
  const _mediator: AdMediatorName = AdMediatorName.adMob;
  const _mediatorCustom: AdMediatorName = "CustomMediator";
  const _format: AdFormat = AdFormat.banner;
  const _formatCustom: AdFormat = "custom_format";
  const _precision: AdRevenuePrecision = AdRevenuePrecision.estimated;
  const _precisionCustom: AdRevenuePrecision = "custom_precision";
}

async function checkTrackAdDisplayed() {
  const data: AdDisplayedData = {
    mediatorName: AdMediatorName.adMob,
    adFormat: AdFormat.banner,
    adUnitId: "unit-1",
    impressionId: "imp-1",
  };
  await Purchases.adTracker.trackAdDisplayed(data);
  await Purchases.adTracker.trackAdDisplayed({
    mediatorName: "CustomMediator",
    adFormat: AdFormat.interstitial,
    adUnitId: "unit-1",
    impressionId: "imp-1",
    networkName: "AdNetwork",
    placement: "home",
  });
}

async function checkTrackAdOpened() {
  const data: AdOpenedData = {
    mediatorName: AdMediatorName.appLovin,
    adFormat: AdFormat.rewarded,
    adUnitId: "unit-1",
    impressionId: "imp-1",
  };
  await Purchases.adTracker.trackAdOpened(data);
  await Purchases.adTracker.trackAdOpened({
    ...data,
    networkName: "AdNetwork",
    placement: "home",
  });
}

async function checkTrackAdLoaded() {
  const data: AdLoadedData = {
    mediatorName: AdMediatorName.adMob,
    adFormat: AdFormat.appOpen,
    adUnitId: "unit-1",
    impressionId: "imp-1",
  };
  await Purchases.adTracker.trackAdLoaded(data);
  await Purchases.adTracker.trackAdLoaded({
    ...data,
    networkName: "AdNetwork",
    placement: "home",
  });
}

async function checkTrackAdRevenue() {
  const data: AdRevenueData = {
    mediatorName: AdMediatorName.adMob,
    adFormat: AdFormat.rewarded,
    adUnitId: "unit-1",
    impressionId: "imp-1",
    revenueMicros: 500000,
    currency: "USD",
    precision: AdRevenuePrecision.estimated,
  };
  await Purchases.adTracker.trackAdRevenue(data);
  await Purchases.adTracker.trackAdRevenue({
    ...data,
    networkName: "AdNetwork",
    placement: "home",
  });
}

async function checkTrackAdFailedToLoad() {
  const data: AdFailedToLoadData = {
    mediatorName: AdMediatorName.adMob,
    adFormat: AdFormat.banner,
    adUnitId: "unit-1",
  };
  await Purchases.adTracker.trackAdFailedToLoad(data);
  await Purchases.adTracker.trackAdFailedToLoad({
    ...data,
    mediatorErrorCode: 3,
    placement: "home",
  });
  await Purchases.adTracker.trackAdFailedToLoad({
    ...data,
    mediatorErrorCode: null,
  });
}
