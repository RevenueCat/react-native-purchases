# AGP9TestApp

The Android half of a stock React Native 0.87 app, autolinking
`react-native-purchases` and `react-native-purchases-ui` from this repo. React
Native 0.87 is the first release whose Gradle plugin pins AGP 9, so this is the
only app in the repo that compiles both modules under AGP 9. CI does so with
the template's `gradle.properties` (KGP) and with `android.builtInKotlin` and
`android.newDsl` on (AGP's built-in Kotlin). There is no JS.

```bash
cd e2e-tests/AGP9TestApp
yarn install
cd android
./gradlew :app:compileDebugKotlin
./gradlew :app:compileDebugKotlin -Pandroid.builtInKotlin=true -Pandroid.newDsl=true
```
