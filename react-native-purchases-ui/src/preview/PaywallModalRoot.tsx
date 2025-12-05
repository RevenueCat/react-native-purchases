import React, { useState, useCallback, useEffect, useRef } from 'react';
import { subscribe, getPendingPaywall, handlePaywallComplete, dismissPaywall } from './WebViewPaywallPresenter';
import { PAYWALL_RESULT } from '@revenuecat/purchases-typescript-internal';

/**
 * Internal component that automatically renders WebView paywall modals.
 * This component is auto-mounted in Expo Go environments and should not be used directly by consumers.
 * @internal
 */
export const PaywallModalRoot: React.FC = () => {
  const [, forceUpdate] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [WebViewComponent, setWebViewComponent] = useState<React.ComponentType<any> | null>(null);
  const mountedRef = useRef(true);

  // Load the WebViewPaywall component dynamically
  useEffect(() => {
    mountedRef.current = true;
    
    import('./WebViewPaywall')
      .then((module) => {
        if (mountedRef.current) {
          console.log("[PaywallModalRoot] WebViewPaywall component loaded");
          setWebViewComponent(() => module.WebViewPaywall);
        }
      })
      .catch((error) => {
        console.warn('[PaywallModalRoot] Failed to load WebViewPaywall:', error);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Subscribe to paywall state changes
  useEffect(() => {
    console.log("[PaywallModalRoot] Subscribing to paywall state");
    const unsubscribe = subscribe(() => {
      console.log("[PaywallModalRoot] State changed, pending:", !!getPendingPaywall());
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const pendingPaywall = getPendingPaywall();

  const handlePurchased = useCallback((_customerInfo: Record<string, unknown>) => {
    console.log("[PaywallModalRoot] Purchase completed");
    handlePaywallComplete(PAYWALL_RESULT.PURCHASED);
  }, []);

  const handleCancelled = useCallback(() => {
    console.log("[PaywallModalRoot] Paywall cancelled");
    handlePaywallComplete(PAYWALL_RESULT.CANCELLED);
  }, []);

  const handleError = useCallback((error: { message: string; code?: string }) => {
    console.error('[PaywallModalRoot] Paywall error:', error);
    handlePaywallComplete(PAYWALL_RESULT.ERROR);
  }, []);

  const handleDismiss = useCallback(() => {
    console.log("[PaywallModalRoot] Paywall dismissed");
    dismissPaywall();
  }, []);

  // Don't render anything if no paywall is pending or component not loaded
  if (!WebViewComponent || !pendingPaywall) {
    return null;
  }

  console.log("[PaywallModalRoot] Rendering WebView paywall");

  return (
    <WebViewComponent
      visible={true}
      apiKey={pendingPaywall.params.apiKey}
      appUserId={pendingPaywall.params.appUserId}
      offeringIdentifier={pendingPaywall.params.offeringIdentifier}
      presentedOfferingContext={pendingPaywall.params.presentedOfferingContext}
      customerEmail={pendingPaywall.params.customerEmail}
      onPurchased={handlePurchased}
      onCancelled={handleCancelled}
      onError={handleError}
      onDismiss={handleDismiss}
    />
  );
};

