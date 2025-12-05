import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PAYWALL_RESULT } from '@revenuecat/purchases-typescript-internal';

export interface PresentWebViewPaywallParams {
  apiKey: string;
  appUserId: string;
  offeringIdentifier?: string;
  presentedOfferingContext?: Record<string, unknown>;
  customerEmail?: string;
}

type PaywallResolver = {
  resolve: (result: PAYWALL_RESULT) => void;
  reject: (error: Error) => void;
  params: PresentWebViewPaywallParams;
};

// Shared state that components can subscribe to
type PaywallState = {
  pendingPaywall: PaywallResolver | null;
  listeners: Set<() => void>;
};

const paywallState: PaywallState = {
  pendingPaywall: null,
  listeners: new Set(),
};

// Debug: Log when this module is loaded
console.log("[WebViewPaywallPresenter] Module loaded, paywallState created");

function notifyListeners() {
  console.log("[WebViewPaywallPresenter] Notifying", paywallState.listeners.size, "listeners");
  paywallState.listeners.forEach(listener => listener());
}

export function subscribe(listener: () => void): () => void {
  paywallState.listeners.add(listener);
  console.log("[WebViewPaywallPresenter] Listener subscribed, total:", paywallState.listeners.size);
  return () => {
    paywallState.listeners.delete(listener);
    console.log("[WebViewPaywallPresenter] Listener unsubscribed, total:", paywallState.listeners.size);
  };
}

export function getPendingPaywall(): PaywallResolver | null {
  return paywallState.pendingPaywall;
}

function setPendingPaywall(paywall: PaywallResolver | null) {
  paywallState.pendingPaywall = paywall;
  notifyListeners();
}

/**
 * Present a paywall using WebView. Returns a promise that resolves
 * with the paywall result.
 */
export async function presentWebViewPaywall(
  params: PresentWebViewPaywallParams
): Promise<PAYWALL_RESULT> {
  console.log("[WebViewPaywall] Presenting paywall...");
  console.log("[WebViewPaywall] Number of listeners:", paywallState.listeners.size);
  
  // Note: Listeners are no longer required. The auto-mounted PaywallModalRoot will handle rendering.
  // This check is removed to allow presentPaywall to work without WebViewPaywallProvider.
  
  if (paywallState.pendingPaywall) {
    // Already presenting a paywall, reject the pending one
    paywallState.pendingPaywall.reject(new Error('Another paywall is being presented'));
  }

  return new Promise<PAYWALL_RESULT>((resolve, reject) => {
    setPendingPaywall({ resolve, reject, params });
  });
}

/**
 * Called when the paywall completes (purchased, cancelled, or error).
 */
export function handlePaywallComplete(result: PAYWALL_RESULT): void {
  const pending = paywallState.pendingPaywall;
  if (pending) {
    pending.resolve(result);
    setPendingPaywall(null);
  }
}

/**
 * Dismiss the current paywall if any.
 */
export function dismissPaywall(): void {
  if (paywallState.pendingPaywall) {
    handlePaywallComplete(PAYWALL_RESULT.CANCELLED);
  }
}

/**
 * @deprecated This provider is no longer required. The SDK now automatically handles modal presentation in Expo Go.
 * This component is kept internally for backward compatibility but should not be used in new code.
 * 
 * Provider component that was previously required to be rendered at the root of the app
 * to enable WebView paywall presentation in Expo Go.
 * 
 * @internal
 */
