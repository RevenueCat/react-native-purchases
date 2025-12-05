import { PurchasesCommon } from "@revenuecat/purchases-js-hybrid-mappings"
import { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal"
import { isExpoGo, isRorkSandbox, isWebPlatform } from "../utils/environment"
import { presentWebViewPaywall } from "./WebViewPaywallPresenter"
import { AppRegistry } from "react-native"
import React from "react"

// Import getStoredApiKey from react-native-purchases
// This is a peer dependency, so it should be available at runtime
let getStoredApiKey: (() => string | null) | null = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnPurchases = require("react-native-purchases");
    getStoredApiKey = rnPurchases.getStoredApiKey;
} catch (e) {
    console.warn('[RevenueCatUI] Could not import from react-native-purchases');
}

/**
 * Determines if the WebView-based paywall should be used.
 * WebView is needed for Expo Go and Rork sandbox where DOM APIs are not available.
 * Web platform has DOM available, so it can use PurchasesCommon.presentPaywall() directly.
 */
function shouldUseWebViewPaywall(): boolean {
    return (isExpoGo() || isRorkSandbox()) && !isWebPlatform();
}

/**
 * Preview implementation of the native module for Preview API mode, i.e. for environments where native modules are not available
 * (like Expo Go).
 */
export const previewNativeModuleRNPaywalls = {

    presentPaywall: async (
        offeringIdentifier?: string, 
        presentedOfferingContext?: Record<string, unknown>, 
        _displayCloseButton?: boolean, 
        _fontFamily?: string | null,
    ): Promise<PAYWALL_RESULT> => {
        // Use WebView-based paywall for Expo Go/Rork (no DOM available)
        // Use PurchasesCommon.presentPaywall() for web (DOM available)
        console.log("PRESENTING PAYWALL IN WEB VIEW:", shouldUseWebViewPaywall());
        if (shouldUseWebViewPaywall()) {
            const apiKey = getStoredApiKey?.();
            if (!apiKey) {
                console.error('[RevenueCatUI] API key not found. Make sure Purchases is configured.');
                return PAYWALL_RESULT.ERROR;
            }
            console.log("PRESENTING PAYWALL IN WEB VIEW:", apiKey);
            return await presentWebViewPaywall({
                apiKey,
                appUserId: PurchasesCommon.getInstance().getAppUserId(),
                offeringIdentifier,
                presentedOfferingContext,
            });
        }

        // Web platform - DOM is available, use direct approach
        return await PurchasesCommon.getInstance().presentPaywall({
            offeringIdentifier,
            presentedOfferingContext,
        }) as PAYWALL_RESULT;
    },

    presentPaywallIfNeeded: async (
        requiredEntitlementIdentifier: string,
        offeringIdentifier?: string, 
        presentedOfferingContext?: Record<string, unknown>, 
        _displayCloseButton?: boolean, 
        _fontFamily?: string | null,
    ) => {
        // Check entitlement first
        if (requiredEntitlementIdentifier) {
            const customerInfo = await PurchasesCommon.getInstance().getCustomerInfo();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const activeEntitlements = (customerInfo as any)?.entitlements?.active ?? {};
            if (activeEntitlements[requiredEntitlementIdentifier]) {
                return PAYWALL_RESULT.NOT_PRESENTED;
            }
        }

        // Use WebView-based paywall for Expo Go/Rork (no DOM available)
        // Use PurchasesCommon.presentPaywall() for web (DOM available)
        if (shouldUseWebViewPaywall()) {
            const apiKey = getStoredApiKey?.();
            if (!apiKey) {
                console.error('[RevenueCatUI] API key not found. Make sure Purchases is configured.');
                return PAYWALL_RESULT.ERROR;
            }
            return await presentWebViewPaywall({
                apiKey,
                appUserId: PurchasesCommon.getInstance().getAppUserId(),
                offeringIdentifier,
                presentedOfferingContext,
            });
        }

        // Web platform - DOM is available, use direct approach
        return await PurchasesCommon.getInstance().presentPaywall({
            requiredEntitlementIdentifier,
            offeringIdentifier,
            presentedOfferingContext,
        }) as PAYWALL_RESULT;
    },
    
}

export const previewNativeModuleRNCustomerCenter = {

    presentCustomerCenter: () => {
        return null
    }

}

// Auto-mount PaywallModalRoot in Expo Go environments
// This allows presentPaywall to work without requiring WebViewPaywallProvider
if (shouldUseWebViewPaywall()) {
    try {
        // Dynamically import PaywallModalRoot to avoid loading it in non-Expo Go environments
        import('./PaywallModalRoot').then((module) => {
            const { PaywallModalRoot } = module;
            
            // Use AppRegistry.setWrapperComponentProvider to wrap the root component
            // This ensures PaywallModalRoot is always mounted in the React tree
            // Note: This API may not be available in all React Native versions
            if (AppRegistry.setWrapperComponentProvider) {
                AppRegistry.setWrapperComponentProvider(() => {
                    return (props: { children: React.ReactNode }) => {
                        return (
                            <>
                                {props.children}
                                <PaywallModalRoot />
                            </>
                        );
                    };
                });
                
                console.log('[RevenueCatUI] Auto-mounted PaywallModalRoot for Expo Go');
            } else {
                console.warn('[RevenueCatUI] AppRegistry.setWrapperComponentProvider is not available. PaywallModalRoot will not be auto-mounted.');
            }
        }).catch((error) => {
            console.warn('[RevenueCatUI] Failed to auto-mount PaywallModalRoot:', error);
        });
    } catch (error) {
        console.warn('[RevenueCatUI] Failed to set up auto-mounting for PaywallModalRoot:', error);
    }
}