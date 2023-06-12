package com.revenuecat.purchases.react

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

internal object RNPurchasesConverters {
    @JvmStatic
    @Throws(JSONException::class)
    fun convertReadableMapToJson(readableMap: ReadableMap?): JSONObject {
        val jsonObject = JSONObject()
        val iterator = readableMap!!.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            when (readableMap.getType(key)) {
                ReadableType.Null -> jsonObject.put(key, JSONObject.NULL)
                ReadableType.Boolean -> jsonObject.put(key, readableMap.getBoolean(key))
                ReadableType.Number -> jsonObject.put(key, readableMap.getDouble(key))
                ReadableType.String -> jsonObject.put(key, readableMap.getString(key))
                ReadableType.Map -> jsonObject.put(
                    key,
                    convertReadableMapToJson(readableMap.getMap(key))
                )

                ReadableType.Array -> jsonObject.put(
                    key,
                    convertReadableArrayToJson(readableMap.getArray(key))
                )
            }
        }
        return jsonObject
    }

    @Throws(JSONException::class)
    fun convertReadableArrayToJson(readableArray: ReadableArray?): JSONArray {
        val array = JSONArray()
        for (i in 0 until readableArray!!.size()) {
            when (readableArray.getType(i)) {
                ReadableType.Null -> {}
                ReadableType.Boolean -> array.put(readableArray.getBoolean(i))
                ReadableType.Number -> array.put(readableArray.getDouble(i))
                ReadableType.String -> array.put(readableArray.getString(i))
                ReadableType.Map -> array.put(convertReadableMapToJson(readableArray.getMap(i)))
                ReadableType.Array -> array.put(convertReadableArrayToJson(readableArray.getArray(i)))
            }
        }
        return array
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
}
