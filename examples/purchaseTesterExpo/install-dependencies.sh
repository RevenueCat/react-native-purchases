#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
touch yarn.lock

# The tarball paths and package versions can stay the same across builds.
# Clear both cached and installed copies so Yarn reads the new archives.
for package in react-native-purchases react-native-purchases-ui; do
  rm -f -- .yarn/cache/"${package}"-file-*.zip
  rm -rf -- "node_modules/${package}"
done

yarn install
