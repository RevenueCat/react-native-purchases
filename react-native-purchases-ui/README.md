<h3 align="center">😻 In-App Subscriptions Made Easy 😻</h3>

[![License](https://img.shields.io/cocoapods/l/RevenueCat.svg?style=flat)](http://cocoapods.org/pods/RevenueCat)

RevenueCat is a powerful, reliable, and free to use in-app purchase server with cross-platform support. Our open-source framework provides a backend and a wrapper around StoreKit and Google Play Billing to make implementing in-app purchases and subscriptions easy.

Whether you are building a new app or already have millions of customers, you can use RevenueCat to:

* Fetch products, make purchases, and check subscription status with our [native SDKs](https://docs.revenuecat.com/docs/installation).
* Host and [configure products](https://docs.revenuecat.com/docs/entitlements) remotely from our dashboard.
* Analyze the most important metrics for your app business [in one place](https://docs.revenuecat.com/docs/charts).
* See customer transaction histories, chart lifetime value, and [grant promotional subscriptions](https://docs.revenuecat.com/docs/customers).
* Get notified of real-time events through [webhooks](https://docs.revenuecat.com/docs/webhooks).
* Send enriched purchase events to analytics and attribution tools with our easy integrations.

Sign up to [get started for free](https://app.revenuecat.com/signup).

## React Native Purchases UI

React Native Purchases UI is the client for the [RevenueCat](https://www.revenuecat.com/) subscription and purchase tracking system. It is an open source framework that provides a wrapper around `StoreKit`, `Google Play Billing` and the RevenueCat backend to make implementing in-app purchases in `React Native` easy.

## Platform Support

This library supports:
- **iOS** - Full native support with StoreKit integration
- **Android** - Full native support with Google Play Billing integration  
- **Web** - Preview mode support with React Native Web

### Web Platform Support

When using this library on web platforms (React Native Web), the library operates in **Preview API Mode**. This means:

- Paywall components will render as web-compatible React components
- Purchase flows are simulated (no actual purchases are processed)
- Customer center functionality is limited
- All callbacks and events are still available for testing purposes

To use the library on web:

```javascript
// Import the web-specific entry point for better web compatibility
import RevenueCatUI from 'react-native-purchases-ui/web';

// Or use the standard import (web detection is automatic)
import RevenueCatUI from 'react-native-purchases-ui';
```

**Note**: Web support is primarily for development and testing purposes. For production web applications, consider using RevenueCat's web SDK directly.
