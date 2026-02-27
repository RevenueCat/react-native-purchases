# react-native-purchases — Development Guidelines

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

RevenueCat's official React Native SDK for in-app purchases and subscriptions. Provides a TypeScript API that wraps native iOS and Android SDKs, with browser fallback support for Expo Go environments.

**Related repositories:**
- **iOS SDK**: https://github.com/RevenueCat/purchases-ios
- **Android SDK**: https://github.com/RevenueCat/purchases-android
- **Hybrid Common**: https://github.com/RevenueCat/purchases-hybrid-common — Native bridge layer
- **UI Package**: Located in `react-native-purchases-ui/` workspace

When implementing features or debugging, check these repos for reference and patterns.

## Important: Public API Stability

**Do NOT introduce breaking changes to the public API.** The SDK is used by many production apps.

**Safe changes:**
- Adding new optional parameters to existing methods
- Adding new classes, methods, or properties
- Bug fixes that don't change method signatures
- Internal implementation changes

**Requires explicit approval:**
- Removing or renaming public classes/methods/properties
- Changing method signatures (parameter types, required params)
- Changing return types
- Modifying behavior in ways that break existing integrations

## Code Structure

```
react-native-purchases/
├── src/
│   ├── index.ts              # Main entry point
│   ├── purchases.ts          # Core Purchases class (~2,000+ lines)
│   ├── customerInfo.ts       # Re-exports from typescript-internal
│   ├── offerings.ts          # Re-exports from typescript-internal
│   ├── errors.ts             # Re-exports from typescript-internal
│   ├── browser/              # Browser/Expo Go fallback implementation
│   │   ├── nativeModule.ts   # Browser implementation of native module
│   │   └── simulatedstore/   # Simulated purchase helpers
│   └── utils/
│       └── environment.ts    # Environment detection
├── android/                  # Android native module (Java/Kotlin)
│   └── src/main/java/.../
│       ├── RNPurchasesModule.java
│       └── RNPurchasesConverters.kt
├── ios/                      # iOS native module (Obj-C/Swift)
│   ├── RNPurchases.m
│   └── PurchasesPlugin.swift
├── __tests__/                # Jest test suites
├── examples/
│   ├── MagicWeather/         # Complete example app
│   ├── purchaseTesterTypescript/  # Main test app (workspace)
│   └── purchaseTesterExpo/   # Expo test app
├── react-native-purchases-ui/  # UI components workspace
├── dist/                     # Compiled output
└── fastlane/                 # Release automation
```

## Common Development Commands

```bash
# Install dependencies and bootstrap
yarn bootstrap

# Build TypeScript
yarn build
yarn build-watch

# Run tests
yarn test

# Type checking
yarn typecheck

# Lint
yarn tslint

# Run example app (workspace)
yarn example ios
yarn example android

# Prepare for Expo testing
yarn prepare-expo
```

## Project Architecture

### Main Entry Point: `src/purchases.ts`
- **Core Class**: `Purchases` with static methods
- **Dual Mode**: Native module OR browser mode (Expo Go)
- **Environment Detection**: `shouldUseBrowserMode()` utility

### Architecture Layers
1. **TypeScript Wrapper** (`src/purchases.ts`) — Type-safe public API
2. **Hybrid Mapping** (`@revenuecat/purchases-js-hybrid-mappings`) — Platform bridges
3. **Native Modules**:
   - iOS: `ios/RNPurchases.m`, `ios/PurchasesPlugin.swift`
   - Android: `android/.../RNPurchasesModule.java`
4. **Browser Fallback** (`src/browser/`) — For web/Expo Go environments

### Key Dependencies
- `@revenuecat/purchases-js-hybrid-mappings` — Bridge layer
- `@revenuecat/purchases-typescript-internal` — Shared types
- `PurchasesHybridCommon` (iOS/Android) — Native bridge

### Re-export Pattern
Files like `customerInfo.ts`, `errors.ts`, `offerings.ts` re-export from `@revenuecat/purchases-typescript-internal` for backwards compatibility.

## Constraints / Support Policy

| Platform | Minimum Version |
|----------|-----------------|
| React | >= 16.6.3 |
| React Native | >= 0.73.0 |
| iOS | 13.0+ |
| Android | API 21+ |
| TypeScript | 5.2.2 |

Don't raise minimum versions unless explicitly required and justified.

## Testing

```bash
# Run all tests
yarn test

# Type checking
yarn typecheck

# Lint
yarn tslint
```

Test files are in `__tests__/`:
- `index.test.js` — Main integration tests
- `alertHelper.test.ts` — Browser alert tests
- `offeringsLoader.test.ts` — Offerings tests
- `purchaseSimulatedPackageHelper.test.ts` — Simulated purchase tests

## Development Workflow

1. Bootstrap: `yarn bootstrap`
2. Build: `yarn build`
3. Make changes in `src/` (TypeScript) or native code (`ios/`, `android/`)
4. Run tests: `yarn test`
5. Type check: `yarn typecheck`
6. Test in example app: `yarn example ios` or `yarn example android`

### Local Native SDK Development
For testing with local purchases-hybrid-common:
```bash
cd android && ./gradlew enableLocalBuild -PpurchasesPath="path/to/purchases-hybrid-common"
```

## Yarn Workspaces

```
workspaces:
  - examples/purchaseTesterTypescript
  - react-native-purchases-ui
```

## Pull Request Labels

When creating a pull request, **always add one of these labels** to categorize the change:

| Label | When to Use |
|-------|-------------|
| `pr:feat` | New user-facing features or enhancements |
| `pr:fix` | Bug fixes |
| `pr:other` | Internal changes, refactors, CI, docs, or anything that shouldn't trigger a release |

## When the Task is Ambiguous

1. Search for similar existing implementation in this repo first
2. Check purchases-ios, purchases-android, and purchases-hybrid-common for patterns
3. If there's a pattern, follow it exactly
4. If not, propose options with tradeoffs and pick the safest default

## Guardrails

- **Don't invent APIs or file paths** — verify they exist before referencing them
- **Don't remove code you don't understand** — ask for context first
- **Don't make large refactors** unless explicitly requested
- **Keep diffs minimal** — only touch what's necessary, preserve existing formatting
- **Don't break the public API** — maintain backwards compatibility
- **Check native SDKs** when unsure about platform implementation details
- **Test both native and browser modes** — ensure Expo Go fallback works
- **Run build before testing** — always `yarn build` first
- **Never commit API keys or secrets** — do not stage or commit credentials or sensitive data
