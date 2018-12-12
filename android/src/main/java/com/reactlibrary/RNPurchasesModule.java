package com.reactlibrary;

import android.support.annotation.Nullable;
import android.util.Log;

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
import com.revenuecat.purchases.Entitlement;
import com.revenuecat.purchases.Offering;
import com.revenuecat.purchases.PurchaserInfo;
import com.revenuecat.purchases.Purchases;
import com.revenuecat.purchases.util.Iso8601Utils;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.Dictionary;
import java.util.List;
import java.util.Map;

public class RNPurchasesModule extends ReactContextBaseJavaModule implements Purchases.PurchasesListener {

    private static final String PURCHASE_COMPLETED_EVENT = "Purchases-PurchaseCompleted";
    private static final String PURCHASER_INFO_UPDATED = "Purchases-PurchaserInfoUpdated";
    private static final String TRANSACTIONS_RESTORED = "Purchases-RestoredTransactions";

    private final ReactApplicationContext reactContext;

    public RNPurchasesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNPurchases";
    }

    private void checkPurchases() {
        if (Purchases.getSharedInstance() == null) {
            throw new RuntimeException("You must call setupPurchases first");
        }
    }

    public void onCatalystInstanceDestroy() {
        if (Purchases.getSharedInstance() != null) {
            Purchases.getSharedInstance().close();
        }
    }

    @ReactMethod
    public void setupPurchases(String apiKey, String appUserID, final Promise promise) {
        if (Purchases.getSharedInstance() != null) {
            Purchases.getSharedInstance().close();
        }
        Purchases purchases = new Purchases.Builder(reactContext, apiKey).appUserID(appUserID).build();
        purchases.setListener(this);
        Purchases.setSharedInstance(purchases);
        promise.resolve(null);
    }

    @ReactMethod
    public void setAllowSharingStoreAccount(boolean allowSharingStoreAccount) {
        checkPurchases();
        Purchases.getSharedInstance().setAllowSharingPlayStoreAccount(allowSharingStoreAccount);
    }

    @ReactMethod
    public void addAttributionData(ReadableMap data, Integer network) {
        checkPurchases();
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
        checkPurchases();

        Purchases.getSharedInstance().getEntitlements(new Purchases.GetEntitlementsHandler() {

            @Override
            public void onReceiveEntitlements(Map<String, Entitlement> entitlementMap) {
                WritableMap response = Arguments.createMap();

                for (String entId : entitlementMap.keySet()) {
                    Entitlement ent = entitlementMap.get(entId);

                    WritableMap offeringsMap = Arguments.createMap();
                    Map<String, Offering> offerings = ent.getOfferings();

                    for (String offeringId : offerings.keySet()) {
                        Offering offering = offerings.get(offeringId);
                        SkuDetails skuDetails = offering.getSkuDetails();
                        if (skuDetails != null) {
                            WritableMap skuMap = mapForSkuDetails(skuDetails);
                            offeringsMap.putMap(offeringId, skuMap);
                        } else {
                            offeringsMap.putNull(offeringId);
                        }
                    }
                    response.putMap(entId, offeringsMap);
                }

                promise.resolve(response);
            }

            @Override
            public void onReceiveEntitlementsError(@NotNull Purchases.ErrorDomains domain, int code, @NotNull String message) {
                promise.reject("ERROR_FETCHING_ENTITLEMENTS", message);
            }
        });
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
                    writableArray.pushMap(mapForSkuDetails(detail));
                }

                promise.resolve(writableArray);
            }
        };

        if (type.toLowerCase().equals("subs")) {
            Purchases.getSharedInstance().getSubscriptionSkus(productIDList, handler);
        } else {
            Purchases.getSharedInstance().getNonSubscriptionSkus(productIDList, handler);
        }
    }

    @ReactMethod
    public void makePurchase(String productIdentifier, ReadableArray oldSkus, String type) {
        checkPurchases();

        ArrayList<String> oldSkusList = new ArrayList<>();
        for (Object oldSku : oldSkus.toArrayList()) {
            oldSkusList.add((String)oldSku);
        }

        Purchases.getSharedInstance().makePurchase(getCurrentActivity(), productIdentifier, type, oldSkusList);
    }

    @ReactMethod
    public void getAppUserID(final Promise promise) {
        promise.resolve(Purchases.getSharedInstance().getAppUserID());
    }

    @ReactMethod
    public void restoreTransactions() {
        checkPurchases();
        Purchases.getSharedInstance().restorePurchasesForPlayStoreAccount();
    }

    @ReactMethod
    public void reset() {
        checkPurchases();
        Purchases.getSharedInstance().reset();
    }

    @ReactMethod
    public void identify(String appUserID) {
        checkPurchases();
        Purchases.getSharedInstance().identify(appUserID);
    }

    @ReactMethod
    public void createAlias(String newAppUserID, final Promise promise) {
        checkPurchases();
        Purchases.getSharedInstance().createAlias(newAppUserID, new Purchases.AliasHandler() {

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }

            @Override
            public void onError(@NotNull Purchases.ErrorDomains errorDomains, int i, @NotNull String s) {
                promise.reject("ERROR_ALIASING", s);
            }
        });
    }

    private void sendEvent(String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
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
            allExpirationDates.putString(key, Iso8601Utils
                    .format(date));
        }
        map.putMap("allExpirationDates", allExpirationDates);

        WritableMap allEntitlementExpirationDates = Arguments.createMap();

        for (String entitlementId : purchaserInfo.getActiveEntitlements()) {
            Date date = purchaserInfo.getExpirationDateForEntitlement(entitlementId);
            if (date != null) {
                allEntitlementExpirationDates.putString(entitlementId, Iso8601Utils
                        .format(date));
            } else {
                allEntitlementExpirationDates.putNull(entitlementId);
            }
        }
        map.putMap("expirationsForActiveEntitlements", allEntitlementExpirationDates);

        return map;
    }

    @Override
    public void onCompletedPurchase(String sku, PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();
        map.putString("productIdentifier", sku);
        map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));
        sendEvent(PURCHASE_COMPLETED_EVENT, map);
    }

    private WritableMap errorMap(Purchases.ErrorDomains domain, int code, String message) {
        WritableMap errorMap = Arguments.createMap();
        String domainString;

        if (domain == Purchases.ErrorDomains.REVENUECAT_BACKEND) {
            domainString = "RevenueCat Backend";
        } else if (domain == Purchases.ErrorDomains.PLAY_BILLING) {
            domainString = "Play Billing";
        } else {
            domainString = "Unknown";
        }

        errorMap.putString("message", message);
        errorMap.putInt("code", code);
        errorMap.putString("domain", domainString);

        return errorMap;
    }

    @Override
    public void onFailedPurchase(@NotNull Purchases.ErrorDomains domain, int code, @org.jetbrains.annotations.Nullable String message) {
        WritableMap map = Arguments.createMap();

        map.putMap("error", errorMap(domain, code, message));

        sendEvent(PURCHASE_COMPLETED_EVENT, map);
    }

    @Override
    public void onReceiveUpdatedPurchaserInfo(PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();

        map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));

        sendEvent(PURCHASER_INFO_UPDATED, map);
    }

    @Override
    public void onRestoreTransactions(PurchaserInfo purchaserInfo) {
        WritableMap map = Arguments.createMap();
        map.putMap("purchaserInfo", createPurchaserInfoMap(purchaserInfo));

        sendEvent(TRANSACTIONS_RESTORED, map);
    }

    @Override
    public void onRestoreTransactionsFailed(@NotNull Purchases.ErrorDomains domain, int code, @org.jetbrains.annotations.Nullable String reason) {
        sendEvent(TRANSACTIONS_RESTORED, errorMap(domain, code, reason));
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
