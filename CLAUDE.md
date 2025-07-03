# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Setup
- `yarn bootstrap` - Set up development environment, links local package and installs dependencies
- `yarn` - Install dependencies
- `yarn build` - Compile TypeScript to JavaScript in dist/
- `yarn build-watch` - Watch mode compilation
- `yarn typecheck` - Type checking without emitting files
- `yarn test` - Run Jest tests
- `yarn tslint` - Lint TypeScript files
- `yarn prepare` - Prepare package for publishing (runs tsc)

### Example Apps
- `yarn example android` - Run purchaseTesterTypescript example on Android
- `yarn example ios` - Run purchaseTesterTypescript example on iOS
- `yarn example-expo android` - Run purchaseTesterExpo example on Expo Go on Android
- `yarn example-expo ios` - Run purchaseTesterExpo example on Expo Go on iOS
- `yarn example-expo web` - Run purchaseTesterExpo example on web
- `yarn ui` - Work with react-native-purchases-ui workspace

### Platform-Specific Development
- **iOS**: Open `examples/purchaseTesterTypescript/ios/PurchaseTester.xcworkspace` in Xcode to edit native iOS code
- **Android**: Use gradle command `gradle enableLocalBuild -PcommonPath="path/to/purchases-hybrid-common/android"` for local common development
- **MagicWeather**: Run from its own directory with `yarn`, `yarn pods`, then `yarn ios`/`yarn android`

### Native Dependencies
- `fastlane update_hybrid_common version:{new version}` - Update PurchasesHybridCommon version

## Architecture

### Core Structure
- **Main Package**: `react-native-purchases` - Core SDK for in-app purchases and subscriptions
- **UI Package**: `react-native-purchases-ui` - RevenueCat paywall UI components
- **Workspaces**: Uses Yarn workspaces for monorepo management

### Key Directories
- `src/` - Main TypeScript source code
  - `purchases.ts` - Main Purchases class and API
  - `customerInfo.ts` - Customer information types and utilities
  - `offerings.ts` - Product offerings and packages
  - `errors.ts` - Error types and handling
  - `preview/` - Preview/mock implementations for development
- `android/` - Android native bridge implementation (Java/Kotlin)
- `ios/` - iOS native bridge implementation (Objective-C/Swift)
- `react-native-purchases-ui/` - Separate UI package with native paywall components
- `examples/` - Sample applications
  - `purchaseTesterTypescript/` - Full-featured test app linked to local package
  - `purchaseTesterExpo/` - Test app for integration with Expo
  - `MagicWeather/` - Standalone example using published package

### Native Bridge Architecture
- **iOS**: Uses Objective-C/Swift bridge with `RNPurchases.h/.m` and `PurchasesPlugin.swift`
- **Android**: Uses Java/Kotlin bridge with `RNPurchasesModule.java` and converters
- **UI Components**: Native view managers for paywall rendering on both platforms
- **Hybrid Common**: Shared logic via `@revenuecat/purchases-typescript-internal` dependency

### Development Patterns
- TypeScript-first development with strict typing enabled
- Workspaces allow simultaneous development of core and UI packages
- purchaseTesterTypescript uses local package via workspace linking
- Preview API mode for development without native dependencies
- Separate native projects for platform-specific code editing

### Key Files
- `package.json` - Main package configuration with workspace setup
- `tsconfig.json` - TypeScript compilation settings
- `RNPurchases.podspec` - iOS CocoaPods specification
- `android/build.gradle` - Android build configuration
- `DEVELOPMENT.md` - Detailed development setup instructions

### Testing
- Jest configuration with React Native preset
- Test setup in `scripts/setupJest.js`
- Separate test exclusions for workspace packages
- Physical device testing required for purchase functionality