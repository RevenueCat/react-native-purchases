# AGENTS.md — React Native Purchases SDK

> Guidelines for AI coding agents working on the RevenueCat React Native SDK.

## Project Overview

This is the official RevenueCat SDK for React Native, providing in-app purchase and subscription management. It wraps native iOS (StoreKit) and Android (Google Play Billing) functionality through `purchases-hybrid-common`.

**Key packages:**
- `react-native-purchases` — Core SDK
- `react-native-purchases-ui` — RevenueCatUI paywalls

## Architecture

```
src/                    # TypeScript source
├── index.ts            # Main exports
├── purchases.ts        # Core Purchases API
├── offerings.ts        # Offerings/packages types
├── customerInfo.ts     # Customer info types
└── errors.ts           # Error handling

ios/                    # Native iOS bridge (Obj-C/Swift)
android/                # Native Android bridge (Kotlin)

examples/
├── purchaseTesterTypescript/  # Development test app
└── MagicWeather/              # Sample app
```

## Development Setup

```bash
yarn bootstrap          # Link local package to example
yarn example ios        # Run iOS example
yarn example android    # Run Android example
yarn build              # Compile TypeScript
```

## Critical Rules

### React Native Rendering (CRITICAL)
- **Never use `&&` with falsy values** — `count && <Text>{count}</Text>` crashes when count is 0. Use ternary: `count ? <Text>{count}</Text> : null`
- **Strings must be in `<Text>`** — Direct string children in `<View>` cause runtime crashes
- **Wrap conditional text** — `{condition && "text"}` must be inside `<Text>`

### TypeScript
- Follow existing type patterns in `src/`
- Export types from `index.ts`
- Use strict null checks

### Native Code
- iOS changes go in `ios/`
- Android changes go in `android/` (Kotlin preferred)
- Both platforms must stay in sync for API changes
- Update `purchases-hybrid-common` via `fastlane update_hybrid_common version:{version}`

### Testing
- Test on physical devices, not just simulators (purchase flows differ)
- Ensure Play Store credentials and App Store sandbox are configured

## Performance Guidelines

### Lists (HIGH)
- Use `FlatList`/`SectionList` over `ScrollView` for dynamic lists
- Memoize `renderItem` callbacks
- Avoid inline objects in list props

### Animation (MEDIUM)
- Animate only `transform` and `opacity` (GPU-accelerated)
- Avoid animating layout properties (`width`, `height`, `margin`)
- Use `Reanimated` for complex animations

### State (MEDIUM)
- Minimize state variables; derive values when possible
- Use refs for values that don't need re-renders

## Guardrails

- **Never commit Claude-related files** — Do not stage or commit `.claude/` directory, `settings.local.json`, `CLAUDE.md`, or any AI tool configuration files
- **Never commit API keys or secrets** — Do not stage or commit API keys, RevenueCat API keys, tokens, credentials, `.env` files, or any sensitive data
- **Never commit node_modules** — Already in `.gitignore`, but verify before commits
- **Never force push to main** — Always use feature branches and PRs
- **Follow existing code style** — Match the patterns already in the codebase

## Useful Commands

```bash
yarn lint               # Run linter
yarn test               # Run tests
yarn build              # Build TypeScript
yarn bootstrap          # Setup development
fastlane update_hybrid_common version:X.Y.Z  # Update native dependency
```

## Related Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) — Development workflow
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Contribution guidelines
- [RELEASING.md](./RELEASING.md) — Release process
- [RevenueCat Docs](https://docs.revenuecat.com/docs)
