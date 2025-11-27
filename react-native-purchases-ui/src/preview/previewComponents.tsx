import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle, type StyleProp } from 'react-native';
import {
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
  type PurchasesStoreTransaction,
} from "@revenuecat/purchases-typescript-internal";
import { isExpoGo, isRorkSandbox } from "../utils/environment";
import { PurchasesCommon } from "@revenuecat/purchases-js-hybrid-mappings";

// Import getStoredApiKey from react-native-purchases
// This is a peer dependency, so it should be available at runtime
let getStoredApiKey: (() => string | null) | null = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnPurchases = require("react-native-purchases");
    getStoredApiKey = rnPurchases.getStoredApiKey;
} catch (e) {
    console.warn('[PreviewPaywall] Could not import from react-native-purchases');
}

// Lazy load WebViewPaywall to avoid issues when react-native-webview is not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let WebViewPaywall: React.ComponentType<any> | null = null;

export interface PreviewPaywallProps {
  offering?: PurchasesOffering | null;
  displayCloseButton?: boolean;
  fontFamily?: string | null;
  onPurchaseStarted?: ({packageBeingPurchased}: { packageBeingPurchased: PurchasesPackage }) => void;
  onPurchaseCompleted?: ({
                           customerInfo,
                           storeTransaction
                         }: { customerInfo: CustomerInfo, storeTransaction: PurchasesStoreTransaction }) => void;
  onPurchaseError?: ({error}: { error: PurchasesError }) => void;
  onPurchaseCancelled?: () => void;
  onRestoreStarted?: () => void;
  onRestoreCompleted?: ({customerInfo}: { customerInfo: CustomerInfo }) => void;
  onRestoreError?: ({error}: { error: PurchasesError }) => void;
  onDismiss?: () => void;
}

/**
 * Determines if WebView-based paywall should be used.
 * WebView is needed for Expo Go and Rork sandbox where DOM APIs are not available.
 */
function shouldUseWebViewPaywall(): boolean {
  return (isExpoGo() || isRorkSandbox());
}

export const PreviewPaywall: React.FC<PreviewPaywallProps> = ({
  offering,
  displayCloseButton = true,
  fontFamily,
  onPurchaseCompleted,
  onPurchaseError,
  onPurchaseCancelled,
  onDismiss,
}) => {
  const [WebViewComponent, setWebViewComponent] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const useWebView = shouldUseWebViewPaywall();

  // Load WebViewPaywall component dynamically for Expo Go
  useEffect(() => {
    if (useWebView && !WebViewPaywall) {
      import('./WebViewPaywall')
        .then((module) => {
          WebViewPaywall = module.WebViewPaywall;
          setWebViewComponent(() => module.WebViewPaywall);
        })
        .catch((error) => {
          console.warn('[PreviewPaywall] Failed to load WebViewPaywall:', error);
          setLoadError('Failed to load WebView paywall component');
        });
    } else if (useWebView && WebViewPaywall) {
      setWebViewComponent(() => WebViewPaywall);
    }
  }, [useWebView]);

  const handleClose = useCallback(() => {
    onPurchaseCancelled?.();
    onDismiss?.();
  }, [onPurchaseCancelled, onDismiss]);

  const handlePurchased = useCallback((customerInfo: Record<string, unknown>) => {
    onPurchaseCompleted?.({
      customerInfo: customerInfo as unknown as CustomerInfo,
      storeTransaction: {} as PurchasesStoreTransaction,
    });
    onDismiss?.();
  }, [onPurchaseCompleted, onDismiss]);

  const handleError = useCallback((error: { message: string; code?: string }) => {
    onPurchaseError?.({
      error: { message: error.message, code: error.code } as unknown as PurchasesError,
    });
    onDismiss?.();
  }, [onPurchaseError, onDismiss]);

  const textStyle = fontFamily ? { fontFamily } : undefined;

  // For Expo Go/Rork: Use WebView-based paywall
  if (useWebView) {
    const apiKey = getStoredApiKey?.();
    
    if (!apiKey) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={[styles.notSupportedMessage, textStyle]}>
              Configuration Error
            </Text>
            <Text style={[styles.fakeMessage, textStyle]}>
              Purchases must be configured before presenting a paywall.
            </Text>
            <TouchableOpacity style={styles.closePaywallButton} onPress={handleClose}>
              <Text style={[styles.closePaywallButtonText, textStyle]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={[styles.notSupportedMessage, textStyle]}>
              {loadError}
            </Text>
            <TouchableOpacity style={styles.closePaywallButton} onPress={handleClose}>
              <Text style={[styles.closePaywallButtonText, textStyle]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!WebViewComponent) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={[styles.previewMode, textStyle]}>Loading paywall...</Text>
          </View>
        </View>
      );
    }

    // Get app user ID from PurchasesCommon
    let appUserId = '';
    try {
      appUserId = PurchasesCommon.getInstance().getAppUserId();
    } catch (e) {
      console.error('[PreviewPaywall] Failed to get app user ID:', e);
    }

    return (
      <WebViewComponent
        visible={true}
        apiKey={apiKey}
        appUserId={appUserId}
        offeringIdentifier={offering?.identifier}
        onPurchased={handlePurchased}
        onCancelled={handleClose}
        onError={handleError}
        onDismiss={handleClose}
      />
    );
  }

  // For Web: Show placeholder (web uses PurchasesCommon.presentPaywall() directly via imperative API)
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>
          Preview Paywall
        </Text>
        {displayCloseButton && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.notSupportedMessage, textStyle]}>
          Web paywalls are not supported yet.
        </Text>
        <Text style={[styles.fakeMessage, textStyle]}>
          This is a fake preview implementation.
        </Text>
        <Text style={[styles.previewMode, textStyle]}>
          Currently in preview mode
        </Text>
        
        <TouchableOpacity style={styles.closePaywallButton} onPress={handleClose}>
          <Text style={[styles.closePaywallButtonText, textStyle]}>
            Close Paywall
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 400,
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notSupportedMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  fakeMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewMode: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
  },
  closePaywallButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  closePaywallButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});

export interface PreviewCustomerCenterProps {
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
}

export const PreviewCustomerCenter: React.FC<PreviewCustomerCenterProps> = ({
  style,
  onDismiss,
}) => {
  const handleClose = () => {
    onDismiss?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.title]}>
          Preview Customer Center
        </Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.notSupportedMessage]}>
          Web customer center is not supported yet.
        </Text>
        <Text style={[styles.fakeMessage]}>
          This is a fake preview implementation.
        </Text>
        <Text style={[styles.previewMode]}>
          Currently in preview mode
        </Text>
        
        <TouchableOpacity style={styles.closePaywallButton} onPress={handleClose}>
          <Text style={[styles.closePaywallButtonText]}>
            Close Customer Center
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};