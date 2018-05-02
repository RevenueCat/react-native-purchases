
package com.reactlibrary;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.revenuecat.purchases.PurchaserInfo;
import com.revenuecat.purchases.Purchases;

public class RNPurchasesModule extends ReactContextBaseJavaModule implements Purchases.PurchasesListener {

  private final ReactApplicationContext reactContext;
  private Purchases purchases;

  public RNPurchasesModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    Log.i("RNPurchases", "Created Purchases Module");
  }

  @Override
  public String getName() {
    return "RNPurchases";
  }


  @ReactMethod
  public void setupPurchases(String apiKey, String appUserID) {
    purchases = new Purchases.Builder(reactContext, apiKey, this).appUserID(appUserID).build();
  }

  @Override
  public void onCompletedPurchase(PurchaserInfo purchaserInfo) {

  }

  @Override
  public void onFailedPurchase(Exception e) {

  }

  @Override
  public void onReceiveUpdatedPurchaserInfo(PurchaserInfo purchaserInfo) {

  }
}