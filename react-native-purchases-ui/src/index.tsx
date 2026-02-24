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
import { PreviewCustomerCenter, PreviewPaywall } from "./preview/previewComponents";
import {
  type CustomVariables,
  type NativeCustomVariables,
  convertCustomVariablesToStringMap,
  transformOptionsForNative,
} from "./customVariables";

export { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";
export { CustomVariableValue, type CustomVariables } from "./customVariables";
// Re-export for testing purposes (marked as @internal)
export { convertCustomVariablesToStringMap, transformOptionsForNative } from "./customVariables";

// MARK: - PaywallListener & PurchaseLogic types

/**
 * Object passed to onPurchaseInitiated that allows the developer to
 * control when (and whether) the purchase flow continues.
 * The developer can store this and call resume() asynchronously
 * (e.g., after an auth flow on a different screen).
 */
export interface PurchaseResumable {
  /** Call to proceed with or cancel the purchase. Defaults to true (proceed). */
  resume(shouldProceed?: boolean): void;
}

/**
 * Callbacks for observing paywall lifecycle events such as purchases,
 * restores, and errors. All callbacks are optional.
 *
 * Pass as `listener` in {@link PresentPaywallParams} to receive events
 * while the paywall is displayed.
 */
export interface PaywallListener {
  /** Called when a purchase begins for a package. */
  onPurchaseStarted?: (args: { packageBeingPurchased: PurchasesPackage }) => void;
  /** Called when a purchase completes successfully. */
  onPurchaseCompleted?: (args: { customerInfo: CustomerInfo; storeTransaction: PurchasesStoreTransaction }) => void;
  /** Called when a purchase fails with an error. */
  onPurchaseError?: (args: { error: PurchasesError }) => void;
  /** Called when the user cancels a purchase. */
  onPurchaseCancelled?: () => void;
  /** Called when a restore operation begins. */
  onRestoreStarted?: () => void;
  /** Called when a restore operation completes successfully. */
  onRestoreCompleted?: (args: { customerInfo: CustomerInfo }) => void;
  /** Called when a restore operation fails with an error. */
  onRestoreError?: (args: { error: PurchasesError }) => void;
  /**
   * Called before the payment sheet is displayed, allowing the app to gate
   * the purchase flow (e.g., require authentication first).
   *
   * The developer receives a {@link PurchaseResumable} that can be stored
   * and called asynchronously. Call `resumable.resume(true)` to proceed
   * with the purchase, or `resumable.resume(false)` to cancel it.
   *
   * If this callback is not provided, the purchase proceeds automatically.
   */
  onPurchaseInitiated?: (args: { packageBeingPurchased: PurchasesPackage; resumable: PurchaseResumable }) => void;
}

/**
 * Possible outcomes from a custom {@link PurchaseLogic} operation.
 */
export enum PURCHASE_LOGIC_RESULT {
  /** The purchase or restore completed successfully. */
  SUCCESS = 'SUCCESS',
  /** The user cancelled the purchase or restore. */
  CANCELLATION = 'CANCELLATION',
  /** The purchase or restore failed with an error. */
  ERROR = 'ERROR',
}

/**
 * The result of a custom purchase or restore operation performed by {@link PurchaseLogic}.
 */
export type PurchaseLogicResult =
  | { result: PURCHASE_LOGIC_RESULT.SUCCESS }
  | { result: PURCHASE_LOGIC_RESULT.CANCELLATION }
  | { result: PURCHASE_LOGIC_RESULT.ERROR; error?: PurchasesError };

/**
 * Custom purchase and restore handlers for apps that manage their own
 * purchase flow (`purchasesAreCompletedBy: MY_APP`).
 *
 * When provided in {@link PresentPaywallParams}, the paywall delegates
 * purchase and restore operations to these handlers instead of using
 * RevenueCat's built-in purchase flow.
 */
export interface PurchaseLogic {
  /**
   * Called when the user initiates a purchase from the paywall.
   * Perform the purchase using your own payment system and return the result.
   */
  performPurchase: (args: { packageToPurchase: PurchasesPackage }) => Promise<PurchaseLogicResult>;
  /**
   * Called when the user initiates a restore from the paywall.
   * Perform the restore using your own system and return the result.
   */
  performRestore: () => Promise<PurchaseLogicResult>;
}

const NATIVE_MODULE_NOT_FOUND_ERROR =
  `[RevenueCatUI] Native module not found. This can happen if:\n\n` +
  `- You are running in an unsupported environment (e.g., A browser or a container app that doesn't actually use the native modules)\n` +
  `- The native module failed to initialize\n` +
  `- react-native-purchases is not properly installed\n\n` +
  `To fix this:\n` +
  `- If using Expo, create a development build: https://docs.expo.dev/develop/development-builds/create-a-build/\n` +
  `- If using bare React Native, run 'pod install' and rebuild the app\n` +
  `- Make sure react-native-purchases is installed and you have rebuilt the app\n`;


// Get the native module or use the preview implementation
const usingPreviewAPIMode = shouldUsePreviewAPIMode();

const RNPaywalls = usingPreviewAPIMode ? previewNativeModuleRNPaywalls : NativeModules.RNPaywalls;
const RNCustomerCenter = usingPreviewAPIMode ? previewNativeModuleRNCustomerCenter : NativeModules.RNCustomerCenter;

// Helper function to check native module availability - called at usage time, not import time
function throwIfNativeModulesNotAvailable(): void {
  if (!RNPaywalls || !RNCustomerCenter) {
    throw new Error(NATIVE_MODULE_NOT_FOUND_ERROR);
  }
}

const NativePaywall = !usingPreviewAPIMode && UIManager.getViewManagerConfig('Paywall') != null
  ? requireNativeComponent<NativeFullScreenPaywallViewProps>('Paywall')
  : null;

const NativePaywallFooter = !usingPreviewAPIMode && UIManager.getViewManagerConfig('Paywall') != null
  ? requireNativeComponent<NativeInternalFooterPaywallViewProps>('RCPaywallFooterView')
  : null;

// Only create event emitters if native modules are available
const eventEmitter = !usingPreviewAPIMode && RNPaywalls ? new NativeEventEmitter(RNPaywalls) : null;
const customerCenterEventEmitter = !usingPreviewAPIMode && RNCustomerCenter ? new NativeEventEmitter(RNCustomerCenter) : null;

const InternalPaywall: React.FC<FullScreenPaywallViewProps> = ({
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
  onPurchasePackageInitiated,
}) => {
  if (usingPreviewAPIMode) {
    return (
      <PreviewPaywall
        offering={options?.offering}
        displayCloseButton={options?.displayCloseButton}
        fontFamily={options?.fontFamily}
        onPurchaseStarted={onPurchaseStarted}
        onPurchaseCompleted={onPurchaseCompleted}
        onPurchaseError={onPurchaseError}
        onPurchaseCancelled={onPurchaseCancelled}
        onRestoreStarted={onRestoreStarted}
        onRestoreCompleted={onRestoreCompleted}
        onRestoreError={onRestoreError}
        onDismiss={onDismiss}
      />
    );
  } else if (!!NativePaywall) {
    // Transform options to native format (CustomVariables -> string map)
    const nativeOptions = transformOptionsForNative(options);
    return (
      <NativePaywall
        style={style}
        children={children}
        options={nativeOptions}
        onPurchaseStarted={(event: any) => onPurchaseStarted && onPurchaseStarted(event.nativeEvent)}
        onPurchaseCompleted={(event: any) => onPurchaseCompleted && onPurchaseCompleted(event.nativeEvent)}
        onPurchaseError={(event: any) => onPurchaseError && onPurchaseError(event.nativeEvent)}
        onPurchaseCancelled={() => onPurchaseCancelled && onPurchaseCancelled()}
        onRestoreStarted={() => onRestoreStarted && onRestoreStarted()}
        onRestoreCompleted={(event: any) => onRestoreCompleted && onRestoreCompleted(event.nativeEvent)}
        onRestoreError={(event: any) => onRestoreError && onRestoreError(event.nativeEvent)}
        onDismiss={() => onDismiss && onDismiss()}
        onPurchasePackageInitiated={(event: any) => {
          const { packageBeingPurchased, requestId } = event.nativeEvent;
          if (onPurchasePackageInitiated) {
            const resume = (shouldProceed: boolean) => {
              RNPaywalls!.resumePurchasePackageInitiated(requestId, shouldProceed);
            };
            onPurchasePackageInitiated({ packageBeingPurchased, resume });
          } else {
            RNPaywalls!.resumePurchasePackageInitiated(requestId, true);
          }
        }}
      />
    );
  }

  throw new Error(NATIVE_MODULE_NOT_FOUND_ERROR);
};

const InternalPaywallFooterView: React.FC<InternalFooterPaywallViewProps> = ({
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
  onMeasure,
}) => {
  if (usingPreviewAPIMode) {
    return (
      <PreviewPaywall
        offering={options?.offering}
        displayCloseButton={true}
        fontFamily={options?.fontFamily}
        onPurchaseStarted={onPurchaseStarted}
        onPurchaseCompleted={onPurchaseCompleted}
        onPurchaseError={onPurchaseError}
        onPurchaseCancelled={onPurchaseCancelled}
        onRestoreStarted={onRestoreStarted}
        onRestoreCompleted={onRestoreCompleted}
        onRestoreError={onRestoreError}
        onDismiss={onDismiss}
      />
    );
  } else if (!!NativePaywallFooter) {
    // Transform options to native format (CustomVariables -> string map)
    const nativeOptions = transformOptionsForNative(options);
    return (
      <NativePaywallFooter
        style={style}
        children={children}
        options={nativeOptions}
        onPurchaseStarted={(event: any) => onPurchaseStarted && onPurchaseStarted(event.nativeEvent)}
        onPurchaseCompleted={(event: any) => onPurchaseCompleted && onPurchaseCompleted(event.nativeEvent)}
        onPurchaseError={(event: any) => onPurchaseError && onPurchaseError(event.nativeEvent)}
        onPurchaseCancelled={() => onPurchaseCancelled && onPurchaseCancelled()}
        onRestoreStarted={() => onRestoreStarted && onRestoreStarted()}
        onRestoreCompleted={(event: any) => onRestoreCompleted && onRestoreCompleted(event.nativeEvent)}
        onRestoreError={(event: any) => onRestoreError && onRestoreError(event.nativeEvent)}
        onDismiss={() => onDismiss && onDismiss()}
        onMeasure={onMeasure}
      />
    );
  }

  throw new Error(NATIVE_MODULE_NOT_FOUND_ERROR);
};

export interface PresentPaywallParams {
  /**
   * Whether to display the close button or not.
   * Only available for original template paywalls. Ignored for V2 Paywalls and web.
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
   * Only available for original template paywalls. Ignored for V2 Paywalls and web.
   */
  fontFamily?: string | null;

  /**
   * Custom variables to pass to the paywall for text substitution.
   * Use `{{ custom.variable_name }}` syntax in your paywall text to reference these values.
   * Keys must start with a letter and can only contain letters, numbers, and underscores.
   * Only available for V2 Paywalls.
   *
   * @example
   * ```typescript
   * customVariables: {
   *   'player_name': CustomVariableValue.string('John'),
   *   'level': CustomVariableValue.string('42'),
   * }
   * ```
   */
  customVariables?: CustomVariables;

  /**
   * Optional listener for paywall lifecycle events such as purchase
   * completion, restoration, and errors.
   */
  listener?: PaywallListener;

  /**
   * Optional custom purchase/restore logic for when
   * `purchasesAreCompletedBy` is set to `MY_APP`.
   */
  purchaseLogic?: PurchaseLogic;
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

  /**
   * Custom variables to pass to the paywall for text substitution.
   * Use `{{ custom.variable_name }}` syntax in your paywall text to reference these values.
   * Keys must start with a letter and can only contain letters, numbers, and underscores.
   * Only available for V2 Paywalls.
   *
   * @example
   * ```typescript
   * customVariables: {
   *   'player_name': CustomVariableValue.string('John'),
   *   'level': CustomVariableValue.string('42'),
   * }
   * ```
   */
  customVariables?: CustomVariables;
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
  onPurchasePackageInitiated?: ({
    packageBeingPurchased, 
    resume
  }: { packageBeingPurchased: PurchasesPackage, resume: (shouldResume: boolean) => void}) => void;
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

/**
 * Helper type that replaces CustomVariables with NativeCustomVariables in an options type.
 * @internal
 */
type WithNativeCustomVariables<T extends { customVariables?: CustomVariables }> =
  Omit<T, 'customVariables'> & { customVariables?: NativeCustomVariables | null };

/**
 * Native props for FullScreenPaywall component.
 * @internal
 */
type NativeFullScreenPaywallViewProps = Omit<FullScreenPaywallViewProps, 'options'> & {
  options?: WithNativeCustomVariables<FullScreenPaywallViewOptions>;
};

/**
 * Native props for FooterPaywall component.
 * @internal
 */
type NativeInternalFooterPaywallViewProps = Omit<InternalFooterPaywallViewProps, 'options'> & {
  options?: WithNativeCustomVariables<FooterPaywallViewOptions>;
};

const InternalCustomerCenterView = !usingPreviewAPIMode && UIManager.getViewManagerConfig('CustomerCenterView') != null
    ? requireNativeComponent<CustomerCenterViewProps>('CustomerCenterView')
    : null;

export interface CustomerCenterViewProps extends CustomerCenterCallbacks {
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
  /**
   * Whether to show the close button in the customer center.
   *
   * When `true`, displays a close button that can be used to dismiss the customer center.
   * When `false`, hides the internal close button - typically used for push navigation where
   * the navigation bar provides the back button.
   *
   * @default true
   */
  shouldShowCloseButton?: boolean;
}

export type CustomerCenterManagementOption =
  | 'cancel'
  | 'custom_url'
  | 'missing_purchase'
  | 'refund_request' // iOS only - not available on Android
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
   * Called when a refund request starts with the product identifier.
   *
   * **iOS only** - This callback will never be called on Android as refund requests are not supported on that platform.
   */
  onRefundRequestStarted?: ({productIdentifier}: { productIdentifier: string }) => void;

  /**
   * Called when a refund request completes with status information.
   *
   * **iOS only** - This callback will never be called on Android as refund requests are not supported on that platform.
   */
  onRefundRequestCompleted?: ({productIdentifier, refundRequestStatus}: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => void;

  /**
   * Called when a customer center management option is selected.
   * For 'custom_url' options, the url parameter will contain the URL.
   * For all other options, the url parameter will be null.
   */
  onManagementOptionSelected?: (event: CustomerCenterManagementOptionEvent) => void;

  /**
   * Called when a custom action is selected in the customer center.
   */
  onCustomActionSelected?: ({actionId, purchaseIdentifier}: { actionId: string; purchaseIdentifier: string | null }) => void;
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
                                 customVariables,
                                 listener,
                                 purchaseLogic,
                               }: PresentPaywallParams = {}): Promise<PAYWALL_RESULT> {
    throwIfNativeModulesNotAvailable();
    RevenueCatUI.logWarningIfPreviewAPIMode("presentPaywall");

    return RevenueCatUI.presentPaywallInternal(
      () => RNPaywalls!.presentPaywall(
        offering?.identifier ?? null,
        offering?.availablePackages?.[0]?.presentedOfferingContext,
        displayCloseButton,
        fontFamily,
        convertCustomVariablesToStringMap(customVariables),
        !!listener,
        !!purchaseLogic,
      ),
      listener,
      purchaseLogic,
    );
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
                                         customVariables,
                                         listener,
                                         purchaseLogic,
                                       }: PresentPaywallIfNeededParams): Promise<PAYWALL_RESULT> {
    throwIfNativeModulesNotAvailable();
    RevenueCatUI.logWarningIfPreviewAPIMode("presentPaywallIfNeeded");

    return RevenueCatUI.presentPaywallInternal(
      () => RNPaywalls!.presentPaywallIfNeeded(
        requiredEntitlementIdentifier,
        offering?.identifier ?? null,
        offering?.availablePackages?.[0]?.presentedOfferingContext,
        displayCloseButton,
        fontFamily,
        convertCustomVariablesToStringMap(customVariables),
        !!listener,
        !!purchaseLogic,
      ),
      listener,
      purchaseLogic,
    );
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
                                                                   onPurchasePackageInitiated,
                                                                 }) => {
    return (
      <InternalPaywall
        options={options}
        children={children}
        onPurchaseStarted={onPurchaseStarted}
        onPurchaseCompleted={onPurchaseCompleted}
        onPurchaseError={onPurchaseError}
        onPurchaseCancelled={onPurchaseCancelled}
        onRestoreStarted={onRestoreStarted}
        onRestoreCompleted={onRestoreCompleted}
        onRestoreError={onRestoreError}
        onDismiss={onDismiss}
        onPurchasePackageInitiated={onPurchasePackageInitiated}
        style={[{flex: 1}, style]}
      />
    );
  };

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

      const subscription = eventEmitter?.addListener(
        'safeAreaInsetsDidChange',
        handleSafeAreaInsetsChange
      );

      return () => {
        subscription?.remove();
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
          onPurchaseStarted={onPurchaseStarted}
          onPurchaseCompleted={onPurchaseCompleted}
          onPurchaseError={onPurchaseError}
          onPurchaseCancelled={onPurchaseCancelled}
          onRestoreStarted={onRestoreStarted}
          onRestoreCompleted={onRestoreCompleted}
          onRestoreError={onRestoreError}
          onDismiss={onDismiss}
          onMeasure={(event: any) => setHeight(event.nativeEvent.measurements.height)}
        />
      </View>
    );
  };

  /**
   * A React component for embedding the Customer Center directly in your UI.
   *
   * This component renders the RevenueCat Customer Center as a native view that can be
   * embedded within your existing React Native screens. Unlike `presentCustomerCenter()`,
   * which presents the Customer Center modally, this component gives you full control
   * over layout and presentation.
   *
   * The Customer Center allows users to manage their subscriptions, view purchase history,
   * request refunds (iOS only), and access support options - all configured through the
   * RevenueCat dashboard.
   *
   * @param style - Optional style prop to customize the appearance and layout
   * @param onDismiss - Callback fired when the user dismisses the Customer Center (e.g., taps a close button)
   *
   * @example
   * ```tsx
   * import RevenueCatUI from 'react-native-purchases-ui';
   *
   * function MyScreen() {
   *   return (
   *     <View style={{ flex: 1 }}>
   *       <RevenueCatUI.CustomerCenterView
   *         style={{ flex: 1 }}
   *         onDismiss={() => navigation.goBack()}
   *       />
   *     </View>
   *   );
   * }
   * ```
   */
  public static CustomerCenterView: React.FC<CustomerCenterViewProps> = ({
    style,
    onDismiss,
    onCustomActionSelected,
    onFeedbackSurveyCompleted,
    onShowingManageSubscriptions,
    onRestoreCompleted,
    onRestoreFailed,
    onRestoreStarted,
    onRefundRequestStarted,
    onRefundRequestCompleted,
    onManagementOptionSelected,
    shouldShowCloseButton = true,
  }) => {
    if (usingPreviewAPIMode) {
      return (
        <PreviewCustomerCenter
          onDismiss={() => onDismiss && onDismiss()}
          style={[{ flex: 1 }, style]}
        />
      );
    }

    if (!InternalCustomerCenterView) {
      throw new Error(NATIVE_MODULE_NOT_FOUND_ERROR);
    }

    return (
      <InternalCustomerCenterView
        onDismiss={onDismiss ? () => onDismiss() : undefined}
        onCustomActionSelected={onCustomActionSelected ? (event: any) => onCustomActionSelected(event.nativeEvent) : undefined}
        onFeedbackSurveyCompleted={onFeedbackSurveyCompleted ? (event: any) => onFeedbackSurveyCompleted(event.nativeEvent) : undefined}
        onShowingManageSubscriptions={onShowingManageSubscriptions ? () => onShowingManageSubscriptions() : undefined}
        onRestoreCompleted={onRestoreCompleted ? (event: any) => onRestoreCompleted(event.nativeEvent) : undefined}
        onRestoreFailed={onRestoreFailed ? (event: any) => onRestoreFailed(event.nativeEvent) : undefined}
        onRestoreStarted={onRestoreStarted ? () => onRestoreStarted() : undefined}
        onRefundRequestStarted={onRefundRequestStarted ? (event: any) => onRefundRequestStarted(event.nativeEvent) : undefined}
        onRefundRequestCompleted={onRefundRequestCompleted ? (event: any) => onRefundRequestCompleted(event.nativeEvent) : undefined}
        onManagementOptionSelected={onManagementOptionSelected ? (event: any) => onManagementOptionSelected(event.nativeEvent) : undefined}
        shouldShowCloseButton={shouldShowCloseButton}
        style={[{ flex: 1 }, style]}
      />
    );
  };

  /**
   * Presents the customer center to the user.
   *
   * @param {PresentCustomerCenterParams} params - Optional parameters for presenting the customer center.
   * @returns {Promise<void>} A promise that resolves when the customer center is presented.
   */
  public static presentCustomerCenter(params?: PresentCustomerCenterParams): Promise<void> {
    throwIfNativeModulesNotAvailable();
    if (params?.callbacks) {
      const subscriptions: { remove: () => void }[] = [];
      const callbacks = params.callbacks as CustomerCenterCallbacks;

      if (callbacks.onFeedbackSurveyCompleted) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onFeedbackSurveyCompleted',
          (event: { feedbackSurveyOptionId: string }) => callbacks.onFeedbackSurveyCompleted &&
            callbacks.onFeedbackSurveyCompleted(event)
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onShowingManageSubscriptions) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onShowingManageSubscriptions',
          () => callbacks.onShowingManageSubscriptions && callbacks.onShowingManageSubscriptions()
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onRestoreCompleted) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onRestoreCompleted',
          (event: { customerInfo: CustomerInfo }) => callbacks.onRestoreCompleted &&
            callbacks.onRestoreCompleted(event)
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onRestoreFailed) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onRestoreFailed',
          (event: { error: PurchasesError }) => callbacks.onRestoreFailed &&
            callbacks.onRestoreFailed(event)
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onRestoreStarted) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onRestoreStarted',
          () => callbacks.onRestoreStarted && callbacks.onRestoreStarted()
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onRefundRequestStarted) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onRefundRequestStarted',
          (event: { productIdentifier: string }) => callbacks.onRefundRequestStarted &&
            callbacks.onRefundRequestStarted(event)
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onRefundRequestCompleted) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onRefundRequestCompleted',
          (event: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => callbacks.onRefundRequestCompleted &&
            callbacks.onRefundRequestCompleted(event)
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onManagementOptionSelected) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onManagementOptionSelected',
          (event: CustomerCenterManagementOptionEvent) => callbacks.onManagementOptionSelected &&
            callbacks.onManagementOptionSelected(event)
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      if (callbacks.onCustomActionSelected) {
        const subscription = customerCenterEventEmitter?.addListener(
          'onCustomActionSelected',
          (event: { actionId: string; purchaseIdentifier: string | null }) => callbacks.onCustomActionSelected &&
            callbacks.onCustomActionSelected(event)
        );
        if (subscription) {
          subscriptions.push(subscription);
        }
      }

      // Return a promise that resolves when the customer center is dismissed
      return RNCustomerCenter!.presentCustomerCenter().finally(() => {
        // Clean up all event listeners when the customer center is dismissed
        subscriptions.forEach(subscription => subscription.remove());
      });
    }

    RevenueCatUI.logWarningIfPreviewAPIMode("presentCustomerCenter");
    return RNCustomerCenter!.presentCustomerCenter();
  }

  /**
   * @deprecated, Use {@link OriginalTemplatePaywallFooterContainerView} instead
   */
  public static PaywallFooterContainerView: React.FC<FooterPaywallViewProps> =
    RevenueCatUI.OriginalTemplatePaywallFooterContainerView;

  private static async presentPaywallInternal(
    nativeCall: () => Promise<PAYWALL_RESULT>,
    listener?: PaywallListener,
    purchaseLogic?: PurchaseLogic,
  ): Promise<PAYWALL_RESULT> {
    const subscriptions: { remove: () => void }[] = [];

    try {
      // Register PaywallListener event handlers
      if (listener) {
        if (listener.onPurchaseStarted) {
          const cb = listener.onPurchaseStarted;
          const sub = eventEmitter?.addListener('onPurchaseStarted', (data: any) => {
            cb({ packageBeingPurchased: data.packageBeingPurchased ?? data });
          });
          if (sub) subscriptions.push(sub);
        }
        if (listener.onPurchaseCompleted) {
          const cb = listener.onPurchaseCompleted;
          const sub = eventEmitter?.addListener('onPurchaseCompleted', (data: any) => {
            cb({
              customerInfo: data.customerInfo,
              storeTransaction: data.storeTransaction,
            });
          });
          if (sub) subscriptions.push(sub);
        }
        if (listener.onPurchaseError) {
          const cb = listener.onPurchaseError;
          const sub = eventEmitter?.addListener('onPurchaseError', (data: any) => {
            cb({ error: data.error ?? data });
          });
          if (sub) subscriptions.push(sub);
        }
        if (listener.onPurchaseCancelled) {
          const cb = listener.onPurchaseCancelled;
          const sub = eventEmitter?.addListener('onPurchaseCancelled', () => {
            cb();
          });
          if (sub) subscriptions.push(sub);
        }
        if (listener.onRestoreStarted) {
          const cb = listener.onRestoreStarted;
          const sub = eventEmitter?.addListener('onRestoreStarted', () => {
            cb();
          });
          if (sub) subscriptions.push(sub);
        }
        if (listener.onRestoreCompleted) {
          const cb = listener.onRestoreCompleted;
          const sub = eventEmitter?.addListener('onRestoreCompleted', (data: any) => {
            cb({ customerInfo: data.customerInfo ?? data });
          });
          if (sub) subscriptions.push(sub);
        }
        if (listener.onRestoreError) {
          const cb = listener.onRestoreError;
          const sub = eventEmitter?.addListener('onRestoreError', (data: any) => {
            cb({ error: data.error ?? data });
          });
          if (sub) subscriptions.push(sub);
        }
      }

      // Always register onPurchaseInitiated so we auto-resume when the user
      // doesn't provide an onPurchaseInitiated callback — otherwise the
      // purchase flow hangs waiting for a resume that never comes.
      const onPurchaseInitiatedCb = listener?.onPurchaseInitiated;
      const purchaseInitiatedSub = eventEmitter?.addListener('onPurchaseInitiated', (data: any) => {
        const requestId: string = data.requestId;
        const packageBeingPurchased = data.package ?? data.packageBeingPurchased;
        if (onPurchaseInitiatedCb) {
          onPurchaseInitiatedCb({
            packageBeingPurchased,
            resumable: {
              resume(shouldProceed = true) {
                RNPaywalls!.resumePurchasePackageInitiated(requestId, shouldProceed);
              },
            },
          });
        } else {
          // No callback provided — auto-proceed with the purchase.
          RNPaywalls!.resumePurchasePackageInitiated(requestId, true);
        }
      });
      if (purchaseInitiatedSub) subscriptions.push(purchaseInitiatedSub);

      // Register PurchaseLogic event handlers
      if (purchaseLogic) {
        const purchaseSub = eventEmitter?.addListener('onPerformPurchaseRequest', async (data: any) => {
          const requestId: string = data.requestId;
          const packageToPurchase = data.package ?? data.packageBeingPurchased ?? data.packageToPurchase;
          try {
            const result = await purchaseLogic.performPurchase({ packageToPurchase });
            RNPaywalls!.resumePurchaseLogicPurchase(
              requestId,
              result.result,
              result.result === PURCHASE_LOGIC_RESULT.ERROR && 'error' in result && result.error
                ? { code: result.error.code, message: result.error.message }
                : null,
            );
          } catch (e: any) {
            RNPaywalls!.resumePurchaseLogicPurchase(
              requestId,
              PURCHASE_LOGIC_RESULT.ERROR,
              { message: e?.message ?? 'Unknown error' },
            );
          }
        });
        if (purchaseSub) subscriptions.push(purchaseSub);

        const restoreSub = eventEmitter?.addListener('onPerformRestoreRequest', async (data: any) => {
          const requestId: string = data.requestId;
          try {
            const result = await purchaseLogic.performRestore();
            RNPaywalls!.resumePurchaseLogicRestore(
              requestId,
              result.result,
              result.result === PURCHASE_LOGIC_RESULT.ERROR && 'error' in result && result.error
                ? { code: result.error.code, message: result.error.message }
                : null,
            );
          } catch (e: any) {
            RNPaywalls!.resumePurchaseLogicRestore(
              requestId,
              PURCHASE_LOGIC_RESULT.ERROR,
              { message: e?.message ?? 'Unknown error' },
            );
          }
        });
        if (restoreSub) subscriptions.push(restoreSub);
      }

      return await nativeCall();
    } finally {
      // Clean up all registered listeners
      for (const sub of subscriptions) {
        sub.remove();
      }
    }
  }

  private static logWarningIfPreviewAPIMode(methodName: string) {
    if (usingPreviewAPIMode) {
      // tslint:disable-next-line:no-console
      console.warn(`[RevenueCatUI] [${methodName}] This method is available but has no effect in Preview API mode.`);
    }
  }
}
