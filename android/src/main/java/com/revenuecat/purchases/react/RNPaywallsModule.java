package com.revenuecat.purchases.react;

import static com.revenuecat.purchases.hybridcommon.PaywallHelpersKt.presentPaywallFromFragment;

import android.app.Activity;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.OptIn;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI;

@OptIn(markerClass = ExperimentalPreviewRevenueCatUIPurchasesAPI.class)
public class RNPaywallsModule extends ReactContextBaseJavaModule {
    public RNPaywallsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNPaywalls";
    }

    @ReactMethod
    public void presentPaywall() {
        presentPaywall(null);
    }

    @ReactMethod
    public void presentPaywallIfNeeded(final String requiredEntitlementIdentifier) {
       presentPaywall(requiredEntitlementIdentifier);
    }

    private void presentPaywall(final @Nullable String requiredEntitlementIdentifier) {
        final FragmentActivity fragment = getCurrentActivityFragment();
        if (fragment == null) {
            // TODO: log
            return;
        }

        presentPaywallFromFragment(fragment, requiredEntitlementIdentifier);
    }

    private @Nullable FragmentActivity getCurrentActivityFragment() {
        final Activity activity = getCurrentActivity();

        if (activity instanceof FragmentActivity) {
            return (FragmentActivity) activity;
        } else {
            return null;
        }
    }
}
