<h3 align="center">😻 In-App Subscriptions Made Easy 😻</h3>

[![License](https://img.shields.io/cocoapods/l/RevenueCat.svg?style=flat)](http://cocoapods.org/pods/RevenueCat)

RevenueCat is a powerful, reliable, and free-to-use in-app purchase server with cross-platform support. Our open-source framework provides a backend and a wrapper around StoreKit and Google Play Billing to make implementing in-app purchases and subscriptions easy.

Whether you are building a new app or already have millions of customers, you can use RevenueCat to:

* Fetch products, make purchases, and check subscription status with our [native SDKs](https://docs.revenuecat.com/docs/installation).
* Host and [configure products](https://docs.revenuecat.com/docs/entitlements) remotely from our dashboard.
* Analyze the most important metrics for your app business [in one place](https://docs.revenuecat.com/docs/charts).
* See customer transaction histories, chart lifetime value, and [grant promotional subscriptions](https://docs.revenuecat.com/docs/customers).
* Get notified of real-time events through [webhooks](https://docs.revenuecat.com/docs/webhooks).
* Send enriched purchase events to analytics and attribution tools with our easy integrations.

Sign up to [get started for free](https://app.revenuecat.com/signup).

---

## React Native Purchases UI

React Native Purchases UI are the UI components for the [RevenueCat](https://www.revenuecat.com/) subscription and purchase tracking system. It allows you to present paywalls in your React Native application, which you can further customize through the RevenueCat dashboard. 

## Installation

Expo supports in-app payments and is compatible with `react-native-purchases-ui`. You can install this package in an non-development build using the Expo Go app. In this case, `react-native-purchases-ui` will run in a Preview API mode, as it requires some native modules that are not available in Expo Go. All the listed APIs below are available but have no effect. 

[Creating a development build](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build) of the app will allow you to test the real behavior of RevenueCat SDK.


---

### 📱 Paywall Presentation Options

RevenueCat provides multiple ways to display paywalls in your app, depending on your use case:

#### 1. `RevenueCatUI.presentPaywall()`

Presents the current offering’s paywall modally.

```tsx
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

async function presentPaywall(): Promise<boolean> {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

  switch (paywallResult) {
    case PAYWALL_RESULT.NOT_PRESENTED:
    case PAYWALL_RESULT.ERROR:
    case PAYWALL_RESULT.CANCELLED:
      return false;
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return true;
    default:
      return false;
  }
}
```


Optionally, pass an offering object to display a specific offering:

```tsx
await RevenueCatUI.presentPaywall({ offering });
```

#### 2. RevenueCatUI.presentPaywallIfNeeded()

Displays the paywall **only if the required entitlement is not unlocked** (useful for gating access).

```tsx
const result = await RevenueCatUI.presentPaywallIfNeeded({
  requiredEntitlementIdentifier: "pro"
});
```

With a specific offering:

```tsx
await RevenueCatUI.presentPaywallIfNeeded({
  offering,
  requiredEntitlementIdentifier: "pro"
});
```

#### 3. <RevenueCatUI.Paywall /> Component

This approach provides manual control over when and how the paywall is rendered in your component tree.

**Displaying the Current Offering**

```tsx
import React from 'react';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

return (
  <View style={{ flex: 1 }}>
    <RevenueCatUI.Paywall 
      onDismiss={() => {
        // Dismiss the paywall, i.e. remove the view, navigate to another screen, etc.
        // Will be called when the close button is pressed (if enabled) or when a purchase succeeds.
      }}
    />
  </View>
);
```

**Displaying a Specific Offering**

```tsx
import React from 'react';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

return (
  <View style={{ flex: 1 }}>
    <RevenueCatUI.Paywall
      options={{
        offering: offering // Optional Offering object obtained through getOfferings
      }}
      onRestoreCompleted={({ customerInfo }: { customerInfo: CustomerInfo }) => {
        // Optional listener. Called when a restore has been completed.
        // This may be called even if no entitlements have been granted.
      }}
      onDismiss={() => {
        // Dismiss the paywall, i.e. remove the view, navigate to another screen, etc.
        // Will be called when the close button is pressed (if enabled) or when a purchase succeeds.
      }}
    />
  </View>
);
```

Listeners
The `<Paywall />` component supports the following lifecycle listeners:
- onPurchaseStarted
- onPurchaseCompleted
- onPurchaseError
- onPurchaseCancelled
- onRestoreStarted
- onRestoreCompleted
- onRestoreError
- onDismiss

Use these callbacks to respond to user actions such as purchase initiation, completion, dismissal, and error handling.
