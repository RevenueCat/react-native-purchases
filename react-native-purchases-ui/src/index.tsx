import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  requireNativeComponent,
  ScrollView,
  type StyleProp,
  UIManager,
  View,
  type ViewStyle,
} from "react-native";
import {
  type CustomerInfo,
  PAYWALL_RESULT, type PurchasesError,
  type PurchasesOffering, type PurchasesPackage,
  type PurchasesStoreTransaction,
  REFUND_REQUEST_STATUS
} from "@revenuecat/purchases-typescript-internal";
import React, { type ReactNode, useEffect, useState } from "react";
import { shouldUsePreviewAPIMode } from "./utils/environment";
import { previewNativeModuleRNCustomerCenter, previewNativeModuleRNPaywalls } from "./preview/nativeModules";

export { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";

const LINKING_ERROR =
  `The package 'react-native-purchases-ui' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n';


// Get the native module or use the preview implementation
const usingPreviewAPIMode = shouldUsePreviewAPIMode();

const RNPaywalls = usingPreviewAPIMode ? previewNativeModuleRNPaywalls : NativeModules.RNPaywalls;
const RNCustomerCenter = usingPreviewAPIMode ? previewNativeModuleRNCustomerCenter : NativeModules.RNCustomerCenter;

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

export interface PresentPaywallParams {
  /**
   * Whether to display the close button or not.
   * Only available for original template paywalls. Ignored for V2 Paywalls.
   */
  displayCloseButton?: boolean;

  /**
   * The offering to load the paywall with. This will be the "current" offering by default.
   */
  offering?: PurchasesOffering;

  /**
   * The fontFamily name to use in the Paywall. In order to add a font family, add it in the react native app and make
   * sure to run `npx react-native-asset` so it's added to the native components.
   * Supported font types are `.ttf` and `.otf`.
   * Make sure the file names follow the convention:
   * - Regular: MyFont.ttf/MyFont.otf
   * - Bold: MyFont_bold.ttf/MyFont_bold.otf
   * - Italic: MyFont_italic.ttf/MyFont_italic.otf
   * - Bold and Italic: MyFont_bold_italic.ttf/MyFont_bold_italic.otf
   * Only available for original template paywalls. Ignored for V2 Paywalls.
   */
  fontFamily?: string | null;
}

export type PresentPaywallIfNeededParams = PresentPaywallParams & {
  /**
   * The paywall will only be presented if this entitlement is not active.
   */
  requiredEntitlementIdentifier: string;
}

export interface PaywallViewOptions {
  /**
   * The offering to load the paywall with. This will be the "current" offering by default.
   */
  offering?: PurchasesOffering | null;

  /**
   * The fontFamily name to use in the Paywall. In order to add a font family, add it in the react native app and make
   * sure to run `npx react-native-asset` so it's added to the native components.
   * Supported font types are `.ttf` and `.otf`.
   * Make sure the file names follow the convention:
   * - Regular: MyFont.ttf/MyFont.otf
   * - Bold: MyFont_bold.ttf/MyFont_bold.otf
   * - Italic: MyFont_italic.ttf/MyFont_italic.otf
   * - Bold and Italic: MyFont_bold_italic.ttf/MyFont_bold_italic.otf
   * Only available for original template paywalls. Ignored for V2 Paywalls.
   */
  fontFamily?: string | null;
}

export interface FullScreenPaywallViewOptions extends PaywallViewOptions {
  /**
   * Whether to display the close button or not.
   * Only available for original template paywalls. Ignored for V2 Paywalls.
   */
  displayCloseButton?: boolean | false;
}

// Currently the same as the base type, but can be extended later if needed
export interface FooterPaywallViewOptions extends PaywallViewOptions {
  // Additional properties for FooterPaywallViewOptions can be added here if needed in the future
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
  | string; // This is to prevent breaking changes when the native SDK adds new options

export type CustomerCenterManagementOptionEvent = 
  | { option: 'custom_url'; url: string }
  | { option: Exclude<CustomerCenterManagementOption, 'custom_url'>; url: null };

export interface CustomerCenterCallbacks {
  /**
   * Called when a feedback survey is completed with the selected option ID.
   */
  onFeedbackSurveyCompleted?: ({feedbackSurveyOptionId}: { feedbackSurveyOptionId: string }) => void;
  
  /**
   * Called when the manage subscriptions section is being shown.
   */
  onShowingManageSubscriptions?: () => void;
  
  /**
   * Called when a restore operation is completed successfully.
   */
  onRestoreCompleted?: ({customerInfo}: { customerInfo: CustomerInfo }) => void;
  
  /**
   * Called when a restore operation fails.
   */
  onRestoreFailed?: ({error}: { error: PurchasesError }) => void;
  
  /**
   * Called when a restore operation starts.
   */
  onRestoreStarted?: () => void;

  /**
   * Called when a refund request starts with the product identifier. iOS-only callback.
   */
  onRefundRequestStarted?: ({productIdentifier}: { productIdentifier: string }) => void;
  
  /**
   * Called when a refund request completes with status information. iOS-only callback.
   */
  onRefundRequestCompleted?: ({productIdentifier, refundRequestStatus}: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => void;

  /**
   * Called when a customer center management option is selected.
   * For 'custom_url' options, the url parameter will contain the URL.
   * For all other options, the url parameter will be null.
   */
  onManagementOptionSelected?: (event: CustomerCenterManagementOptionEvent) => void;
}

export interface PresentCustomerCenterParams {
  /**
   * Optional callbacks for customer center events.
   */
  callbacks?: CustomerCenterCallbacks;
}

export default class RevenueCatUI {

  private static Defaults = {
    PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON: true
  }

  /**
   * The result of presenting a paywall. This will be the last situation the user experienced before the paywall closed.
   * @readonly
   * @enum {string}
   */
  public static PAYWALL_RESULT = PAYWALL_RESULT;

  /**
   * Presents a paywall to the user with optional customization.
   *
   * This method allows for presenting a specific offering's paywall to the user. The caller
   * can decide whether to display a close button on the paywall through the `displayCloseButton`
   * parameter. By default, the close button is displayed.
   *
   * @param {PresentPaywallParams} params - The options for presenting the paywall.
   * @returns {Promise<PAYWALL_RESULT>} A promise that resolves with the result of the paywall presentation.
   */
  public static presentPaywall({
                                 offering,
                                 displayCloseButton = RevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON,
                                 fontFamily,
                               }: PresentPaywallParams = {}): Promise<PAYWALL_RESULT> {
    RevenueCatUI.logWarningIfPreviewAPIMode("presentPaywall");                                
    return RNPaywalls.presentPaywall(
      offering?.identifier ?? null,
      displayCloseButton,
      fontFamily,
    )
  }

  /**
   * Presents a paywall to the user if a specific entitlement is not already owned.
   *
   * This method evaluates whether the user already owns the specified entitlement.
   * If the entitlement is not owned, it presents a paywall for the specified offering (if provided), or the
   * default offering (if no offering is provided), to the user. The paywall will be presented
   * allowing the user the opportunity to purchase the offering. The caller
   * can decide whether to display a close button on the paywall through the `displayCloseButton`
   * parameter. By default, the close button is displayed.
   *
   * @param {PresentPaywallIfNeededParams} params - The parameters for presenting the paywall.
   * @returns {Promise<PAYWALL_RESULT>} A promise that resolves with the result of the paywall presentation.
   */
  public static presentPaywallIfNeeded({
                                         requiredEntitlementIdentifier,
                                         offering,
                                         displayCloseButton = RevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON,
                                         fontFamily,
                                       }: PresentPaywallIfNeededParams): Promise<PAYWALL_RESULT> {
    RevenueCatUI.logWarningIfPreviewAPIMode("presentPaywallIfNeeded");                                
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
    // We use 20 as the default paddingBottom because that's the corner radius in the Android native SDK.
    // We also listen to safeAreaInsetsDidChange which is only sent from iOS and which is triggered when the
    // safe area insets change. Not adding this extra padding on iOS will cause the content of the scrollview
    // to be hidden behind the rounded corners of the paywall.
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
        {/*Adding negative margin to the footer view to make it overlap with the extra padding of the scroll*/}
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

  /**
   * Presents the customer center to the user.
   * 
   * @param {PresentCustomerCenterParams} params - Optional parameters for presenting the customer center.
   * @returns {Promise<void>} A promise that resolves when the customer center is presented.
   */
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

      // Return a promise that resolves when the customer center is dismissed
      return RNCustomerCenter.presentCustomerCenter().finally(() => {
        // Clean up all event listeners when the customer center is dismissed
        subscriptions.forEach(subscription => subscription.remove());
      });
    }

    RevenueCatUI.logWarningIfPreviewAPIMode("presentCustomerCenter");
    return RNCustomerCenter.presentCustomerCenter();
  }

  /**
   * @deprecated, Use {@link OriginalTemplatePaywallFooterContainerView} instead
   */
  public static PaywallFooterContainerView: React.FC<FooterPaywallViewProps> =
    RevenueCatUI.OriginalTemplatePaywallFooterContainerView;
    
  private static logWarningIfPreviewAPIMode(methodName: string) {
    if (usingPreviewAPIMode) {
      // tslint:disable-next-line:no-console
      console.warn(`[RevenueCatUI] [${methodName}] This method is available but has no effect in Preview API mode.`);
    }
  }
}
