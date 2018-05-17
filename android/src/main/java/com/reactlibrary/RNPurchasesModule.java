
package com.reactlibrary;

import android.support.annotation.Nullable;

import com.android.billingclient.api.SkuDetails;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.revenuecat.purchases.PurchaserInfo;
import com.revenuecat.purchases.Purchases;
import com.revenuecat.purchases.util.Iso8601Utils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class RNPurchasesModule extends ReactContextBaseJavaModule implements Purchases.PurchasesListener {

    private static final String PURCHASE_COMPLETED_EVENT = "Purchases-PurchaseCompleted";
    private static final String PURCHASER_INFO_UPDATED = "Purchases-PurchaserInfoUpdated";

    private final ReactApplicationContext reactContext;
    private Purchases purchases;

    public RNPurchasesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNPurchases";
    }

    private void checkPurchases() {
        if (purchases == null) {
            throw new RuntimeException("You must call setupPurchases first");
        }
    }

    @ReactMethod
    public void setupPurchases(String apiKey, String appUserID) {
        purchases = new Purchases.Builder(reactContext, apiKey, this).appUserID(appUserID).build();
    }

    @ReactMethod
    public void getProductInfo(ReadableArray productIDs, String type, final Promise promise) {
        checkPurchases();
        ArrayList<String> productIDList = new ArrayList<>();

        for (int i = 0; i < productIDs.size(); i++) {
            productIDList.add(productIDs.getString(i));
        }

        Purchases.GetSkusResponseHandler handler = new Purchases.GetSkusResponseHandler() {
            @Override
            public void onReceiveSkus(List<SkuDetails> skus) {
                WritableArray writableArray = Arguments.createArray();
                for (SkuDetails detail : skus) {
                    WritableMap map = Arguments.createMap();

                    map.putString("identifier", detail.getSku());
                    map.putString("description", detail.getDescription());
                    map.putString("title", detail.getTitle());
                    map.putDouble("price", detail.getPriceAmountMicros() / 1000);
                    map.putString("price_string", detail.getPrice());

                    map.putString("intro_price", detail.getIntroductoryPriceAmountMicros());
                    map.putString("intro_price_string", detail.getIntroductoryPrice());
                    map.putString("intro_price_period", detail.getIntroductoryPricePeriod());
                    map.putString("intro_price_cycles", detail.getIntroductoryPriceCycles());

                    writableArray.pushMap(map);
                }

                promise.resolve(writableArray);
            }
        };

        if (type.toLowerCase().equals("subs")) {
            purchases.getSubscriptionSkus(productIDList, handler);
        } else {
            purchases.getNonSubscriptionSkus(productIDList, handler);
        }
    }

    @ReactMethod
    public void makePurchase(String productIdentifier, String type) {
        checkPurchases();
        purchases.makePurchase(getCurrentActivity(), productIdentifier, type);
    }

    @ReactMethod
    public void getAppUserID(final Promise promise) {
        promise.resolve(purchases.getAppUserID());
    }

    private void sendEvent(String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private WritableMap createPurchaserInfoMap(PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();

        WritableArray allActiveSubscriptions = Arguments.createArray();
        for (String activeSubscription : purchaserInfo.getActiveSubscriptions()) {
            allActiveSubscriptions.pushString(activeSubscription);
        }
        map.putArray("activeSubscriptions", allActiveSubscriptions);

        WritableArray allPurchasedProductIds = Arguments.createArray();
        for (String productIdentifier : purchaserInfo.getAllPurchasedSkus()) {
            allPurchasedProductIds.pushString(productIdentifier);
        }
        map.putArray("allPurchasedProductIdentifiers", allPurchasedProductIds);

        Date latest = purchaserInfo.getLatestExpirationDate();
        if (latest != null) {
            map.putString("latestExpirationDate", Iso8601Utils.format(latest));
        } else {
            map.putNull("latestExpirationDate");
        }

        WritableMap allExpirationDates = Arguments.createMap();
        Map<String, Date> dates = purchaserInfo.getAllExpirationDates();
        for (String key : dates.keySet()) {
            Date date = dates.get(key);
            allExpirationDates.putString(key, Iso8601Utils
                    .format(date));
        }
        map.putMap("allExpirationDates", allExpirationDates);

        return map;
    }

    @Override
    public void onCompletedPurchase(String sku, PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();
        map.putString("productIdentifier", sku);
        map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));
        sendEvent(PURCHASE_COMPLETED_EVENT, map);
    }

    @Override
    public void onFailedPurchase(int domain, int code, String message) {
        WritableMap map = Arguments.createMap();
        WritableMap errorMap = Arguments.createMap();
        String domainString;

        switch (domain) {
            case Purchases.ErrorDomains.REVENUECAT_BACKEND:
                domainString = "RevenueCat Backend";
            case Purchases.ErrorDomains.PLAY_BILLING:
                domainString = "Play Billing";
            default:
                domainString = "Unknown";
        }

        errorMap.putString("message", message);
        errorMap.putInt("code", code);
        errorMap.putString("domain", domainString);

        map.putMap("error", errorMap);

        sendEvent(PURCHASE_COMPLETED_EVENT, map);
    }

    @Override
    public void onReceiveUpdatedPurchaserInfo(PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();

        map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));

        sendEvent(PURCHASER_INFO_UPDATED, map);
    }
}