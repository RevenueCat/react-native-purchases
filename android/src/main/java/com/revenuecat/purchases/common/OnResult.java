package com.revenuecat.purchases.common;

import java.util.Map;

public interface OnResult {
    void onReceived(Map<String, ?> map);
    void onError(ErrorContainer errorContainer);
}
