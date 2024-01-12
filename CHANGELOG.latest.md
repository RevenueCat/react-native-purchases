### New Features
* 📱 Initial support for cross-platform RevenueCat Paywalls 🐾 🧱  (#837)

### Instructions:
- Update your `package.json` to include `react-native-purchases-ui`:
```json
{
  "dependencies": {
    "react-native-purchases": "7.15.0",
    "react-native-purchases-ui": "7.15.0"
  }
}
```

### Usage:
```javascript
import RevenueCatUI, { PAYWALL_RESULT } from "../react-native-purchases-ui";

async function presentPaywallIfNeeded() {
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "pro"
    });
}
```

You can find more information in [our documentation](https://www.revenuecat.com/docs/displaying-paywalls#react-native).