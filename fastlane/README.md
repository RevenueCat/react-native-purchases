fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### bump

```sh
[bundle exec] fastlane bump
```

Bump version, edit changelog, and create pull request

### update_version

```sh
[bundle exec] fastlane update_version
```

Update version number in all files that need to be updated

### automatic_bump

```sh
[bundle exec] fastlane automatic_bump
```

Automatically bumps version, edit changelog, and create pull request

### github_release

```sh
[bundle exec] fastlane github_release
```

Make github release

### release

```sh
[bundle exec] fastlane release
```

Creates GitHub release and publishes react-native-purchases and react-native-purchases-ui

### build_example

```sh
[bundle exec] fastlane build_example
```

Build example

### update_hybrid_common

```sh
[bundle exec] fastlane update_hybrid_common
```

Update purchases-hybrid-common version, pushes changes to a new branch if open_pr option is true

### generate_docs

```sh
[bundle exec] fastlane generate_docs
```

Generate docs

### tag_current_branch

```sh
[bundle exec] fastlane tag_current_branch
```

Tag current branch with current version number

### trigger_bump

```sh
[bundle exec] fastlane trigger_bump
```

Trigger bump

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
