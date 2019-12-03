package com.revenuecat.purchases.common;

import java.util.List;
import java.util.Map;

public interface OnResultList {
    void onReceived(List<Map<String, ?>> map);
    void onError(ErrorContainer errorContainer);
}
