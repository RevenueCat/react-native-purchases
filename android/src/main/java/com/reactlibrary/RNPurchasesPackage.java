
package com.reactlibrary;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.JavaScriptModule;

import org.jetbrains.annotations.NotNull;

public class RNPurchasesPackage implements ReactPackage {
  @NotNull
  @Override
  public List<NativeModule> createNativeModules(@NotNull ReactApplicationContext reactContext) {
    return Arrays.<NativeModule>asList(new RNPurchasesModule(reactContext));
  }

  // Deprecated from RN 0.47
  public List<Class<? extends JavaScriptModule>> createJSModules() {
    return Collections.emptyList();
  }

  @NotNull
  @Override
  public List<ViewManager> createViewManagers(@NotNull ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}