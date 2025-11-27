import React, { useRef, useCallback, useEffect } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, Text } from 'react-native';

// Type definitions for react-native-webview (optional peer dependency)
interface WebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}

interface WebViewErrorEvent {
  nativeEvent: {
    description?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebViewComponentType = React.ComponentType<any>;

// WebView ref type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WebViewRef {
  postMessage: (message: string) => void;
}

// Message protocol types for RN <-> WebView communication

/** Messages sent from React Native to WebView */
export type RNToWebViewMessage = {
  type: 'configure';
  apiKey: string;
  appUserId: string;
  offeringIdentifier?: string;
  presentedOfferingContext?: Record<string, unknown>;
  customerEmail?: string;
  locale?: string;
};

/** Messages sent from WebView to React Native */
export type WebViewToRNMessage =
  | { type: 'ready' }
  | { type: 'purchased'; customerInfo: Record<string, unknown> }
  | { type: 'cancelled' }
  | { type: 'error'; message: string; code?: string };

export interface WebViewPaywallProps {
  visible: boolean;
  apiKey: string;
  appUserId: string;
  offeringIdentifier?: string;
  presentedOfferingContext?: Record<string, unknown>;
  customerEmail?: string;
  onPurchased?: (customerInfo: Record<string, unknown>) => void;
  onCancelled?: () => void;
  onError?: (error: { message: string; code?: string }) => void;
  onDismiss: () => void;
}

/**
 * WebView-based paywall component for Expo Go environments.
 * Loads purchases-js in a WebView to provide a real browser context
 * where DOM APIs are available.
 */
export const WebViewPaywall: React.FC<WebViewPaywallProps> = ({
  visible,
  apiKey,
  appUserId,
  offeringIdentifier,
  presentedOfferingContext,
  customerEmail,
  onPurchased,
  onCancelled,
  onError,
  onDismiss,
}) => {
  const webViewRef = useRef<WebViewRef>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Try to import WebView dynamically to handle cases where it's not installed
  const [WebView, setWebView] = React.useState<WebViewComponentType | null>(null);

  useEffect(() => {
    // Dynamically import react-native-webview using require to avoid bundler issues
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const webViewModule = require('react-native-webview');
      setWebView(() => webViewModule.default || webViewModule.WebView);
    } catch {
      setLoadError(
        'react-native-webview is required for paywall support in Expo Go. ' +
        'Please install it with: npx expo install react-native-webview'
      );
    }
  }, []);

  // Send configuration to WebView once it's ready
  const sendConfiguration = useCallback(() => {
    if (!webViewRef.current) return;

    const config: RNToWebViewMessage = {
      type: 'configure',
      apiKey,
      appUserId,
      offeringIdentifier,
      presentedOfferingContext,
      customerEmail,
    };

    webViewRef.current.postMessage(JSON.stringify(config));
  }, [apiKey, appUserId, offeringIdentifier, presentedOfferingContext, customerEmail]);

  // Handle messages from WebView
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message: WebViewToRNMessage = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case 'ready':
            setIsLoading(false);
            sendConfiguration();
            break;

          case 'purchased':
            onPurchased?.(message.customerInfo);
            onDismiss();
            break;

          case 'cancelled':
            onCancelled?.();
            onDismiss();
            break;

          case 'error':
            onError?.({ message: message.message, code: message.code });
            onDismiss();
            break;
        }
      } catch (e) {
        console.error('[WebViewPaywall] Failed to parse message:', e);
      }
    },
    [sendConfiguration, onPurchased, onCancelled, onError, onDismiss]
  );

  // Generate the HTML content for the WebView
  const htmlContent = generatePaywallHTML();

  if (!visible) {
    return null;
  }

  // Show error if WebView couldn't be loaded
  if (loadError) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>WebView Required</Text>
            <Text style={styles.errorMessage}>{loadError}</Text>
            <Text style={styles.dismissButton} onPress={onDismiss}>
              Dismiss
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Show loading while WebView component is being imported
  if (!WebView) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading paywall...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          onError={(syntheticEvent: WebViewErrorEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('[WebViewPaywall] WebView error:', nativeEvent);
            onError?.({ message: nativeEvent.description || 'WebView failed to load' });
            onDismiss();
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          style={styles.webView}
          // Allow mixed content for CDN loading
          mixedContentMode="compatibility"
          // iOS specific
          allowsInlineMediaPlayback={true}
          // Android specific
          setSupportMultipleWindows={false}
        />
      </View>
    </Modal>
  );
};

/**
 * Generates the HTML content that will run in the WebView.
 * This HTML loads purchases-js from CDN and sets up the paywall.
 */
function generatePaywallHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>RevenueCat Paywall</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #paywall-container {
      width: 100%;
      height: 100%;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007AFF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      text-align: center;
    }
    .error-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }
    .error-message {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="paywall-container">
    <div class="loading">
      <div class="loading-spinner"></div>
      <span>Initializing...</span>
    </div>
  </div>

  <script type="module">
    // Import purchases-js from CDN
    import { Purchases, LogLevel } from 'https://unpkg.com/@revenuecat/purchases-js@latest/dist/Purchases.es.js';

    let purchasesInstance = null;
    let config = null;

    // Send message to React Native
    function sendToRN(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    // Handle configuration message from React Native
    async function handleConfigure(configData) {
      config = configData;
      
      try {
        // Enable verbose logging for debugging
        Purchases.setLogLevel(LogLevel.Verbose);
        
        // Configure purchases-js
        purchasesInstance = Purchases.configure({
          apiKey: config.apiKey,
          appUserId: config.appUserId,
        });

        // Fetch the offering
        let offering = null;
        if (config.offeringIdentifier) {
          const offerings = await purchasesInstance.getOfferings();
          offering = offerings.all[config.offeringIdentifier];
        }

        // Present the paywall
        await purchasesInstance.presentPaywall({
          offering: offering || undefined,
          customerEmail: config.customerEmail,
          onBack: () => {
            // User pressed back/close button
            sendToRN({ type: 'cancelled' });
          },
        });

        // If presentPaywall resolves without throwing, purchase was successful
        const customerInfo = await purchasesInstance.getCustomerInfo();
        sendToRN({ 
          type: 'purchased', 
          customerInfo: customerInfo 
        });

      } catch (error) {
        console.error('Paywall error:', error);
        
        // Check if it's a user cancellation
        if (error.errorCode === 1 || error.message?.includes('cancelled') || error.message?.includes('canceled')) {
          sendToRN({ type: 'cancelled' });
        } else {
          sendToRN({ 
            type: 'error', 
            message: error.message || 'Unknown error occurred',
            code: error.errorCode?.toString()
          });
        }
      }
    }

    // Listen for messages from React Native
    window.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'configure') {
          handleConfigure(message);
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    });

    // Also listen for postMessage from React Native (Android uses different event)
    document.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'configure') {
          handleConfigure(message);
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    });

    // Signal that we're ready to receive configuration
    sendToRN({ type: 'ready' });
  </script>
</body>
</html>
`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  dismissButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default WebViewPaywall;

