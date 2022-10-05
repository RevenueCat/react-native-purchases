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

### prepare_next_version

```sh
[bundle exec] fastlane prepare_next_version
```

Creates PR changing version to next minor adding a -SNAPSHOT suffix

### release

```sh
[bundle exec] fastlane release
```

Creates GitHub release and publishes package

### build_example

```sh
[bundle exec] fastlane build_example
```

Build example

### update_hybrid_common_versions

```sh
[bundle exec] fastlane update_hybrid_common_versions
```

Update hybrid common pod and gradle

### build_hybrid_example

```sh
[bundle exec] fastlane build_hybrid_example
```

Build hybrid example

### update_hybrid_common

```sh
[bundle exec] fastlane update_hybrid_common
```

Update Hybrid Common and builds examples. Calls update_hybrid_common, then build_hybrid_example and pushes changes to a new branch if open_pr option is true

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

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
