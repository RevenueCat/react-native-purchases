package com.reactlibrary;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.revenuecat.purchases.EntitlementInfo;
import com.revenuecat.purchases.EntitlementInfos;
import com.revenuecat.purchases.util.Iso8601Utils;

import java.util.Date;
import java.util.Map;

class Mappers {
    static WritableMap map(EntitlementInfos data) {
        WritableMap entitlementsInfo = Arguments.createMap();
        WritableArray all = Arguments.createArray();
        for (Map.Entry<String, EntitlementInfo> entry : data.getAll().entrySet()) {
            WritableMap entitlementInfo = Arguments.createMap();
            entitlementInfo.putMap(entry.getKey(), Mappers.map(entry.getValue()));
            all.pushMap(entitlementInfo);
        }
        entitlementsInfo.putArray("all", all);
        WritableArray active = Arguments.createArray();
        for (Map.Entry<String, EntitlementInfo> entry : data.getActive().entrySet()) {
            WritableMap entitlementInfo = Arguments.createMap();
            entitlementInfo.putMap(entry.getKey(), Mappers.map(entry.getValue()));
            active.pushMap(entitlementInfo);
        }
        entitlementsInfo.putArray("active", active);

        return entitlementsInfo;
    }

    static WritableMap map(EntitlementInfo data) {
        WritableMap entitlementInfo = Arguments.createMap();
        entitlementInfo.putString("identifier", data.getIdentifier());
        entitlementInfo.putBoolean("isActive", data.isActive());
        entitlementInfo.putBoolean("willRenew", data.getWillRenew());
        entitlementInfo.putString("periodType", data.getPeriodType().name());
        entitlementInfo.putString("latestPurchaseDate", Iso8601Utils.format(data.getLatestPurchaseDate()));
        entitlementInfo.putString("originalPurchaseDate", Iso8601Utils.format(data.getOriginalPurchaseDate()));
        putNullableDate(entitlementInfo, "expirationDate", data.getExpirationDate());
        entitlementInfo.putString("store", data.getStore().name());
        entitlementInfo.putString("productIdentifier", data.getProductIdentifier());
        entitlementInfo.putBoolean("isSandbox", data.isSandbox());
        putNullableDate(entitlementInfo, "unsubscribeDetectedAt", data.getUnsubscribeDetectedAt());
        putNullableDate(entitlementInfo, "billingIssueDetectedAt", data.getBillingIssueDetectedAt());
        return entitlementInfo;
    }

    static void putNullableDate(WritableMap map, String key, Date date) {
        if (date != null) {
            map.putString(key, Iso8601Utils.format(date));
        } else {
            map.putNull(key);
        }
    }


}
