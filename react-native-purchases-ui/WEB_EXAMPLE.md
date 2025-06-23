# React Native Purchases UI - Web Platform Example

This example demonstrates how to use the `react-native-purchases-ui` library on web platforms using React Native Web.

## Setup

1. Install the required dependencies:

```bash
npm install react-native-purchases-ui react-native-web
```

2. Import the library:

```javascript
// For web-specific imports (recommended for web)
import RevenueCatUI from 'react-native-purchases-ui/web';

// Or use the standard import (web detection is automatic)
import RevenueCatUI from 'react-native-purchases-ui';
```

## Basic Usage

### Using the Paywall Component

```jsx
import React from 'react';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui/web';

const App = () => {
  const handlePurchaseStarted = ({ packageBeingPurchased }) => {
    console.log('Purchase started:', packageBeingPurchased);
  };

  const handlePurchaseCancelled = () => {
    console.log('Purchase cancelled');
  };

  const handleRestoreError = ({ error }) => {
    console.log('Restore error:', error.message);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RevenueCatUI.Paywall
        options={{
          offering: {
            identifier: 'premium',
            serverDescription: 'Premium Subscription',
            availablePackages: [
              {
                identifier: 'monthly',
                packageType: 'MONTHLY',
                product: {
                  identifier: 'premium_monthly',
                  title: 'Premium Monthly',
                  priceString: '$9.99',
                  price: 9.99,
                  currencyCode: 'USD'
                }
              },
              {
                identifier: 'yearly',
                packageType: 'ANNUAL',
                product: {
                  identifier: 'premium_yearly',
                  title: 'Premium Yearly',
                  priceString: '$99.99',
                  price: 99.99,
                  currencyCode: 'USD'
                }
              }
            ]
          },
          displayCloseButton: true,
          fontFamily: 'Arial'
        }}
        onPurchaseStarted={handlePurchaseStarted}
        onPurchaseCancelled={handlePurchaseCancelled}
        onRestoreError={handleRestoreError}
      />
    </View>
  );
};

export default App;
```

### Using the Customer Center

```jsx
import React from 'react';
import { Button } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui/web';

const CustomerCenterExample = () => {
  const handlePresentCustomerCenter = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onShowingManageSubscriptions: () => {
            console.log('Showing manage subscriptions');
          },
          onRestoreFailed: ({ error }) => {
            console.log('Restore failed:', error.message);
          }
        }
      });
    } catch (error) {
      console.log('Error presenting customer center:', error);
    }
  };

  return (
    <Button 
      title="Open Customer Center" 
      onPress={handlePresentCustomerCenter} 
    />
  );
};
```

## Web Platform Behavior

When running on web platforms, the library operates in **Preview API Mode**:

- **Paywall Components**: Render as web-compatible React components with a clean, modern UI
- **Purchase Flows**: Simulated (no actual purchases are processed)
- **Customer Center**: Limited functionality with console logging
- **Callbacks**: All callbacks are available for testing and development
- **Styling**: Uses React Native Web styles that work across browsers

## Important Notes

1. **Preview Mode**: Web support is primarily for development and testing purposes
2. **No Real Purchases**: Purchase flows are simulated and won't process actual transactions
3. **Limited Features**: Some native features like StoreKit integration are not available on web
4. **Production Use**: For production web applications, consider using RevenueCat's web SDK directly

## Styling

The web components use React Native Web styles and can be customized:

```jsx
<RevenueCatUI.Paywall
  style={{ 
    maxWidth: 500, 
    margin: 'auto',
    borderRadius: 16 
  }}
  options={{
    fontFamily: 'Roboto, sans-serif'
  }}
/>
```

## Error Handling

Web platform errors are properly typed and handled:

```jsx
const handlePurchaseError = ({ error }) => {
  if (error.code === 'UNSUPPORTED_ERROR') {
    console.log('This feature is not supported on web platform');
  }
};
```

This example demonstrates the complete web support implementation for the `react-native-purchases-ui` library. 