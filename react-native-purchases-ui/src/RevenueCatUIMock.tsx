import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native'; // Removed Modal, Button
import {
  PAYWALL_RESULT,
  CustomerInfo,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreTransaction,
  REFUND_REQUEST_STATUS,
  VERIFICATION_RESULT,
  PURCHASES_ERROR_CODE, // Added for mockPurchasesErrorPlaceholder
  PRODUCT_CATEGORY, // Added for mockPackage
  PACKAGE_TYPE, // Added for mockPackage
} from '@revenuecat/purchases-typescript-internal';
import Purchases from 'react-native-purchases'; // To use the potentially mocked Purchases module

// Replicating prop types from react-native-purchases-ui/src/index.tsx
// as they are not exported directly for reuse.

export interface PresentPaywallParams {
  displayCloseButton?: boolean;
  offering?: PurchasesOffering;
  fontFamily?: string | null;
}

export type PresentPaywallIfNeededParams = PresentPaywallParams & {
  requiredEntitlementIdentifier: string;
};

export interface PaywallViewOptions {
  offering?: PurchasesOffering | null;
  fontFamily?: string | null;
}

export interface FullScreenPaywallViewOptions extends PaywallViewOptions {
  displayCloseButton?: boolean | false;
}

export interface FooterPaywallViewOptions extends PaywallViewOptions {
  // Future properties can be added here
}

export type FullScreenPaywallViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  options?: FullScreenPaywallViewOptions;
  onPurchaseStarted?: ({ packageBeingPurchased }: { packageBeingPurchased: PurchasesPackage }) => void;
  onPurchaseCompleted?: ({
                           customerInfo,
                           storeTransaction
                         }: { customerInfo: CustomerInfo, storeTransaction: PurchasesStoreTransaction }) => void;
  onPurchaseError?: ({ error }: { error: PurchasesError }) => void;
  onPurchaseCancelled?: () => void;
  onRestoreStarted?: () => void;
  onRestoreCompleted?: ({ customerInfo }: { customerInfo: CustomerInfo }) => void;
  onRestoreError?: ({ error }: { error: PurchasesError }) => void;
  onDismiss?: () => void;
};

export type FooterPaywallViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  options?: FooterPaywallViewOptions;
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
};

export type CustomerCenterManagementOption =
  | 'cancel'
  | 'custom_url'
  | 'missing_purchase'
  | 'refund_request'
  | 'change_plans'
  | 'unknown'
  | string;

export type CustomerCenterManagementOptionEvent =
  | { option: 'custom_url'; url: string }
  | { option: Exclude<CustomerCenterManagementOption, 'custom_url'>; url: null };

