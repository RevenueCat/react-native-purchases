1. `bundle exec fastlane update_hybrid_common version:x.x.x` to set the purchases-hybrid-common version number.
1. `bundle exec fastlane bump_version version:x.x.x` to set the version number.
1. Update versions in VERSIONS.md.
1. Add an entry to CHANGELOG.md
1. Run `npm run build`
1. `git commit -am "Preparing for version x.y.z"`
1. `git tag x.y.z`
1. `git push origin master && git push --tags`
1. Create a new release in github and upload
1. `npm publish`
