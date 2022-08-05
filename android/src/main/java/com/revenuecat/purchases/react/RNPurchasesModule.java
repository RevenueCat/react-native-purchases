package com.revenuecat.purchases.react;

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
import com.revenuecat.purchases.common.PlatformInfo;
import com.revenuecat.purchases.hybridcommon.CommonKt;
import com.revenuecat.purchases.hybridcommon.ErrorContainer;
import com.revenuecat.purchases.hybridcommon.OnResult;
import com.revenuecat.purchases.hybridcommon.OnResultAny;
import com.revenuecat.purchases.hybridcommon.OnResultList;
import com.revenuecat.purchases.hybridcommon.SubscriberAttributesKt;
import com.revenuecat.purchases.hybridcommon.mappers.PurchaserInfoMapperKt;
import com.revenuecat.purchases.interfaces.UpdatedPurchaserInfoListener;
import com.revenuecat.purchases.interfaces.Callback;

import org.jetbrains.annotations.NotNull;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kotlin.UninitializedPropertyAccessException;

import static com.revenuecat.purchases.react.RNPurchasesConverters.convertMapToWriteableMap;

public class RNPurchasesModule extends ReactContextBaseJavaModule implements UpdatedPurchaserInfoListener {

    private static final String PURCHASER_INFO_UPDATED = "Purchases-PurchaserInfoUpdated";
    public static final String PLATFORM_NAME = "react-native";
    public static final String PLUGIN_VERSION = "4.6.2";

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
    public void addListener(String eventName) {
      // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
      // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void setupPurchases(String apiKey, @Nullable String appUserID,
                               boolean observerMode, @Nullable String userDefaultsSuiteName) {
        PlatformInfo platformInfo = new PlatformInfo(PLATFORM_NAME, PLUGIN_VERSION);
        CommonKt.configure(reactContext, apiKey, appUserID, observerMode, platformInfo);
        Purchases.getSharedInstance().setUpdatedPurchaserInfoListener(this);
    }

    @ReactMethod
    public void setAllowSharingStoreAccount(boolean allowSharingStoreAccount) {
        CommonKt.setAllowSharingAppStoreAccount(allowSharingStoreAccount);
    }

