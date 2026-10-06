import Purchases, {
  RewardVerificationToken,
  RewardVerificationResult,
  RewardedAdTrackingMetadata,
  VerifiedReward,
  VerifiedVirtualCurrencyReward,
  VerifiedEntitlementReward,
  VerifiedNoReward,
  VerifiedUnsupportedReward,
  AdMediatorName,
  AdFormat,
} from "../src";

async function checkGenerateRewardVerificationToken() {
  const token: RewardVerificationToken =
    await Purchases.generateRewardVerificationToken("imp-1");
  const _customData: string = token.customData;
  const _clientTransactionId: string = token.clientTransactionId;
  const _appUserID: string = token.appUserID;
}

async function checkPollRewardVerification() {
  const result: RewardVerificationResult =
    await Purchases.pollRewardVerification("client-transaction-id");
  const _failed: boolean = result.failed;
  const _reward: VerifiedReward | undefined = result.reward;
  const _moreRewards: VerifiedReward[] = result.moreRewards;
}

async function checkPollRewardVerificationWithTrackingMetadata() {
  const trackingMetadata: RewardedAdTrackingMetadata = {
    mediatorName: AdMediatorName.adMob,
    adFormat: AdFormat.rewarded,
    adUnitId: "unit-1",
    impressionId: "imp-1",
    networkName: "AdNetwork",
    placement: "home",
  };
  const result: RewardVerificationResult =
    await Purchases.pollRewardVerification(
      "client-transaction-id",
      trackingMetadata
    );
}

function checkVerifiedRewardTypes(reward: VerifiedReward) {
  switch (reward.type) {
    case "virtual_currency": {
      const _r: VerifiedVirtualCurrencyReward = reward;
      const _code: string = reward.code;
      const _amount: number = reward.amount;
      break;
    }
    case "entitlement": {
      const _r: VerifiedEntitlementReward = reward;
      const _identifier: string = reward.identifier;
      const _expiresAt: string = reward.expiresAt;
      const _expiresAtMillis: number = reward.expiresAtMillis;
      break;
    }
    case "no_reward": {
      const _r: VerifiedNoReward = reward;
      break;
    }
    case "unsupported_reward": {
      const _r: VerifiedUnsupportedReward = reward;
      break;
    }
  }
}