export const WebViewPaywallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, forceUpdate] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [WebViewComponent, setWebViewComponent] = useState<React.ComponentType<any> | null>(null);
  const mountedRef = useRef(true);

  console.log("[WebViewPaywallProvider] Rendering, WebViewComponent loaded:", !!WebViewComponent);

  // Load the WebViewPaywall component dynamically
  useEffect(() => {
    mountedRef.current = true;
    console.log("[WebViewPaywallProvider] useEffect: Loading WebViewPaywall component");
    
    import('./WebViewPaywall')
      .then((module) => {
        if (mountedRef.current) {
          console.log("[WebViewPaywallProvider] WebViewPaywall component loaded successfully");
          setWebViewComponent(() => module.WebViewPaywall);
        }
      })
      .catch((error) => {
        console.warn('[WebViewPaywallProvider] Failed to load WebViewPaywall:', error);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Subscribe to paywall state changes
  useEffect(() => {
    console.log("[WebViewPaywallProvider] useEffect: Subscribing to paywall state");
    const unsubscribe = subscribe(() => {
      console.log("[WebViewPaywallProvider] State changed, pending:", !!getPendingPaywall());
      forceUpdate({});
    });
    return () => {
      console.log("[WebViewPaywallProvider] useEffect cleanup: Unsubscribing");
      unsubscribe();
    };
  }, []);

  const pendingPaywall = getPendingPaywall();
  console.log("[WebViewPaywallProvider] Current state - pendingPaywall:", !!pendingPaywall, "WebViewComponent:", !!WebViewComponent);

  const handlePurchased = useCallback((_customerInfo: Record<string, unknown>) => {
    console.log("[WebViewPaywallProvider] Purchase completed");
    handlePaywallComplete(PAYWALL_RESULT.PURCHASED);
  }, []);

  const handleCancelled = useCallback(() => {
    console.log("[WebViewPaywallProvider] Paywall cancelled");
    handlePaywallComplete(PAYWALL_RESULT.CANCELLED);
  }, []);

  const handleError = useCallback((error: { message: string; code?: string }) => {
    console.error('[WebViewPaywallProvider] Paywall error:', error);
    handlePaywallComplete(PAYWALL_RESULT.ERROR);
  }, []);

  const handleDismiss = useCallback(() => {
    console.log("[WebViewPaywallProvider] Paywall dismissed");
    dismissPaywall();
  }, []);

  return (
    <>
      {children}
      {WebViewComponent && pendingPaywall && (() => {
        console.log("[WebViewPaywallProvider] Rendering WebView paywall modal");
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
      })()}
    </>
  );
};

/**
 * Self-contained modal component for WebView paywall presentation.
 * Add this component anywhere in your app as an alternative to WebViewPaywallProvider.
 */
export const WebViewPaywallModal: React.FC = () => {
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
          console.log("[WebViewPaywallModal] WebViewPaywall component loaded");
          setWebViewComponent(() => module.WebViewPaywall);
        }
      })
      .catch((error) => {
        console.warn('[WebViewPaywallModal] Failed to load WebViewPaywall:', error);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Subscribe to paywall state changes
  useEffect(() => {
    console.log("[WebViewPaywallModal] Subscribing to paywall state");
    const unsubscribe = subscribe(() => {
      console.log("[WebViewPaywallModal] State changed, pending:", !!getPendingPaywall());
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const pendingPaywall = getPendingPaywall();

  const handlePurchased = useCallback((_customerInfo: Record<string, unknown>) => {
    console.log("[WebViewPaywallModal] Purchase completed");
    handlePaywallComplete(PAYWALL_RESULT.PURCHASED);
  }, []);

  const handleCancelled = useCallback(() => {
    console.log("[WebViewPaywallModal] Paywall cancelled");
    handlePaywallComplete(PAYWALL_RESULT.CANCELLED);
  }, []);

  const handleError = useCallback((error: { message: string; code?: string }) => {
    console.error('[WebViewPaywallModal] Paywall error:', error);
    handlePaywallComplete(PAYWALL_RESULT.ERROR);
  }, []);

  const handleDismiss = useCallback(() => {
    console.log("[WebViewPaywallModal] Paywall dismissed");
    dismissPaywall();
  }, []);

  // Don't render anything if no paywall is pending or component not loaded
  if (!WebViewComponent || !pendingPaywall) {
    return null;
  }

  console.log("[WebViewPaywallModal] Rendering WebView paywall");

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
