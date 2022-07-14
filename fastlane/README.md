fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### bump_and_update_changelog

```sh
[bundle exec] fastlane bump_and_update_changelog
```

Increment build numbers

### build_example

```sh
[bundle exec] fastlane build_example
```

Build example

### prepare_for_release

```sh
[bundle exec] fastlane prepare_for_release
```

Prepare for release by bumping verion and building the example.

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

### update_ios_pod

```sh
[bundle exec] fastlane update_ios_pod
```

Update iOS pod version during hybrid update

### update_hybrid_common

```sh
[bundle exec] fastlane update_hybrid_common
```

Update Hybrid Common, Build PurchaseTester, and updates download scripts. Calls update_hybrid_common, then build_hybrid_example then update_ios_pod

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
