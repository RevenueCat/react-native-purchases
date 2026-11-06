package com.revenuecat.purchases.react.ui

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.revenuecat.purchases.Offering
import com.revenuecat.purchases.PresentedOfferingContext
import com.revenuecat.purchases.hybridcommon.mappers.map
import kotlin.collections.get

internal object RNPurchasesConverters {

    fun offeringToMap(offering: Offering): Map<String, Any?> = mapOf(
        "identifier" to offering.identifier,
        "serverDescription" to offering.serverDescription,
        "metadata" to offering.metadata,
        "availablePackages" to offering.availablePackages.map { it.map() },
        "lifetime" to offering.lifetime?.map(),
        "annual" to offering.annual?.map(),
        "sixMonth" to offering.sixMonth?.map(),
        "threeMonth" to offering.threeMonth?.map(),
        "twoMonth" to offering.twoMonth?.map(),
        "monthly" to offering.monthly?.map(),
        "weekly" to offering.weekly?.map(),
        "webCheckoutUrl" to offering.webCheckoutURL?.toString(),
    )

    @JvmStatic
    @Suppress("UNCHECKED_CAST")
    fun convertMapToWriteableMap(map: Map<String, *>): WritableMap {
        val writableMap: WritableMap = WritableNativeMap()
        for ((key, value) in map) {
            when (value) {
                null -> writableMap.putNull(key)
                is Boolean -> writableMap.putBoolean(key, value)
                is Int -> writableMap.putInt(key, value)
                is Long -> writableMap.putDouble(key, value.toDouble())
                is Double -> writableMap.putDouble(key, value)
                is String -> writableMap.putString(key, value)
                is Map<*, *> -> writableMap.putMap(key, convertMapToWriteableMap(value as Map<String, *>))
                is Array<*> -> writableMap.putArray(key, convertArrayToWritableArray(value as Array<Any?>))
                is List<*> -> writableMap.putArray(key, convertArrayToWritableArray(value.toTypedArray()))
            }
        }
        return writableMap
    }

    @Suppress("UNCHECKED_CAST")
    private fun convertArrayToWritableArray(array: Array<Any?>): WritableArray {
        val writableArray: WritableArray = WritableNativeArray()
        for (item in array) {
            when (item) {
                null -> writableArray.pushNull()
                is Boolean -> writableArray.pushBoolean(item)
                is Int -> writableArray.pushInt(item)
                is Long -> writableArray.pushDouble(item.toDouble())
                is Double -> writableArray.pushDouble(item)
                is String -> writableArray.pushString(item)
                is Map<*, *> -> writableArray.pushMap(convertMapToWriteableMap(item as Map<String, *>))
                is Array<*> -> writableArray.pushArray(convertArrayToWritableArray(item as Array<Any?>))
                is List<*> -> writableArray.pushArray(convertArrayToWritableArray(item.toTypedArray()))
            }
        }
        return writableArray
    }

    fun presentedOfferingContext(offeringIdentifier: String, presentedOfferingContext: Map<*,*>?) : PresentedOfferingContext {
        if (presentedOfferingContext == null) {
            return PresentedOfferingContext(offeringIdentifier)
        }

        var targetingContext: PresentedOfferingContext.TargetingContext? = null;
        val targetingContextMap = presentedOfferingContext["targetingContext"] as? Map<*, *>
        if (targetingContextMap != null) {
            val revision = (targetingContextMap["revision"] as? Number)?.toInt()
            val ruleId = targetingContextMap["ruleId"] as? String
            if (revision != null && ruleId != null) {
                targetingContext = PresentedOfferingContext.TargetingContext(revision, ruleId)
            }
        }

        val placementIdentifier = presentedOfferingContext["placementIdentifier"] as? String

        return PresentedOfferingContext(
            offeringIdentifier,
            placementIdentifier,
            targetingContext
        )
    }
}
