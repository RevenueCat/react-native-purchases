/**
 * @file Configuration file for your app's RevenueCat settings.
 * @author Vadim Savin
 */

import {Platform} from 'react-native';
/*
 The API key for your app from the RevenueCat dashboard: https://app.revenuecat.com
 */
console.error("Modify this property to reflect your app's API key, then comment this line out.");
export const API_KEY = Platform.select({
  ios: 'Your Apple App Store API Key from RevenueCat',
  android: 'Your Google Play API Key from RevenueCat',
});

/*
 The entitlement ID from the RevenueCat dashboard that is activated upon successful in-app purchase for the duration of the purchase.
 */
console.error("Modify this property to reflect your app's entitlement identifier, then comment this line out.");
export const ENTITLEMENT_ID = 'pro';
