package com.reactlibrary;

import android.app.Activity;
import android.support.annotation.Nullable;
import android.util.Log;

import androidx.annotation.NonNull;
import com.android.billingclient.api.SkuDetails;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.revenuecat.purchases.*;
import com.revenuecat.purchases.interfaces.*;
import com.revenuecat.purchases.util.Iso8601Utils;

import kotlin.UninitializedPropertyAccessException;
import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class RNPurchasesModule extends ReactContextBaseJavaModule implements UpdatedPurchaserInfoListener {

    private static final String PURCHASER_INFO_UPDATED = "Purchases-PurchaserInfoUpdated";

    private final ReactApplicationContext reactContext;

    @SuppressWarnings("WeakerAccess")
    public RNPurchasesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNPurchases";
    }

    public void onCatalystInstanceDestroy() {
        try {
            Purchases.getSharedInstance().close();
        } catch (UninitializedPropertyAccessException e) {
            // there's no instance so all good
        }
    }

    @ReactMethod
    public void setupPurchases(String apiKey, @Nullable String appUserID, final Promise promise) {
        Purchases.configure(reactContext, apiKey, appUserID);
        Purchases.getSharedInstance().setUpdatedPurchaserInfoListener(this);
        promise.resolve(null);
    }

    @ReactMethod
    public void setAllowSharingStoreAccount(boolean allowSharingStoreAccount) {
        Purchases.getSharedInstance().setAllowSharingPlayStoreAccount(allowSharingStoreAccount);
    }

    @ReactMethod
    public void addAttributionData(ReadableMap data, Integer network) {
        try {
            for (Purchases.AttributionNetwork attributionNetwork : Purchases.AttributionNetwork.values()) {
                if (attributionNetwork.getServerValue() == network) {
                    Purchases.getSharedInstance().addAttributionData(convertMapToJson(data), attributionNetwork);
                }
            }
        } catch (JSONException e) {
            Log.e("RNPurchases", "Error parsing attribution date to JSON: " + e.getLocalizedMessage());
        }
    }

    private WritableMap mapForSkuDetails(final SkuDetails detail) {
        WritableMap map = Arguments.createMap();

        map.putString("identifier", detail.getSku());
        map.putString("description", detail.getDescription());
        map.putString("title", detail.getTitle());
        map.putDouble("price", detail.getPriceAmountMicros() / 1000000d);
        map.putString("price_string", detail.getPrice());
        String introductoryPriceAmountMicros = detail.getIntroductoryPriceAmountMicros();
        if (introductoryPriceAmountMicros != null && !introductoryPriceAmountMicros.isEmpty()) {
            map.putString("intro_price", String.valueOf(Long.parseLong(introductoryPriceAmountMicros) / 1000000d));
        } else {
            map.putString("intro_price", "");
        }
        map.putString("intro_price_string", detail.getIntroductoryPrice());
        map.putString("intro_price_period", detail.getIntroductoryPricePeriod());
        map.putString("intro_price_cycles", detail.getIntroductoryPriceCycles());

        map.putString("currency_code", detail.getPriceCurrencyCode());

        return map;
    }

    @ReactMethod
    public void getEntitlements(final Promise promise) {
        Purchases.getSharedInstance().getEntitlements(new ReceiveEntitlementsListener() {
            @Override
            public void onReceived(@NonNull Map<String, Entitlement> entitlementMap) {
                WritableMap response = Arguments.createMap();

                for (String entId : entitlementMap.keySet()) {
                    Entitlement ent = entitlementMap.get(entId);
                    WritableMap offeringsMap = Arguments.createMap();
                    if (ent != null) {
                        Map<String, Offering> offerings = ent.getOfferings();
                        for (String offeringId : offerings.keySet()) {
                            Offering offering = offerings.get(offeringId);
                            if (offering != null) {
                                SkuDetails skuDetails = offering.getSkuDetails();
                                if (skuDetails != null) {
                                    WritableMap skuMap = mapForSkuDetails(skuDetails);
                                    offeringsMap.putMap(offeringId, skuMap);
                                } else {
                                    offeringsMap.putNull(offeringId);
                                }
                            }
                        }
                    }

                    response.putMap(entId, offeringsMap);
                }

                promise.resolve(response);
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                promise.reject("ERROR_GETTING_ENTITLEMENTS", error.toString());
            }
        });
    }

    @ReactMethod
    public void getProductInfo(ReadableArray productIDs, String type, final Promise promise) {
        ArrayList<String> productIDList = new ArrayList<>();

        for (int i = 0; i < productIDs.size(); i++) {
            productIDList.add(productIDs.getString(i));
        }
        GetSkusResponseListener listener = new GetSkusResponseListener() {
            @Override
            public void onReceiveSkus(@NonNull List<SkuDetails> skus) {
                WritableArray writableArray = Arguments.createArray();
                for (SkuDetails detail : skus) {
                    writableArray.pushMap(mapForSkuDetails(detail));
                }

                promise.resolve(writableArray);
            }
        };

        if (type.toLowerCase().equals("subs")) {
            Purchases.getSharedInstance().getSubscriptionSkus(productIDList, listener);
        } else {
            Purchases.getSharedInstance().getNonSubscriptionSkus(productIDList, listener);
        }
    }

    @ReactMethod
    public void makePurchase(final String productIdentifier, ReadableArray oldSkus, String type,
            final Promise promise) {
        ArrayList<String> oldSkusList = new ArrayList<>();
        for (Object oldSku : oldSkus.toArrayList()) {
            oldSkusList.add((String) oldSku);
        }

        Activity currentActivity = getCurrentActivity();
        if (currentActivity != null) {
            Purchases.getSharedInstance().makePurchase(currentActivity, productIdentifier, type, oldSkusList,
                    new PurchaseCompletedListener() {
                        @Override
                        public void onCompleted(@NonNull String sku, @NonNull PurchaserInfo purchaserInfo) {
                            WritableMap map = Arguments.createMap();
                            map.putString("productIdentifier", sku);
                            map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));
                            promise.resolve(map);
                        }

                        @Override
                        public void onError(@NonNull PurchasesError error) {
                            if (error.getDomain() == Purchases.ErrorDomains.PLAY_BILLING && error.getCode() == 1) {
                                promise.reject("ERROR_MAKING_PURCHASE", MakePurchaseThrowable.init(error, true));
                            } else {
                                promise.reject("ERROR_MAKING_PURCHASE", MakePurchaseThrowable.init(error, false));
                            }
                        }
                    });
        } else {
            promise.reject("ERROR_MAKING_PURCHASE", "There is no current Activity");
        }
    }

    @ReactMethod
    public void getAppUserID(final Promise promise) {
        promise.resolve(Purchases.getSharedInstance().getAppUserID());
    }

    @ReactMethod
    public void restoreTransactions(final Promise promise) {
        Purchases.getSharedInstance().restorePurchases(new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                WritableMap map = Arguments.createMap();
                map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));
                promise.resolve(map);
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                promise.reject("ERROR_RESTORING_TRANSACTIONS", error.toString());
            }
        });
    }

    @ReactMethod
    public void reset(final Promise promise) {
        Purchases.getSharedInstance().reset(new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                promise.resolve(purchaserInfo);
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                promise.reject("ERROR_RESETTING", error.toString());
            }
        });
    }

    @ReactMethod
    public void identify(String appUserID, final Promise promise) {
        Purchases.getSharedInstance().identify(appUserID, new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                promise.resolve(createPurchaserInfoMap(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                promise.reject("ERROR_IDENTIFYING", error.toString());
            }
        });
    }

    @ReactMethod
    public void createAlias(String newAppUserID, final Promise promise) {
        Purchases.getSharedInstance().createAlias(newAppUserID, new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                promise.resolve(createPurchaserInfoMap(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                promise.reject("ERROR_ALIASING", error.toString());
            }
        });
    }

    @ReactMethod
    public void setDebugLogsEnabled(boolean enabled) {
        Purchases.setDebugLogsEnabled(enabled);
    }

    @ReactMethod
    public void getPurchaserInfo(final Promise promise) {
        Purchases.getSharedInstance().getPurchaserInfo(new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                promise.resolve(createPurchaserInfoMap(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                promise.reject("ERROR_GETTING_PURCHASER_INFO", error.toString());
            }
        });
    }

    private void sendEvent(@Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RNPurchasesModule.PURCHASER_INFO_UPDATED, params);
    }

    private WritableMap createPurchaserInfoMap(PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();

        WritableArray allActiveEntitlements = Arguments.createArray();
        for (String activeEntitlement : purchaserInfo.getActiveEntitlements()) {
            allActiveEntitlements.pushString(activeEntitlement);
        }
        map.putArray("activeEntitlements", allActiveEntitlements);

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
        Map<String, Date> dates = purchaserInfo.getAllExpirationDatesByProduct();
        for (String key : dates.keySet()) {
            Date date = dates.get(key);
            allExpirationDates.putString(key, Iso8601Utils.format(date));
        }
        map.putMap("allExpirationDates", allExpirationDates);

        WritableMap allEntitlementExpirationDates = Arguments.createMap();

        for (String entitlementId : purchaserInfo.getActiveEntitlements()) {
            Date date = purchaserInfo.getExpirationDateForEntitlement(entitlementId);
            if (date != null) {
                allEntitlementExpirationDates.putString(entitlementId, Iso8601Utils.format(date));
            } else {
                allEntitlementExpirationDates.putNull(entitlementId);
            }
        }
        map.putMap("expirationsForActiveEntitlements", allEntitlementExpirationDates);

        return map;
    }

    @Override
    public void onReceived(PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();

        map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));

        sendEvent(map);
    }

    private static JSONObject convertMapToJson(ReadableMap readableMap) throws JSONException {
        JSONObject object = new JSONObject();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (readableMap.getType(key)) {
            case Null:
                object.put(key, JSONObject.NULL);
                break;
            case Boolean:
                object.put(key, readableMap.getBoolean(key));
                break;
            case Number:
                object.put(key, readableMap.getDouble(key));
                break;
            case String:
                object.put(key, readableMap.getString(key));
                break;
            case Map:
                object.put(key, convertMapToJson(readableMap.getMap(key)));
                break;
            case Array:
                object.put(key, convertArrayToJson(readableMap.getArray(key)));
                break;
            }
        }
        return object;
    }

    private static JSONArray convertArrayToJson(ReadableArray readableArray) throws JSONException {
        JSONArray array = new JSONArray();
        for (int i = 0; i < readableArray.size(); i++) {
            switch (readableArray.getType(i)) {
            case Null:
                break;
            case Boolean:
                array.put(readableArray.getBoolean(i));
                break;
            case Number:
                array.put(readableArray.getDouble(i));
                break;
            case String:
                array.put(readableArray.getString(i));
                break;
            case Map:
                array.put(convertMapToJson(readableArray.getMap(i)));
                break;
            case Array:
                array.put(convertArrayToJson(readableArray.getArray(i)));
                break;
            }
        }
        return array;
    }
}
