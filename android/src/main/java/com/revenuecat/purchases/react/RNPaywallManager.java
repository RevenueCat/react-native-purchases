package com.revenuecat.purchases.react;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

public class RNPaywallManager extends SimpleViewManager<Paywall> {
    public static final String REACT_CLASS = "RNPaywall";

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected Paywall createViewInstance(@NonNull ThemedReactContext themedReactContext) {
        return new Paywall(themedReactContext);
    }
}
