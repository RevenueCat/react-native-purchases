#!/bin/sh

cd ../android/

VERSION=$1
CURRENT_VERSION=$(cat .common_version)

if [ "$VERSION" == "$CURRENT_VERSION" ]; then
  echo "The newest version is already installed. Exiting."
  exit 0
fi

pwd

URL=https://github.com/RevenueCat/purchases-hybrid-common/archive/$VERSION.zip

echo "Downloading Purchases common hybrid SDKs classes $VERSION from $URL, this may take a minute."

if ! which curl > /dev/null; then echo "curl command not found. Please install curl"; exit 1; fi;
if ! which unzip > /dev/null; then echo "unzip command not found. Please install unzip"; exit 1; fi;

if [[ -d ../android/src/main/java/com/revenuecat/purchases/common ]]; then
    echo "Old Android classes found. Removing them and installing version $VERSION"
    rm -rf ../android/src/main/java/com/revenuecat/purchases/common
fi

curl -sSL $URL > tempCommon.zip
# In some cases the temp folder can not be created by unzip, https://github.com/RevenueCat/react-native-purchases/issues/26
mkdir -p tempCommon
unzip -o tempCommon.zip -d tempCommon
ls tempCommon
mv tempCommon/purchases-hybrid-common-$VERSION/android/common/src/main/java/com/revenuecat/purchases/common/ ../android/src/main/java/com/revenuecat/purchases/
rm -r tempCommon
rm tempCommon.zip

if ! [[ -d ../android/src/main/java/com/revenuecat/purchases/common ]]; then
  echo "Common files not found. Please reinstall react-native-purchases"; exit 1;
fi

echo "$VERSION" > .common_version
