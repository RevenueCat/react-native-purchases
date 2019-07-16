1. Update to the latest SDK versions in build.js, RNPurchases.podspec and android/build.gradle.
1. Update versions in VERSIONS.md.
2. Update version in package.json.
3. Add an entry to CHANGELOG.md
4. `git commit -am "Preparing for version x.y.z"`
5. `git tag x.y.z`
6. `git push origin master && git push --tags`
7. Create a new release in github and upload
8. `npm publish`
