#!/bin/sh
PREVIOUS_VERSION=$(awk -F\" '/"version":/ {print $4}' package.json)
NEW_VERSION=$1

sed -i.bck "s/$PREVIOUS_VERSION/$NEW_VERSION/" package.json
sed -i.bck "s/$PREVIOUS_VERSION/$NEW_VERSION/" ios/RNPurchases.m
sed -i.bck "s/$PREVIOUS_VERSION/$NEW_VERSION/" android/build.gradle

yarn example
pushd examples/purchaseTester
npx pod-install
popd