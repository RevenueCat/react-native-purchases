package com.reactlibrary;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.Purchase;
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Currency;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class RNPurchasesModule extends ReactContextBaseJavaModule implements UpdatedPurchaserInfoListener {

    private List<SkuDetails> products = new ArrayList<>();
    private static final String PURCHASER_INFO_UPDATED = "Purchases-PurchaserInfoUpdated";

    private final ReactApplicationContext reactContext;

    @SuppressWarnings("WeakerAccess")
    public RNPurchasesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
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
    public void setupPurchases(String apiKey, @Nullable String appUserID, boolean observerMode, final Promise promise) {
        Purchases.configure(reactContext, apiKey, appUserID, observerMode);
        Purchases.getSharedInstance().setUpdatedPurchaserInfoListener(this);
        promise.resolve(null);
    }

    @ReactMethod
    public void setAllowSharingStoreAccount(boolean allowSharingStoreAccount) {
        Purchases.getSharedInstance().setAllowSharingPlayStoreAccount(allowSharingStoreAccount);
    }

    @ReactMethod
    public void addAttributionData(ReadableMap data, Integer network, @Nullable String networkUserId) {
        try {
            for (Purchases.AttributionNetwork attributionNetwork : Purchases.AttributionNetwork.values()) {
                if (attributionNetwork.getServerValue() == network) {
                    Purchases.addAttributionData(convertMapToJson(data), attributionNetwork, networkUserId);
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
        putIntroPrice(detail, map);
        map.putString("currency_code", detail.getPriceCurrencyCode());
        return map;
    }

    private void putIntroPrice(SkuDetails detail, WritableMap map) {
        if (detail.getFreeTrialPeriod().isEmpty()) {
            String introductoryPriceAmountMicros = detail.getIntroductoryPriceAmountMicros();
            if (introductoryPriceAmountMicros != null && !introductoryPriceAmountMicros.isEmpty()) {
                map.putString("intro_price", String.valueOf(Long.parseLong(introductoryPriceAmountMicros) / 1000000d));
            } else {
                map.putString("intro_price", "");
            }
            map.putString("intro_price_string", detail.getIntroductoryPrice());
            map.putString("intro_price_period", detail.getIntroductoryPricePeriod());
            if (detail.getIntroductoryPricePeriod() != null && !detail.getIntroductoryPricePeriod().isEmpty()) {
                RNPurchasesPeriod period = RNPurchasesPeriod.parse(detail.getIntroductoryPricePeriod());
                if (period.years > 0) {
                    map.putString("intro_price_period_unit", "YEAR");
                    map.putString("intro_price_period_number_of_units", "" + period.years);
                } else if (period.months > 0) {
                    map.putString("intro_price_period_unit", "MONTH");
                    map.putString("intro_price_period_number_of_units", "" + period.months);
                } else if (period.days > 0) {
                    map.putString("intro_price_period_unit", "DAY");
                    map.putString("intro_price_period_number_of_units", "" + period.days);
                }
            } else {
                map.putString("intro_price_period_unit", "");
                map.putString("intro_price_period_number_of_units", "");
            }
            map.putString("intro_price_cycles", detail.getIntroductoryPriceCycles());
        } else {
            map.putString("intro_price", "0");
            // Format using device locale. iOS will format using App Store locale, but there's no way
            // to figure out how the price in the SKUDetails is being formatted.
            NumberFormat format = NumberFormat.getCurrencyInstance();
            format.setCurrency(Currency.getInstance(detail.getPriceCurrencyCode()));
            map.putString("intro_price_string", format.format(0));
            map.putString("intro_price_period", detail.getFreeTrialPeriod());
            RNPurchasesPeriod period = RNPurchasesPeriod.parse(detail.getFreeTrialPeriod());
            if (period.years > 0) {
                map.putString("intro_price_period_unit", "YEAR");
                map.putString("intro_price_period_number_of_units", "" + period.years);
            } else if (period.months > 0) {
                map.putString("intro_price_period_unit", "MONTH");
                map.putString("intro_price_period_number_of_units", "" + period.months);
            } else if (period.days > 0) {
                map.putString("intro_price_period_unit", "DAY");
                map.putString("intro_price_period_number_of_units", "" + period.days);
            }
            map.putString("intro_price_cycles", "1");
        }
    }

    @ReactMethod
    public void getEntitlements(final Promise promise) {
        Purchases.getSharedInstance().getEntitlements(new ReceiveEntitlementsListener() {
            @Override
            public void onReceived(@NonNull Map<String, Entitlement> entitlementMap) {
                promise.resolve(mapEntitlementsAndCacheProducts(entitlementMap));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                reject(promise, error);
            }
        });
    }

    private WritableMap mapEntitlementsAndCacheProducts(@NonNull Map<String, Entitlement> entitlementMap) {
        products = new ArrayList<>();
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
                            products.add(skuDetails);
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
        return response;
    }

    @ReactMethod
    public void getProductInfo(ReadableArray productIDs, String type, final Promise promise) {
        ArrayList<String> productIDList = new ArrayList<>();

        for (int i = 0; i < productIDs.size(); i++) {
            productIDList.add(productIDs.getString(i));
        }
        GetSkusResponseListener listener = new GetSkusResponseListener() {
            @Override
            public void onReceived(@NonNull List<SkuDetails> skus) {
                WritableArray writableArray = Arguments.createArray();
                for (SkuDetails detail : skus) {
                    writableArray.pushMap(mapForSkuDetails(detail));
                }

                promise.resolve(writableArray);
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                reject(promise, error);
            }

        };

        if (type.toLowerCase().equals("subs")) {
            Purchases.getSharedInstance().getSubscriptionSkus(productIDList, listener);
        } else {
            Purchases.getSharedInstance().getNonSubscriptionSkus(productIDList, listener);
        }
    }

    @ReactMethod
    public void makePurchase(final String productIdentifier, final String oldSku, final String type,
                             final Promise promise) {
        final Activity currentActivity = getCurrentActivity();
        if (currentActivity != null) {
            if (products.isEmpty()) {
                Purchases.getSharedInstance().getEntitlements(new ReceiveEntitlementsListener() {
                    @Override
                    public void onReceived(@NonNull Map<String, Entitlement> entitlementMap) {
                        mapEntitlementsAndCacheProducts(entitlementMap);
                        makePurchase(currentActivity, oldSku, type, productIdentifier, promise);
                    }

                    @Override
                    public void onError(@NonNull PurchasesError error) {
                        reject(promise, error);
                    }
                });
            } else {
                makePurchase(currentActivity, oldSku, type, productIdentifier, promise);
            }
        } else {
            reject(promise,
                    new PurchasesError(
                            PurchasesErrorCode.PurchaseInvalidError,
                            "There is no current Activity"));
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
                promise.resolve(mapPurchaserInfo(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                reject(promise, error);
            }
        });
    }

    @ReactMethod
    public void reset(final Promise promise) {
        Purchases.getSharedInstance().reset(new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                promise.resolve(mapPurchaserInfo(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                reject(promise, error);
            }
        });
    }

    @ReactMethod
    public void identify(String appUserID, final Promise promise) {
        Purchases.getSharedInstance().identify(appUserID, new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                promise.resolve(mapPurchaserInfo(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                reject(promise, error);
            }
        });
    }

    @ReactMethod
    public void createAlias(String newAppUserID, final Promise promise) {
        Purchases.getSharedInstance().createAlias(newAppUserID, new ReceivePurchaserInfoListener() {
            @Override
            public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
                promise.resolve(mapPurchaserInfo(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                reject(promise, error);
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
                promise.resolve(mapPurchaserInfo(purchaserInfo));
            }

            @Override
            public void onError(@NonNull PurchasesError error) {
                reject(promise, error);
            }
        });
    }

    @ReactMethod
    public void setFinishTransactions(boolean enabled) {
        Purchases.getSharedInstance().setFinishTransactions(enabled);
    }

    @ReactMethod
    public void syncPurchases() {
        Purchases.getSharedInstance().syncPurchases();
    }

    private WritableMap mapPurchaserInfo(PurchaserInfo purchaserInfo) {
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

        Mappers.putNullableDate(map, "latestExpirationDate", purchaserInfo.getLatestExpirationDate());

        WritableMap allExpirationDates = Arguments.createMap();
        Map<String, Date> dates = purchaserInfo.getAllExpirationDatesByProduct();
        for (String key : dates.keySet()) {
            Date date = dates.get(key);
            if (date != null) {
                allExpirationDates.putString(key, Iso8601Utils.format(date));
            } else {
                allExpirationDates.putNull(key);
            }
        }
        map.putMap("allExpirationDates", allExpirationDates);

        WritableMap allEntitlementExpirationDates = Arguments.createMap();

        for (String entitlementId : purchaserInfo.getActiveEntitlements()) {
            Date date = purchaserInfo.getExpirationDateForEntitlement(entitlementId);
            Mappers.putNullableDate(allEntitlementExpirationDates, entitlementId, date);
        }
        map.putMap("expirationsForActiveEntitlements", allEntitlementExpirationDates);

        WritableMap purchaseDatesForActiveEntitlements = Arguments.createMap();

        for (String entitlementId : purchaserInfo.getActiveEntitlements()) {
            Date date = purchaserInfo.getPurchaseDateForEntitlement(entitlementId);
            Mappers.putNullableDate(purchaseDatesForActiveEntitlements, entitlementId, date);
        }
        map.putMap("purchaseDatesForActiveEntitlements", purchaseDatesForActiveEntitlements);

        map.putMap("entitlements", Mappers.map(purchaserInfo.getEntitlements()));
        map.putString("firstSeen", Iso8601Utils.format(purchaserInfo.getFirstSeen()));
        map.putString("originalAppUserId",purchaserInfo.getOriginalAppUserId());

        return map;
    }

    @Override
    public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RNPurchasesModule.PURCHASER_INFO_UPDATED, mapPurchaserInfo(purchaserInfo));
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

    private static JSONArray convertArrayToJson(ReadableArray readableArray) throws
            JSONException {
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

    private static void reject(Promise promise, PurchasesError error) {
        WritableMap userInfoMap = Arguments.createMap();
        userInfoMap.putString("message", error.getMessage());
        userInfoMap.putString("readable_error_code", error.getCode().name());
        if (error.getUnderlyingErrorMessage() != null && !error.getUnderlyingErrorMessage().isEmpty()) {
            userInfoMap.putString("underlyingErrorMessage", error.getUnderlyingErrorMessage());
        }
        promise.reject(error.getCode().ordinal() + "", error.getMessage(), userInfoMap);
    }

    @Nullable
    private SkuDetails findProduct(String productIdentifier, String type) {
        for (SkuDetails product : products) {
            if (product.getSku().equals(productIdentifier) && product.getType().equalsIgnoreCase(type)) {
                return product;
            }
        }
        return null;
    }

    private void makePurchase(final Activity currentActivity, final String oldSku, final String type,
                              final String productIdentifier, final Promise promise) {
        SkuDetails productToBuy = findProduct(productIdentifier, type);
        if (productToBuy != null) {
            MakePurchaseListener listener = new MakePurchaseListener() {
                @Override
                public void onCompleted(@NonNull Purchase purchase, @NonNull PurchaserInfo purchaserInfo) {
                    WritableMap map = Arguments.createMap();
                    map.putString("productIdentifier", purchase.getSku());
                    map.putMap("purchaserInfo", mapPurchaserInfo(purchaserInfo));
                    promise.resolve(map);
                }

                @Override
                public void onError(@NonNull PurchasesError error, Boolean userCancelled) {
                    reject(promise, error);
                }
            };
            if (oldSku == null || oldSku.isEmpty()) {
                Purchases.getSharedInstance().makePurchase(currentActivity, productToBuy, listener);    
            } else {
                Purchases.getSharedInstance().makePurchase(currentActivity, productToBuy, oldSku, listener);
            }
        } else {
            reject(promise, new PurchasesError(
                    PurchasesErrorCode.ProductNotAvailableForPurchaseError,
                    "Couldn't find product."));
        }
    }
}
