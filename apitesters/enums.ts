import {
  ATTRIBUTION_NETWORK,
  BILLING_FEATURE,
  PURCHASE_TYPE,
  PACKAGE_TYPE,
  INTRO_ELIGIBILITY_STATUS,
  PRORATION_MODE
} from '../dist';

function checkAttributionNetwork(network: ATTRIBUTION_NETWORK): boolean {
    switch (network) {
        case ATTRIBUTION_NETWORK.APPLE_SEARCH_ADS: return true;
        case ATTRIBUTION_NETWORK.ADJUST: return true;
        case ATTRIBUTION_NETWORK.APPSFLYER: return true;
        case ATTRIBUTION_NETWORK.BRANCH: return true;
        case ATTRIBUTION_NETWORK.TENJIN: return true;
        case ATTRIBUTION_NETWORK.FACEBOOK: return true;
    }
}

function checkPurchaseType(type: PURCHASE_TYPE): boolean {
    switch (type) {
        case PURCHASE_TYPE.INAPP: return true;
        case PURCHASE_TYPE.SUBS: return true;
    }
}

function checkBillingFeature(feature: BILLING_FEATURE): boolean {
    switch (feature) {
        case BILLING_FEATURE.SUBSCRIPTIONS: return true;
        case BILLING_FEATURE.SUBSCRIPTIONS_UPDATE: return true;
        case BILLING_FEATURE.IN_APP_ITEMS_ON_VR: return true;
        case BILLING_FEATURE.SUBSCRIPTIONS_ON_VR: return true;
        case BILLING_FEATURE.PRICE_CHANGE_CONFIRMATION: return true;
    }
}

function checkPackageType(type: PACKAGE_TYPE): boolean {
  switch (type) {
    case PACKAGE_TYPE.UNKNOWN: return true;
    case PACKAGE_TYPE.CUSTOM: return true;
    case PACKAGE_TYPE.LIFETIME: return true;
    case PACKAGE_TYPE.ANNUAL: return true;
    case PACKAGE_TYPE.SIX_MONTH: return true;
    case PACKAGE_TYPE.THREE_MONTH: return true;
    case PACKAGE_TYPE.TWO_MONTH: return true;
    case PACKAGE_TYPE.MONTHLY: return true;
    case PACKAGE_TYPE.WEEKLY: return true;
  }
}

function checkIntroEligibilityStatus(status: INTRO_ELIGIBILITY_STATUS): boolean {
  switch (status) {
    case INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN: return true;
    case INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE: return true;
    case INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE: return true;
  }
}

function checkProrationMode(mode: PRORATION_MODE): boolean {
  switch (mode) {
    case PRORATION_MODE.UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY: return true;
    case PRORATION_MODE.IMMEDIATE_WITH_TIME_PRORATION: return true;
    case PRORATION_MODE.IMMEDIATE_AND_CHARGE_PRORATED_PRICE: return true;
    case PRORATION_MODE.IMMEDIATE_WITHOUT_PRORATION: return true;
    case PRORATION_MODE.DEFERRED: return true;
  }
}
