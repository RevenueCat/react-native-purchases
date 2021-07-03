fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
### bump_version
```
fastlane bump_version
```
Increment build numbers
### build_example
```
fastlane build_example
```
Build example
### prepare_for_release
```
fastlane prepare_for_release
```
Prepare for release by bumping verion and building the example.
### update_hybrid_common
```
fastlane update_hybrid_common
```
Update hybrid common pod and gradle
### build_hybrid_example
```
fastlane build_hybrid_example
```
Build hybrid example
### update_ios_pod
```
fastlane update_ios_pod
```
Update iOS pod version during hybrid update
### update_hybrid_build_sample_update_scripts
```
fastlane update_hybrid_build_sample_update_scripts
```
Update Hybrid Common, Build PurchaseTester, and updates download scrips. Calls update_hybrid_common, then build_hybrid_example then update_ios_pod

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
