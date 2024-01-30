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
import { PAYWALL_RESULT, type PurchasesOffering } from "@revenuecat/purchases-typescript-internal";
import React, { type ReactNode, useEffect, useState } from "react";

export { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";

const LINKING_ERROR =
  `The package 'react-native-purchases-ui' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNPaywalls = NativeModules.RNPaywalls;

if (!RNPaywalls) {
  throw new Error(LINKING_ERROR);
}

const eventEmitter = new NativeEventEmitter(RNPaywalls);

const InternalPaywall =
  UIManager.getViewManagerConfig('Paywall') != null
    ? requireNativeComponent<FullScreenPaywallViewProps>('Paywall')
    : () => {
      throw new Error(LINKING_ERROR);
    };

const InternalPaywallFooterView = UIManager.getViewManagerConfig('Paywall') != null
  ? requireNativeComponent<FooterPaywallViewProps>('RCPaywallFooterView')
  : () => {
    throw new Error(LINKING_ERROR);
  };

export interface PresentPaywallParams {
  /**
   * Whether to display the close button or not.
   */
  displayCloseButton?: boolean;

  /**
   * The offering to load the paywall with. This will be the "current" offering by default.
   */
  offering?: PurchasesOffering;
}

export type PresentPaywallIfNeededParams = PresentPaywallParams & {
  /**
   * The paywall will only be presented if this entitlement is not active.
   */
  requiredEntitlementIdentifier: string;
}

export interface PaywallViewOptions {
  offering?: PurchasesOffering | null;
}

export interface FullScreenPaywallViewOptions extends PaywallViewOptions {
  // Additional properties for FullScreenPaywallViewOptions can be added here if needed in the future
}

// Currently the same as the base type, but can be extended later if needed
export interface FooterPaywallViewOptions extends PaywallViewOptions {
  // Additional properties for FooterPaywallViewOptions can be added here if needed in the future
}

type FullScreenPaywallViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  options?: FullScreenPaywallViewOptions;
};

type FooterPaywallViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  options?: FooterPaywallViewOptions;
};

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
                                 displayCloseButton = RevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON
                               }: PresentPaywallParams = {}): Promise<PAYWALL_RESULT> {
    return RNPaywalls.presentPaywall(offering?.identifier ?? null, displayCloseButton)
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
                                         displayCloseButton = RevenueCatUI.Defaults.PRESENT_PAYWALL_DISPLAY_CLOSE_BUTTON
                                       }: PresentPaywallIfNeededParams): Promise<PAYWALL_RESULT> {
    return RNPaywalls.presentPaywallIfNeeded(requiredEntitlementIdentifier, offering?.identifier ?? null, displayCloseButton)
  }

  public static Paywall: React.FC<FullScreenPaywallViewProps> = (props) => (
    <InternalPaywall {...props} style={[{flex: 1}, props.style]}/>
  );

  public static PaywallFooterContainerView: React.FC<FooterPaywallViewProps> = ({style, children, options}) => {
    // We use 20 as the default paddingBottom because that's the corner radius in the Android native SDK.
    // We also listen to safeAreaInsetsDidChange which is only sent from iOS and which is triggered when the
    // safe area insets change. Not adding this extra padding on iOS will cause the content of the scrollview
    // to be hidden behind the rounded corners of the paywall.
    const [paddingBottom, setPaddingBottom] = useState(20);

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
        <InternalPaywallFooterView style={{marginTop: -20}} options={options}/>
      </View>
    );
  };
}
