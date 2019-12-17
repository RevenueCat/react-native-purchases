package com.reactlibrary;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.revenuecat.purchases.PurchaserInfo;
import com.revenuecat.purchases.Purchases;
import com.revenuecat.purchases.common.CommonKt;
import com.revenuecat.purchases.common.ErrorContainer;
import com.revenuecat.purchases.common.MappersKt;
import com.revenuecat.purchases.common.OnResult;
import com.revenuecat.purchases.common.OnResultList;
import com.revenuecat.purchases.interfaces.UpdatedPurchaserInfoListener;

import org.jetbrains.annotations.NotNull;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import kotlin.UninitializedPropertyAccessException;

import static com.reactlibrary.RNPurchasesConverters.convertMapToWriteableMap;

public class RNPurchasesModule extends ReactContextBaseJavaModule implements UpdatedPurchaserInfoListener {

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
        CommonKt.setAllowSharingAppStoreAccount(allowSharingStoreAccount);
    }

    @ReactMethod
    public void addAttributionData(ReadableMap data, Integer network, @Nullable String networkUserId) {
        try {
            CommonKt.addAttributionData(RNPurchasesConverters.convertReadableMapToJson(data), network, networkUserId);
        } catch (JSONException e) {
            Log.e("RNPurchases", "Error parsing attribution date to JSON: " + e.getLocalizedMessage());
        }
    }

    @ReactMethod
    public void getOfferings(final Promise promise) {
        CommonKt.getOfferings(getOnResult(promise));
    }

    @ReactMethod
    public void getProductInfo(ReadableArray productIDs, String type, final Promise promise) {
        ArrayList<String> productIDList = new ArrayList<>();
        for (int i = 0; i < productIDs.size(); i++) {
            productIDList.add(productIDs.getString(i));
        }
        CommonKt.getProductInfo(productIDList, type, new OnResultList() {
            @Override
            public void onReceived(List<Map<String, ?>> map) {
                WritableArray writableArray = Arguments.createArray();
                for (Map<String, ?> detail : map) {
                    writableArray.pushMap(convertMapToWriteableMap(detail));
                }
                promise.resolve(writableArray);
            }

            @Override
            public void onError(ErrorContainer errorContainer) {
                promise.reject(errorContainer.getCode() + "", errorContainer.getMessage(), convertMapToWriteableMap(errorContainer.getInfo()));
            }
        });
    }

    @ReactMethod
    public void purchaseProduct(final String productIdentifier,
                                @Nullable final ReadableMap upgradeInfo,
                                final String type,
                                final Promise promise) {
        CommonKt.purchaseProduct(
                getCurrentActivity(),
                productIdentifier,
                upgradeInfo != null && upgradeInfo.hasKey("oldSKU") ? upgradeInfo.getString("oldSKU") : null,
                upgradeInfo != null && upgradeInfo.hasKey("prorationMode") ? upgradeInfo.getInt("prorationMode") : null,
                type,
                getOnResult(promise));
    }

    @ReactMethod
    public void purchasePackage(final String packageIdentifier,
                                final String offeringIdentifier,
                                @Nullable final ReadableMap upgradeInfo,
                                final Promise promise) {
        CommonKt.purchasePackage(
                getCurrentActivity(),
                packageIdentifier,
                offeringIdentifier,
                upgradeInfo != null && upgradeInfo.hasKey("oldSKU") ? upgradeInfo.getString("oldSKU") : null,
                upgradeInfo != null && upgradeInfo.hasKey("prorationMode") ? upgradeInfo.getInt("prorationMode") : null,
                getOnResult(promise));
    }

    @ReactMethod
    public void getAppUserID(final Promise promise) {
        promise.resolve(CommonKt.getAppUserID());
    }

    @ReactMethod
    public void restoreTransactions(final Promise promise) {
        CommonKt.restoreTransactions(getOnResult(promise));
    }

    @ReactMethod
    public void reset(final Promise promise) {
        CommonKt.reset(getOnResult(promise));
    }

    @ReactMethod
    public void identify(String appUserID, final Promise promise) {
        CommonKt.identify(appUserID, getOnResult(promise));
    }

    @ReactMethod
    public void createAlias(String newAppUserID, final Promise promise) {
        CommonKt.createAlias(newAppUserID, getOnResult(promise));
    }

    @ReactMethod
    public void setDebugLogsEnabled(boolean enabled) {
        CommonKt.setDebugLogsEnabled(enabled);
    }

    @ReactMethod
    public void getPurchaserInfo(final Promise promise) {
        CommonKt.getPurchaserInfo(getOnResult(promise));
    }

    @ReactMethod
    public void setFinishTransactions(boolean enabled) {
        CommonKt.setFinishTransactions(enabled);
    }

    @ReactMethod
    public void syncPurchases() {
        CommonKt.syncPurchases();
    }

    @ReactMethod
    public void isAnonymous(final Promise promise) {
        promise.resolve(CommonKt.isAnonymous());
    }

    @ReactMethod
    public void checkTrialOrIntroductoryPriceEligibility(ReadableArray productIDs, final Promise promise) {
        ArrayList<String> productIDList = new ArrayList<>();
        for (int i = 0; i < productIDs.size(); i++) {
            productIDList.add(productIDs.getString(i));
        }
        promise.resolve(convertMapToWriteableMap(CommonKt.checkTrialOrIntroductoryPriceEligibility(productIDList)));
    }

    @Override
    public void onReceived(@NonNull PurchaserInfo purchaserInfo) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RNPurchasesModule.PURCHASER_INFO_UPDATED, convertMapToWriteableMap(MappersKt.map((purchaserInfo))));
    }

    @NotNull
    private OnResult getOnResult(final Promise promise) {
        return new OnResult() {
            @Override
            public void onReceived(Map<String, ?> map) {
                promise.resolve(convertMapToWriteableMap(map));
            }

            @Override
            public void onError(ErrorContainer errorContainer) {
                promise.reject(errorContainer.getCode() + "", errorContainer.getMessage(), convertMapToWriteableMap(errorContainer.getInfo()));
            }
        };
    }

}
