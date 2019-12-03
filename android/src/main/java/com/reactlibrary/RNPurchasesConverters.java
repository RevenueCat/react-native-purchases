package com.reactlibrary;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;

class RNPurchasesConverters {
    static JSONObject convertReadableMapToJson(ReadableMap readableMap) throws JSONException {
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
                    object.put(key, convertReadableMapToJson(readableMap.getMap(key)));
                    break;
                case Array:
                    object.put(key, convertReadableArrayToJson(readableMap.getArray(key)));
                    break;
            }
        }
        return object;
    }

    static JSONArray convertReadableArrayToJson(ReadableArray readableArray) throws
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
                    array.put(convertReadableMapToJson(readableArray.getMap(i)));
                    break;
                case Array:
                    array.put(convertReadableArrayToJson(readableArray.getArray(i)));
                    break;
            }
        }
        return array;
    }

    static WritableArray convertArrayToWritableArray(Object[] array) {
        WritableArray object = new WritableNativeArray();
        for (Object item : array) {
            if (item == null) {
                object.pushNull();
            } else if (item instanceof Boolean) {
                object.pushBoolean((Boolean) item);
            } else if (item instanceof Integer) {
                object.pushInt((Integer) item);
            } else if (item instanceof Double) {
                object.pushDouble((Double) item);
            } else if (item instanceof String) {
                object.pushString((String) item);
            } else if (item instanceof Map) {
                object.pushMap(convertMapToWriteableMap((Map<String, Object>) item));
            } else if (item instanceof Object[]) {
                object.pushArray(convertArrayToWritableArray((Object[]) item));
            } else if (item instanceof List) {
                object.pushArray(convertArrayToWritableArray(((List) item).toArray()));
            }
        }
        return object;
    }


    static WritableMap convertMapToWriteableMap(Map<String, ?> map) {
        WritableMap object = new WritableNativeMap();
        for (Map.Entry<String, ?> entry : map.entrySet()) {
            if (entry.getValue() == null) {
                object.putNull(entry.getKey());
            } else if (entry.getValue() instanceof Boolean) {
                object.putBoolean(entry.getKey(), (Boolean) entry.getValue());
            } else if (entry.getValue() instanceof Integer) {
                object.putInt(entry.getKey(), (Integer) entry.getValue());
            } else if (entry.getValue() instanceof Double) {
                object.putDouble(entry.getKey(), (Double) entry.getValue());
            } else if (entry.getValue() instanceof String) {
                object.putString(entry.getKey(), (String) entry.getValue());
            } else if (entry.getValue() instanceof Map) {
                object.putMap(entry.getKey(), convertMapToWriteableMap((Map<String, Object>) entry.getValue()));
            } else if (entry.getValue() instanceof Object[]) {
                object.putArray(entry.getKey(), convertArrayToWritableArray((Object[]) entry.getValue()));
            } else if (entry.getValue() instanceof List) {
                object.putArray(entry.getKey(), convertArrayToWritableArray(((List) entry.getValue()).toArray()));
            }
        }
        return object;
    }
}
