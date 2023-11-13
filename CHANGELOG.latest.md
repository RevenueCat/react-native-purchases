### New Features
*   📱 Initial support for cross-platform RevenueCat Paywalls 🐾 🧱  (#766) 

#### Instructions:
- Update `react-native-purchases` in your `package.json`:
```json
{
  "dependencies": {
    "react-native-purchases": "7.4.0-beta.1"
  }
}
```

#### Usage:
```javascript
import { presentPaywallIfNeeded } from 'react-native-purchases';

<TouchableOpacity
  style={styles.button}
  onPress={ presentPaywallIfNeeded("pro") } >
  <Text>Present paywall if PRO entitlement is not active</Text>
</TouchableOpacity>
```

#### Limitations:

- Currently only full screen paywalls are supported
- There is no way to detect paywall events other than using `addCustomerInfoUpdateListener`
- Android's `minSdkVersion` is temporarily increased from `19` to `24` to support paywalls. This will be reverted in a future release as we split `react-native-purchases` and `react-native-purchases-ui`