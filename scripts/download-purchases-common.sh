#!/bin/sh

cd ios/

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

if [ -d ./Common ]; then
    echo "Old classes found. Removing them and installing version $VERSION"
    rm -rf ./Common
fi

curl -sSL $URL > tempCommon.zip
# In some cases the temp folder can not be created by unzip, https://github.com/RevenueCat/react-native-purchases/issues/26
mkdir -p tempCommon
unzip -o tempCommon.zip -d tempCommon
ls tempCommon
mv tempCommon/purchases-hybrid-common-$VERSION/ios/ Common
rm -r tempCommon
rm tempCommon.zip

if ! [ -d ./Common ]; then
  echo "Common files not found. Please reinstall react-native-purchases"; exit 1;
fi;

echo "$VERSION" > .common_version
