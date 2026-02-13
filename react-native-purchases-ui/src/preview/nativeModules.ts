import { PurchasesCommon } from "@revenuecat/purchases-js-hybrid-mappings"
import { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal"

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
    ): Promise<PAYWALL_RESULT> => {
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