### New Features
* 📱 Initial support for cross-platform RevenueCat Paywalls 🐾 🧱  (#766)

### Breaking changes from previous betas
- We have split the library in two, `react-native-purchases` and `react-native-purchases-ui`. The first one contains
  the core functionality of the SDK, while the second one contains the RevenueCat Paywalls functionality.
- Android's `minSdkVersion` is brought back to 19 in `react-native-purchases`. The `minSdkVersion` in
  `react-native-purchases-ui` is 24.

### Instructions:
- Update your `package.json` to include `react-native-purchases-ui`:
```json
{
  "dependencies": {
    "react-native-purchases-ui": "7.15.0-beta.4"
  }
}
```

### Usage:
```javascript
import { presentPaywallIfNeeded } from 'react-native-purchases-ui';

<TouchableOpacity
  style={styles.button}
  onPress={ presentPaywallIfNeeded("pro") } >
  <Text>Present paywall if PRO entitlement is not active</Text>
</TouchableOpacity>
```

### Limitations:
- Currently only full screen paywalls are supported
- There is no way to detect paywall events other than using `addCustomerInfoUpdateListener`
