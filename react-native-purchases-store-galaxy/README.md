# React Native Purchases Store Galaxy

Galaxy Store add-on for `react-native-purchases`.

```ts
import Purchases from "react-native-purchases";
import { GALAXY_BILLING_MODE } from "react-native-purchases-store-galaxy";

Purchases.configure({
  apiKey: "galx_XYZ",
  store: "GALAXY",
  galaxyBillingMode: GALAXY_BILLING_MODE.TEST,
});
```
