#!/bin/sh

cd ios/

VERSION=$1
CURRENT_VERSION=$(cat .common_version)

if [ "$VERSION" == "$CURRENT_VERSION" ]; then
  echo "The newest version is already installed. Exiting."
  exit 0
fi

pwd

URL=https://github.com/RevenueCat/purchases-hybrid-common/releases/download/$VERSION/PurchasesHybridCommon.framework.zip

echo "Downloading Purchases common hybrid SDKs classes $VERSION from $URL, this may take a minute."

if ! which curl > /dev/null; then echo "curl command not found. Please install curl"; exit 1; fi;
if ! which unzip > /dev/null; then echo "unzip command not found. Please install unzip"; exit 1; fi;

if [ -d ./PurchasesHybridCommon.framework ]; then
    echo "Old classes found. Removing them and installing version $VERSION"
    rm -rf ./PurchasesHybridCommon.framework
fi

curl -sSL $URL > tempCommon.zip
# In some cases the temp folder can not be created by unzip, https://github.com/RevenueCat/react-native-purchases/issues/26
mkdir -p tempCommon
unzip -o tempCommon.zip -d tempCommon
mv tempCommon/Carthage/Build/iOS/PurchasesHybridCommon.framework ./PurchasesHybridCommon.framework
rm -r tempCommon
rm tempCommon.zip

if ! [ -d ./PurchasesHybridCommon.framework ]; then
  echo "Common files not found. Please reinstall react-native-purchases"; exit 1;
fi;

echo "$VERSION" > .common_version