export interface CustomerCenterCallbacks {
  onFeedbackSurveyCompleted?: ({feedbackSurveyOptionId}: { feedbackSurveyOptionId: string }) => void;
  onShowingManageSubscriptions?: () => void;
  onRestoreCompleted?: ({customerInfo}: { customerInfo: CustomerInfo }) => void;
  onRestoreFailed?: ({error}: { error: PurchasesError }) => void;
  onRestoreStarted?: () => void;
  onRefundRequestStarted?: ({productIdentifier}: { productIdentifier: string }) => void;
  onRefundRequestCompleted?: ({productIdentifier, refundRequestStatus}: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => void;
  onManagementOptionSelected?: (event: CustomerCenterManagementOptionEvent) => void;
}

export interface PresentCustomerCenterParams {
  callbacks?: CustomerCenterCallbacks;
}

// Internal PlaceholderPaywall component
interface PlaceholderPaywallProps {
  onPurchaseCompleted: () => void;
  onPurchaseError: (error: PurchasesError) => void;
  onRestoreCompleted?: () => void;
  onRestoreError?: (error: PurchasesError) => void;
  onDismiss: () => void;
  displayCloseButton?: boolean;
  offering?: PurchasesOffering | null;
  fontFamily?: string | null; // Added fontFamily to props
}

const mockCustomerInfoPlaceholder: CustomerInfo = {
  entitlements: { all: {}, active: {} },
  activeSubscriptions: [],
  allPurchasedProductIdentifiers: [],
  latestExpirationDate: null,
  firstSeen: "2023-01-01T00:00:00Z",
  originalAppUserId: "mock_user_id_placeholder",
  requestDate: "2023-01-01T00:00:00Z",
  originalApplicationVersion: "1.0",
  originalPurchaseDate: null,
  managementURL: null,
  nonSubscriptionTransactions: [],
  verificationResult: VERIFICATION_RESULT.NOT_REQUESTED,
};

const mockStoreTransactionPlaceholder: PurchasesStoreTransaction = {
  transactionIdentifier: "mock_transaction_id_placeholder",
  productIdentifier: "mock_product_id_placeholder",
  purchaseDate: new Date().toISOString(),
};

const mockProduct: PurchasesStoreProduct = { // Needed for mockPackage
    identifier: "mock_product",
    description: "Mock Product",
    title: "Mock Product",
    price: 1.99,
    priceString: "$1.99",
    currencyCode: "USD",
    introPrice: null,
    discounts: [],
    productCategory: PRODUCT_CATEGORY.SUBSCRIPTION,
    subscriptionPeriod: "P1M",
    defaultOption: null,
    subscriptionOptions: [],
    presentedOfferingIdentifier: "mock_offering",
    presentedOfferingContext: {
      offeringIdentifier: "mock_offering",
      placementIdentifier: null,
      targetingContext: null,
    },
};

const mockPackage: PurchasesPackage = { // Needed for onPurchaseStarted
    identifier: "mock_package",
    packageType: PACKAGE_TYPE.MONTHLY,
    product: mockProduct,
    offeringIdentifier: "mock_offering",
    presentedOfferingContext: {
      offeringIdentifier: "mock_offering",
      placementIdentifier: null,
      targetingContext: null,
    },
};

const mockPurchasesErrorPlaceholder: PurchasesError = {
  code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
  message: "User cancelled the purchase in mock.",
  userInfo: {
    readableErrorCode: "USER_CANCELLED",
    underlyingErrorMessage: "Mock underlying error message for cancellation.",
  },
  userCancelled: true,
};


const PlaceholderPaywall: React.FC<PlaceholderPaywallProps> = ({
  onPurchaseCompleted,
  onPurchaseError,
  onDismiss,
  displayCloseButton,
  offering,
  fontFamily, // Added fontFamily
  onRestoreCompleted,
  onRestoreError,
}) => {
  const handlePurchase = () => {
    onPurchaseCompleted();
  };

  const handleCancelOrError = () => { // Renamed for clarity
    onPurchaseError(mockPurchasesErrorPlaceholder);
  };

  const handleClose = () => {
    // For this mock, closing is treated like a cancellation/error for simplicity.
    onPurchaseError(mockPurchasesErrorPlaceholder);
  };

  const handleRestore = () => {
    if (onRestoreCompleted) {
      onRestoreCompleted();
    } else if (onRestoreError) { // Call restore error if restore completed is not defined
      onRestoreError(mockPurchasesErrorPlaceholder); // Or a specific restore error
    }
  };

  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>Expo Go - RevenueCat Paywall Placeholder</Text>
      <Text style={styles.placeholderMessage}>
        This is a mock view. Use the buttons to simulate outcomes.
      </Text>
      {offering && <Text style={styles.placeholderMessage}>Offering: {offering.identifier}</Text>}
      {fontFamily && <Text style={styles.placeholderMessage}>Font Family: {fontFamily}</Text>}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handlePurchase}>
          <Text style={styles.buttonText}>Simulate Successful Purchase</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleCancelOrError}>
          <Text style={styles.buttonText}>Simulate Cancel / Error</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleRestore}>
            <Text style={styles.buttonText}>Simulate Restore</Text>
        </TouchableOpacity>
      </View>
      {displayCloseButton && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={handleClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


export default class RevenueCatUI {
  public static PAYWALL_RESULT = PAYWALL_RESULT;
  private static Defaults = { // Added from original index.tsx for presentPaywall methods
    PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON: true
  }

  public static async presentPaywall(
    { offering, displayCloseButton = RevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON, fontFamily }: PresentPaywallParams = {}
  ): Promise<PAYWALL_RESULT> {
    console.log(
        `Mock RevenueCatUI.presentPaywall called with:
        Offering: ${offering?.identifier},
        DisplayCloseButton: ${displayCloseButton},
        FontFamily: ${fontFamily}`
      );
    return Promise.resolve(PAYWALL_RESULT.NOT_PRESENTED);
  }

  public static async presentPaywallIfNeeded(
    { requiredEntitlementIdentifier, offering, displayCloseButton = RevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON, fontFamily }: PresentPaywallIfNeededParams
  ): Promise<PAYWALL_RESULT> {
    console.log(
        `Mock RevenueCatUI.presentPaywallIfNeeded called with:
        RequiredEntitlement: ${requiredEntitlementIdentifier},
        Offering: ${offering?.identifier},
        DisplayCloseButton: ${displayCloseButton},
        FontFamily: ${fontFamily}`
      );
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      if (customerInfo.entitlements.all[requiredEntitlementIdentifier]?.isActive) {
        console.log(`Mock presentPaywallIfNeeded: Entitlement ${requiredEntitlementIdentifier} is active. Paywall not shown.`);
        return PAYWALL_RESULT.ALREADY_ENTITLED;
      } else {
        console.log(`Mock presentPaywallIfNeeded: Entitlement ${requiredEntitlementIdentifier} is not active. Paywall would be shown (but this is a mock).`);
        return PAYWALL_RESULT.NOT_PRESENTED;
      }
    } catch (error) {
      console.error("Error in mock presentPaywallIfNeeded:", error);
      const purchasesError = error as PurchasesError;
      if (purchasesError.code === PURCHASES_ERROR_CODE.OPERATION_TIMED_OUT_ERROR) {
        // Specific handling for timeout, though mock might not produce this.
      }
      return PAYWALL_RESULT.ERROR;
    }
  }

  public static async presentCustomerCenter(params?: PresentCustomerCenterParams): Promise<void> {
    console.log("Mock RevenueCatUI.presentCustomerCenter called with params:", params);
    return Promise.resolve();
  }

  public static Paywall: React.FC<FullScreenPaywallViewProps> = ({
    style,
    // children, // children are not typically rendered by the main Paywall component itself when it shows a full screen view
    options,
    onPurchaseStarted,
    onPurchaseCompleted,
    onPurchaseError,
    onPurchaseCancelled, // This is for the 'X' button if different from general error
    onRestoreStarted,
    onRestoreCompleted,
    onRestoreError,
    onDismiss,
  }) => {

    const handlePurchaseWrapper = () => {
      onPurchaseStarted?.({ packageBeingPurchased: mockPackage });
      onPurchaseCompleted?.({ customerInfo: mockCustomerInfoPlaceholder, storeTransaction: mockStoreTransactionPlaceholder });
      onDismiss?.();
    };

    const handleErrorWrapper = (error: PurchasesError) => { // PlaceholderPaywall now passes the error
      onPurchaseStarted?.({ packageBeingPurchased: mockPackage }); // Assume purchase was attempted
      onPurchaseError?.({ error }); // Use the error from PlaceholderPaywall
      onDismiss?.();
    };
    
    const handleRestoreWrapper = () => {
      onRestoreStarted?.();
      onRestoreCompleted?.({ customerInfo: mockCustomerInfoPlaceholder });
      onDismiss?.();
    };

    const handleRestoreErrorWrapper = (error: PurchasesError) => { // PlaceholderPaywall could pass an error
        onRestoreStarted?.();
        onRestoreError?.({ error }); // Use the error from PlaceholderPaywall
        onDismiss?.();
    };

    // This is specifically for the 'X' button in PlaceholderPaywall
    // PlaceholderPaywall's "Close" button calls its onPurchaseError prop.
    // So, it will flow through handleErrorWrapper. If a distinct onPurchaseCancelled is needed for 'X',
    // PlaceholderPaywall would need a new prop. For this mock, it's fine.
    // If onPurchaseCancelled is provided, we assume it's for explicit user action like pressing 'X'.
    // The current PlaceholderPaywall's "Close" button calls its internal `handleClose` which calls `onPurchaseError`.
    // This means `onPurchaseCancelled` from `Paywall` props might not be directly called by `PlaceholderPaywall`'s "Close" button as intended.
    // For simplicity, we'll let PlaceholderPaywall's "Close" button trigger `handleErrorWrapper`.
    // If `onPurchaseCancelled` needs to be distinct, `PlaceholderPaywall` would need an `onCancel` prop for its close button.

    const handleDismissWrapper = () => {
        // If onPurchaseCancelled is provided and is different from onDismiss,
        // we might call it here if the dismiss originated from a user explicit cancel action.
        // However, PlaceholderPaywall's buttons already call onDismiss via the wrappers.
        // This direct onDismiss is for the PlaceholderPaywall's own onDismiss calls.
        if (onDismiss) {
            onDismiss();
        }
    };


    return (
      <View style={[{ flex: 1 }, style]}>
        <PlaceholderPaywall
          offering={options?.offering}
          fontFamily={options?.fontFamily}
          displayCloseButton={options?.displayCloseButton}
          onPurchaseCompleted={handlePurchaseWrapper}
          onPurchaseError={handleErrorWrapper}
          onRestoreCompleted={handleRestoreWrapper}
          onRestoreError={handleRestoreErrorWrapper} // Pass this down
          onDismiss={handleDismissWrapper}
        />
        {/* Children are not rendered here as PlaceholderPaywall is full screen */}
      </View>
    );
  };

  public static OriginalTemplatePaywallFooterContainerView: React.FC<FooterPaywallViewProps> = ({
    style,
    children,
    options,
  }) => {
    return (
      <View style={[{ flex: 1, justifyContent: 'space-between' }, style]}>
        {children}
        <View style={styles.mockFooterBar}>
          <Text style={styles.mockFooterText}>
            Mock Paywall Footer Area (Offering: {options?.offering?.identifier || 'Default'})
          </Text>
        </View>
      </View>
    );
  };

  public static PaywallFooterContainerView: React.FC<FooterPaywallViewProps> = RevenueCatUI.OriginalTemplatePaywallFooterContainerView;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderWidth: 1,
    borderColor: 'red',
  },
  text: {
    color: 'black',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 1)',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  placeholderMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  buttonRow: {
    marginTop: 12,
    width: '90%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
  },
  // Styles for mockFooterBar
  mockFooterBar: {
    padding: 15, // Increased padding
    backgroundColor: '#E0E0E0', // Lighter gray
    borderTopWidth: 1,
    borderColor: '#BDBDBD', // Slightly darker border
    alignItems: 'center', // Center text
    justifyContent: 'center', // Center text
  },
  mockFooterText: {
    textAlign: 'center',
    color: '#424242', // Darker text for better contrast
    fontSize: 14, // Slightly larger font
  }
});

export { PAYWALL_RESULT };
