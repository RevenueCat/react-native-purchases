import { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal"

/**
 * Preview implementation of the native module for Preview API mode, i.e. for environments where native modules are not available
 * (like Expo Go).
 */
export const previewNativeModuleRNPaywalls = {

    presentPaywall: () => {
        return PAYWALL_RESULT.NOT_PRESENTED
    },

    presentPaywallIfNeeded: () => {
        return PAYWALL_RESULT.NOT_PRESENTED
    },
    
}

export const previewNativeModuleRNCustomerCenter = {

    presentCustomerCenter: () => {
        return null
    }

}