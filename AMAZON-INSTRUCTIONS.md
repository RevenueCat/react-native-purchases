Adds initial Amazon store support. In order to use please point to this tag in your `package.json` like this:

```
    "react-native-purchases": "RevenueCat/react-native-purchases#amazon"
```

Then configure the package using your **RevenueCat API key specific for Amazon** and passing `useAmazon: true`:

```
    Purchases.setup({apiKey: "api_key", useAmazon: true});
```

Please note that the setup call has changed and now accepts an object. This is to be able to use named arguments.

Check your `android/app/build.gradle` to make sure there is a dependency on everything included in the `libs` folder. React Native adds this by default:

```
dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
```

The next step would be to add the `jar` to your project. For that you can use the following gradle task that can be added to `android/app/build.gradle` and run via `./gradlew getAmazonLibrary` in the android folder of your project or via Android Studio :

```
// Gradle task to download Amazon library
ext {
    iapVersion = "2.0.76"
}

task getAmazonLibrary {
    ext {
        downloadURL = "https://amzndevresources.com/iap/sdk/AmazonInAppPurchasing_Android.zip"
        fileToExtract = "in-app-purchasing-${iapVersion}.jar"
        destFile = new File( projectDir, "libs/$fileToExtract" )
    }

    inputs.property( 'downloadURL', downloadURL )
    inputs.property( 'fileToExtract', fileToExtract )
    outputs.file( destFile )

    doLast {
        File destDir = destFile.parentFile
        destDir.mkdirs()

        File downloadFile = new File( temporaryDir, 'download.zip' )
        new URL( downloadURL ).withInputStream { is ->
            downloadFile.withOutputStream { it << is }
        }

        project.copy {
            from {
                zipTree(downloadFile).matching { include "**/$fileToExtract" }.singleFile
            }

            into( destDir )
        }
    }
}
```

That gradle task will add the jar to the `libs` folder inside `app`:

![Screen Shot 2021-08-27 at 5 58 53 PM](https://user-images.githubusercontent.com/664544/131201128-9709fa17-a276-4caa-b70e-7d6037c66fb4.png)


Alternatively, you can do this manually by downloading the .zip from [Amazon](https://amzndevresources.com/iap/sdk/AmazonInAppPurchasing_Android.zip) and then unzipping and moving the `in-app-purchasing-2.0.76.jar` into your projects `android/app/libs/` folder like in the screenshot above.

Due to some limitations, RevenueCat will only validate purchases made in production or in Live App Testing and won't validate purchases made with the Amazon App Tester.