    @ReactMethod
    public void addAttributionData(ReadableMap data, Integer network, @Nullable String networkUserId) {
        try {
            SubscriberAttributesKt.addAttributionData(RNPurchasesConverters.convertReadableMapToJson(data), network, networkUserId);
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
                promise.reject(errorContainer.getCode() + "", errorContainer.getMessage(),
                        convertMapToWriteableMap(errorContainer.getInfo()));
            }
        });
    }

    @ReactMethod
    public void purchaseProduct(final String productIdentifier,
                                @Nullable final ReadableMap upgradeInfo,
                                final String type,
                                @Nullable final String discountTimestamp,
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
                                @Nullable final String discountTimestamp,
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
    public void logOut(final Promise promise) {
        CommonKt.logOut(getOnResult(promise));
    }

    @ReactMethod
    public void logIn(String appUserID, final Promise promise) {
        CommonKt.logIn(appUserID, getOnResult(promise));
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
                .emit(RNPurchasesModule.PURCHASER_INFO_UPDATED,
                        convertMapToWriteableMap(PurchaserInfoMapperKt.map(purchaserInfo)));
    }

    @ReactMethod
    public void invalidatePurchaserInfoCache() {
        CommonKt.invalidatePurchaserInfoCache();
    }

    @ReactMethod
    public void setProxyURLString(String proxyURLString) {
        CommonKt.setProxyURLString(proxyURLString);
    }

    @ReactMethod
    public void isConfigured(Promise promise) {
      promise.resolve(Purchases.isConfigured());
    }

    //================================================================================
    // Subscriber Attributes
    //================================================================================

    @ReactMethod
    public void setAttributes(ReadableMap attributes) {
        HashMap attributesHashMap = attributes.toHashMap();
        SubscriberAttributesKt.setAttributes(attributesHashMap);
    }

    @ReactMethod
    public void setEmail(String email) {
      SubscriberAttributesKt.setEmail(email);
    }

    @ReactMethod
    public void setPhoneNumber(String phoneNumber) {
      SubscriberAttributesKt.setPhoneNumber(phoneNumber);
    }

    @ReactMethod
    public void setDisplayName(String displayName) {
      SubscriberAttributesKt.setDisplayName(displayName);
    }

    @ReactMethod
    public void setPushToken(String pushToken) {
      SubscriberAttributesKt.setPushToken(pushToken);
    }

    // region Attribution IDs

    @ReactMethod
    public void collectDeviceIdentifiers() {
      SubscriberAttributesKt.collectDeviceIdentifiers();
    }

    @ReactMethod
    public void setAdjustID(String adjustID) {
      SubscriberAttributesKt.setAdjustID(adjustID);
    }

    @ReactMethod
    public void setAppsflyerID(String appsflyerID) {
      SubscriberAttributesKt.setAppsflyerID(appsflyerID);
    }

    @ReactMethod
    public void setFBAnonymousID(String fbAnonymousID) {
      SubscriberAttributesKt.setFBAnonymousID(fbAnonymousID);
    }

    @ReactMethod
    public void setMparticleID(String mparticleID) {
      SubscriberAttributesKt.setMparticleID(mparticleID);
    }

    @ReactMethod
    public void setOnesignalID(String onesignalID) {
      SubscriberAttributesKt.setOnesignalID(onesignalID);
    }

    @ReactMethod
    public void setAirshipChannelID(String airshipChannelID) {
      SubscriberAttributesKt.setAirshipChannelID(airshipChannelID);
    }

    // endregion

    // region Campaign parameters

    @ReactMethod
    public void setMediaSource(String mediaSource) {
        SubscriberAttributesKt.setMediaSource(mediaSource);
    }

    @ReactMethod
    public void setCampaign(String campaign) {
        SubscriberAttributesKt.setCampaign(campaign);
    }

    @ReactMethod
    public void setAdGroup(String adGroup) {
        SubscriberAttributesKt.setAdGroup(adGroup);
    }

    @ReactMethod
    public void setAd(String ad) {
        SubscriberAttributesKt.setAd(ad);
    }

    @ReactMethod
    public void setKeyword(String keyword) {
        SubscriberAttributesKt.setKeyword(keyword);
    }

    @ReactMethod
    public void setCreative(String creative) {
        SubscriberAttributesKt.setCreative(creative);
    }

    @ReactMethod
    public void canMakePayments(ReadableArray features, final Promise promise) {
      ArrayList<Integer> featureList = new ArrayList<>();

      if (features != null) {
        for (int i = 0; i < features.size(); i++) {
          featureList.add(features.getInt(i));
        }
      }
      CommonKt.canMakePayments(reactContext, featureList, new OnResultAny<Boolean>() {
        @Override
        public void onError(@Nullable ErrorContainer errorContainer) {
          promise.reject(errorContainer.getCode() + "", errorContainer.getMessage(),
            convertMapToWriteableMap(errorContainer.getInfo()));
        }

        @Override
        public void onReceived(Boolean result) {
          promise.resolve(result);
        }
      });
    }

    // endregion

    //================================================================================
    // Private methods
    //================================================================================

    @NotNull
    private OnResult getOnResult(final Promise promise) {
        return new OnResult() {
            @Override
            public void onReceived(Map<String, ?> map) {
                promise.resolve(convertMapToWriteableMap(map));
            }

            @Override
            public void onError(ErrorContainer errorContainer) {
                promise.reject(errorContainer.getCode() + "", errorContainer.getMessage(),
                        convertMapToWriteableMap(errorContainer.getInfo()));
            }
        };
    }

}
