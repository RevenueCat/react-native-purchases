package com.reactlibrary;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.revenuecat.purchases.EntitlementInfo;
import com.revenuecat.purchases.EntitlementInfos;
import com.revenuecat.purchases.util.Iso8601Utils;

import java.util.Date;
import java.util.Map;

class Mappers {
    static WritableMap map(EntitlementInfos data) {
        WritableMap entitlementInfos = Arguments.createMap();
        WritableMap all = Arguments.createMap();
        for (Map.Entry<String, EntitlementInfo> entry : data.getAll().entrySet()) {
            all.putMap(entry.getKey(), Mappers.map(entry.getValue()));
        }
        entitlementInfos.putMap("all", all);
        WritableMap active = Arguments.createMap();
        for (Map.Entry<String, EntitlementInfo> entry : data.getActive().entrySet()) {
            active.putMap(entry.getKey(), Mappers.map(entry.getValue()));
        }
        entitlementInfos.putMap("active", active);

        return entitlementInfos;
    }

    private static WritableMap map(EntitlementInfo data) {
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
