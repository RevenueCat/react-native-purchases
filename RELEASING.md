1. Update to the latest SDK versions in `build.js`, `RNPurchases.podspec` and `android/build.gradle`.
1. Update versions in VERSIONS.md.
1. Update version in package.json.
1. Update platformFlavorVersion in RNPurchases.m.
1. Add an entry to CHANGELOG.md
1. Run `npm run build`
1. `git commit -am "Preparing for version x.y.z"`
1. `git tag x.y.z`
1. `git push origin master && git push --tags`
1. Create a new release in github and upload
1. `npm publish`
