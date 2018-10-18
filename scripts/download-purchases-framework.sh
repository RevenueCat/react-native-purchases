#!/bin/sh

cd ios/

VERSION=$1
CURRENT_VERSION=$(cat .framework_version)

if [ "$VERSION" == "$CURRENT_VERSION" ]; then
  echo "The newest version is already installed. Exiting."
  exit 0
fi

pwd

URL=https://github.com/RevenueCat/purchases-ios/releases/download/$VERSION/Purchases.framework.zip

echo "Downloading Purchases iOS $VERSION from $URL, this may take a minute."

if ! which curl > /dev/null; then echo "curl command not found. Please install curl"; exit 1; fi;
if ! which unzip > /dev/null; then echo "unzip command not found. Please install unzip"; exit 1; fi;

if [ -d ./Purchases.framework ]; then
    echo "Old Purchases.framework found. Removing it and installing a $VERSION"
    rm -rf ./Purchases.framework
fi

curl -sSL $URL > temp.zip
unzip -o temp.zip
rm temp.zip

if ! [ -d ./Purchases.framework ]; then
  echo "Purchases.framework not found. Please reinstall react-native-purchases"; exit 1;
fi;

echo "$VERSION" > .framework_version
