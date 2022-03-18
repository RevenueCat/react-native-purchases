1. `bundle exec fastlane update_hybrid_common version:x.x.x` to set the purchases-hybrid-common version number.
1. Update CHANGELOG.latest.md with the changes for the current version (to be used by Fastlane for the github release notes).
1. `bundle exec fastlane bump_and_update_changelog version:x.x.x` to set the version number.
1. Update versions in VERSIONS.md.
1. Run `npm run build`
1. Open a PR from branch `release/x.x.x` against `main`
1. Merge to `main` and pull from your machine
1. `git tag x.y.z`
1. `git push origin main && git push --tags`
1. Create a new release in github and upload
1. `npm publish`
