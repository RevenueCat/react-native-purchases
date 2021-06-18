#!/bin/sh
PREVIOUS_VERSION=$(cat RNPurchases.podspec | grep '"PurchasesHybridCommon", ' | awk '{print($3)}' | sed "s/'//g")
PREVIOUS_IOS_POD_VERSION=$(cat examples/purchaseTester/ios/Podfile.lock | grep ' Purchases (=' | awk '{print($4)}' | sed "s/)//g")

NEW_VERSION=$1

echo "Updating from $PREVIOUS_VERSION"

sed -i.bck "s/$PREVIOUS_VERSION/$NEW_VERSION/" RNPurchases.podspec
sed -i.bck "s/$PREVIOUS_VERSION/$NEW_VERSION/" android/build.gradle

yarn example
pushd examples/purchaseTester/ios
pod update PurchasesHybridCommon
popd

NEW_IOS_POD_VERSION=$(cat examples/purchaseTester/ios/Podfile.lock | grep ' Purchases (=' | awk '{print($4)}' | sed "s/)//g")
echo "Updating Purchases from $PREVIOUS_IOS_POD_VERSION to $NEW_IOS_POD_VERSION"

sed -i.bck "s/download-purchases-framework.sh $PREVIOUS_IOS_POD_VERSION/download-purchases-framework.sh $NEW_IOS_POD_VERSION/" scripts/build.js
sed -i.bck "s/download-purchases-common.sh $PREVIOUS_VERSION/download-purchases-common.sh $NEW_VERSION/" scripts/build.js
