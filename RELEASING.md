### Releasing a version:

1. Create a `fastlane/.env` file with your GitHub API token (see `fastlane/.env.SAMPLE`). This will be used to create the PR, so you should use your own token so the PR gets assigned to you.
1. Run `bundle exec fastlane bump`
    1. Input new version number
    2. Update CHANGELOG.latest.md to include the latest changes. Call out API changes (if any). You can use the existing CHANGELOG.md as a base for formatting. To compile the changelog, you can compare the changes between the base branch for the release (usually main) against the latest release, by checking https://github.com/revenuecat/react-native-purchases/compare/<latest_release>...<base_branch>. For example, https://github.com/revenuecat/react-native-purchases/compare/3.10.0...main.
    3. A new branch and PR will automatically be created
1. `bundle exec fastlane update_hybrid_common version:x.x.x` to set the purchases-hybrid-common version number if needed.
1. Run `npm run build` and make sure it works. If any issues appear, fix them first.
1. Wait until PR is approved and pull branch from origin (to make sure you've got all the changes locally)
1. Create a tag for the new release in the last commit of the branch and push the tag. The rest will be performed automatically by CircleCI. If the automation fails, you can revert to manually calling `bundle exec fastlane release`.
