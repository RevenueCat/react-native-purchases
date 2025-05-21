import React, { type ReactNode, useEffect, useState } from "react";
import {
  type CustomerInfo,
  PAYWALL_RESULT, type PurchasesError,
  type PurchasesOffering, type PurchasesPackage,
  type PurchasesStoreTransaction,
  REFUND_REQUEST_STATUS
} from "@revenuecat/purchases-typescript-internal";
import type { StyleProp, ViewStyle } from "react-native";

import MockRevenueCatUI from './RevenueCatUIMock';

export { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";

// All exportable type/interface definitions from the original file remain here at the top level
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
  // Additional properties can be added here if needed
}

type FullScreenPaywallViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  options?: FullScreenPaywallViewOptions;
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

type FooterPaywallViewProps = {
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

type InternalFooterPaywallViewProps = FooterPaywallViewProps & {
  onMeasure?: ({height}: { height: number }) => void;
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

let RevenueCatUIToExport: any;
let isExpoGoForUI = false;

try {
  const Constants = require('expo-constants').default;
  if (Constants && Constants.executionEnvironment === "storeClient") {
    isExpoGoForUI = true;
  }
} catch (e: any) {
  // expo-constants not available. Assume not in Expo Go.
  // console.log("RevenueCat SDK (UI): Could not determine Expo Go environment. Mock mode will rely on global flag only. Error: " + e.message);
}

// Variable name `isMockMode` is kept as it was previously used in this file.
const isMockMode = isExpoGoForUI || (global as any).__EXPO_GO_MOCK_REVENUECAT__ === true;

if (isMockMode) {
  RevenueCatUIToExport = MockRevenueCatUI;
  if (isExpoGoForUI && (global as any).__EXPO_GO_MOCK_REVENUECAT__ !== false) { // Check if explicitly disabled
     console.log("RevenueCat SDK (UI): Expo Go environment detected. Mock mode automatically enabled. To disable, set global.__EXPO_GO_MOCK_REVENUECAT__ = false;");
  } else if ((global as any).__EXPO_GO_MOCK_REVENUECAT__ === true) {
    console.log("RevenueCat SDK (UI): Global flag __EXPO_GO_MOCK_REVENUECAT__ is true. Mock mode enabled.");
  }
} else {
  // All original React Native specific imports, native module usages, and the original class definition go here.
  const ReactNative = require("react-native"); 
  const {
    NativeEventEmitter,
    NativeModules,
    Platform,
    requireNativeComponent,
    ScrollView,
    UIManager,
    View,
  } = ReactNative;

  const LINKING_ERROR =
    `The package 'react-native-purchases-ui' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

  const RNPaywalls = NativeModules.RNPaywalls;
  const RNCustomerCenter = NativeModules.RNCustomerCenter;

  if (!RNPaywalls) {
    throw new Error(LINKING_ERROR);
  }

  if (!RNCustomerCenter) {
    throw new Error(LINKING_ERROR);
  }

  const eventEmitter = new NativeEventEmitter(RNPaywalls);
  const customerCenterEventEmitter = new NativeEventEmitter(RNCustomerCenter);

  const InternalPaywall =
    UIManager.getViewManagerConfig('Paywall') != null
      ? requireNativeComponent<FullScreenPaywallViewProps>('Paywall')
      : () => {
        throw new Error(LINKING_ERROR);
      };

  const InternalPaywallFooterView = UIManager.getViewManagerConfig('Paywall') != null
    ? requireNativeComponent<InternalFooterPaywallViewProps>('RCPaywallFooterView')
    : () => {
      throw new Error(LINKING_ERROR);
    };

  class OriginalRevenueCatUI {

    private static Defaults = {
      PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON: true
    }

    public static PAYWALL_RESULT = PAYWALL_RESULT;

    public static presentPaywall({
                                   offering,
                                   displayCloseButton = OriginalRevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON,
                                   fontFamily,
                                 }: PresentPaywallParams = {}): Promise<PAYWALL_RESULT> {
      return RNPaywalls.presentPaywall(
        offering?.identifier ?? null,
        displayCloseButton,
        fontFamily,
      )
    }

    public static presentPaywallIfNeeded({
                                           requiredEntitlementIdentifier,
                                           offering,
                                           displayCloseButton = OriginalRevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON,
                                           fontFamily,
                                         }: PresentPaywallIfNeededParams): Promise<PAYWALL_RESULT> {
      return RNPaywalls.presentPaywallIfNeeded(
        requiredEntitlementIdentifier,
        offering?.identifier ?? null,
        displayCloseButton,
        fontFamily,
      )
    }

    public static Paywall: React.FC<FullScreenPaywallViewProps> = ({
                                                                     style,
                                                                     children,
                                                                     options,
                                                                     onPurchaseStarted,
                                                                     onPurchaseCompleted,
                                                                     onPurchaseError,
                                                                     onPurchaseCancelled,
                                                                     onRestoreStarted,
                                                                     onRestoreCompleted,
                                                                     onRestoreError,
                                                                     onDismiss,
                                                                   }) => (
      <InternalPaywall options={options}
                       children={children}
                       onPurchaseStarted={(event: any) => onPurchaseStarted && onPurchaseStarted(event.nativeEvent)}
                       onPurchaseCompleted={(event: any) => onPurchaseCompleted && onPurchaseCompleted(event.nativeEvent)}
                       onPurchaseError={(event: any) => onPurchaseError && onPurchaseError(event.nativeEvent)}
                       onPurchaseCancelled={() => onPurchaseCancelled && onPurchaseCancelled()}
                       onRestoreStarted={() => onRestoreStarted && onRestoreStarted()}
                       onRestoreCompleted={(event: any) => onRestoreCompleted && onRestoreCompleted(event.nativeEvent)}
                       onRestoreError={(event: any) => onRestoreError && onRestoreError(event.nativeEvent)}
                       onDismiss={() => onDismiss && onDismiss()}
                       style={[{flex: 1}, style]}/>
    );

    public static OriginalTemplatePaywallFooterContainerView: React.FC<FooterPaywallViewProps> = ({
                                                                                                    style,
                                                                                                    children,
                                                                                                    options,
                                                                                                    onPurchaseStarted,
                                                                                                    onPurchaseCompleted,
                                                                                                    onPurchaseError,
                                                                                                    onPurchaseCancelled,
                                                                                                    onRestoreStarted,
                                                                                                    onRestoreCompleted,
                                                                                                    onRestoreError,
                                                                                                    onDismiss,
                                                                                                  }) => {
      const [paddingBottom, setPaddingBottom] = useState(20);
      const [height, setHeight] = useState(0);

      useEffect(() => {
        interface HandleSafeAreaInsetsChangeParams {
          bottom: number;
        }

        const handleSafeAreaInsetsChange = ({bottom}: HandleSafeAreaInsetsChangeParams) => {
          setPaddingBottom(20 + bottom);
        };

        const subscription = eventEmitter.addListener(
          'safeAreaInsetsDidChange',
          handleSafeAreaInsetsChange
        );

        return () => {
          subscription.remove();
        };
      }, []);

      return (
        <View style={[{flex: 1}, style]}>
          <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom}}>
            {children}
          </ScrollView>
          <InternalPaywallFooterView
            style={Platform.select({
              ios: {marginTop: -20},
              android: {marginTop: -20, height}
            })}
            options={options}
            onPurchaseStarted={(event: any) => onPurchaseStarted && onPurchaseStarted(event.nativeEvent)}
            onPurchaseCompleted={(event: any) => onPurchaseCompleted && onPurchaseCompleted(event.nativeEvent)}
            onPurchaseError={(event: any) => onPurchaseError && onPurchaseError(event.nativeEvent)}
            onPurchaseCancelled={() => onPurchaseCancelled && onPurchaseCancelled()}
            onRestoreStarted={() => onRestoreStarted && onRestoreStarted()}
            onRestoreCompleted={(event: any) => onRestoreCompleted && onRestoreCompleted(event.nativeEvent)}
            onRestoreError={(event: any) => onRestoreError && onRestoreError(event.nativeEvent)}
            onDismiss={() => onDismiss && onDismiss()}
            onMeasure={(event: any) => setHeight(event.nativeEvent.measurements.height)}
          />
        </View>
      );
    };

    public static presentCustomerCenter(params?: PresentCustomerCenterParams): Promise<void> {
      if (params?.callbacks) {
        const subscriptions: { remove: () => void }[] = [];
        const callbacks = params.callbacks as CustomerCenterCallbacks;

        if (callbacks.onFeedbackSurveyCompleted) {
          const subscription = customerCenterEventEmitter.addListener(
            'onFeedbackSurveyCompleted',
            (event: { feedbackSurveyOptionId: string }) => callbacks.onFeedbackSurveyCompleted &&
              callbacks.onFeedbackSurveyCompleted(event)
          );
          subscriptions.push(subscription);
        }

        if (callbacks.onShowingManageSubscriptions) {
          const subscription = customerCenterEventEmitter.addListener(
            'onShowingManageSubscriptions',
            () => callbacks.onShowingManageSubscriptions && callbacks.onShowingManageSubscriptions()
          );
          subscriptions.push(subscription);
        }

        if (callbacks.onRestoreCompleted) {
          const subscription = customerCenterEventEmitter.addListener(
            'onRestoreCompleted',
            (event: { customerInfo: CustomerInfo }) => callbacks.onRestoreCompleted &&
              callbacks.onRestoreCompleted(event)
          );
          subscriptions.push(subscription);
        }

        if (callbacks.onRestoreFailed) {
          const subscription = customerCenterEventEmitter.addListener(
            'onRestoreFailed',
            (event: { error: PurchasesError }) => callbacks.onRestoreFailed &&
              callbacks.onRestoreFailed(event)
          );
          subscriptions.push(subscription);
        }

        if (callbacks.onRestoreStarted) {
          const subscription = customerCenterEventEmitter.addListener(
            'onRestoreStarted',
            () => callbacks.onRestoreStarted && callbacks.onRestoreStarted()
          );
          subscriptions.push(subscription);
        }

        if (callbacks.onRefundRequestStarted) {
          const subscription = customerCenterEventEmitter.addListener(
            'onRefundRequestStarted',
            (event: { productIdentifier: string }) => callbacks.onRefundRequestStarted &&
              callbacks.onRefundRequestStarted(event)
          );
          subscriptions.push(subscription);
        }

        if (callbacks.onRefundRequestCompleted) {
          const subscription = customerCenterEventEmitter.addListener(
            'onRefundRequestCompleted',
            (event: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => callbacks.onRefundRequestCompleted &&
              callbacks.onRefundRequestCompleted(event)
          );
          subscriptions.push(subscription);
        }

        if (callbacks.onManagementOptionSelected) {
          const subscription = customerCenterEventEmitter.addListener(
            'onManagementOptionSelected',
            (event: CustomerCenterManagementOptionEvent) => callbacks.onManagementOptionSelected &&
              callbacks.onManagementOptionSelected(event)
          );
          subscriptions.push(subscription);
        }

        return RNCustomerCenter.presentCustomerCenter().finally(() => {
          subscriptions.forEach(subscription => subscription.remove());
        });
      }
      return RNCustomerCenter.presentCustomerCenter();
    }

    /**
     * @deprecated, Use {@link OriginalTemplatePaywallFooterContainerView} instead
     */
    public static PaywallFooterContainerView: React.FC<FooterPaywallViewProps> =
      OriginalRevenueCatUI.OriginalTemplatePaywallFooterContainerView;
  }
  RevenueCatUIToExport = OriginalRevenueCatUI;
}

export default RevenueCatUIToExport;
