1. Run `./scripts/update-hybrid-common.sh x.x.x` to update to the latest SDK versions in `scripts/build.js`, `RNPurchases.podspec` and `android/build.gradle`.
1. Update versions in VERSIONS.md.
1. Run `./scripts/prepare-for-release.sh x.x.x` to update version in `package.json`, `platformFlavorVersion` in `RNPurchases.m` and versionName in `android/build.gradle`.
1. Add an entry to CHANGELOG.md
1. Run `npm run build`
1. `git commit -am "Preparing for version x.y.z"`
1. `git tag x.y.z`
1. `git push origin --tags`
1. Create a new release in github and upload
1. `npm publish`
