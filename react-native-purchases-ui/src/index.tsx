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
import { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";
import React, { type ReactNode, useEffect, useState } from "react";

export { PAYWALL_RESULT } from "@revenuecat/purchases-typescript-internal";

const LINKING_ERROR =
  `The package 'react-native-purchases-view' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNPaywalls = NativeModules.RNPaywalls;

const eventEmitter = new NativeEventEmitter(RNPaywalls);

type PaywallViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const InternalPaywall =
  UIManager.getViewManagerConfig('Paywall') != null
    ? requireNativeComponent<PaywallViewProps>('Paywall')
    : () => {
      throw new Error(LINKING_ERROR);
    };

const InternalPaywallFooterView = UIManager.getViewManagerConfig('Paywall') != null
  ? requireNativeComponent<PaywallViewProps>('RCPaywallFooterView')
  : () => {
    throw new Error(LINKING_ERROR);
  };

export interface PresentPaywallParams {
  /**
   * Whether to display the close button or not.
   */
  displayCloseButton?: boolean;
}

export type PresentPaywallIfNeededParams = PresentPaywallParams & {
  /**
   * The paywall will only be presented if this entitlement is not active.
   */
  requiredEntitlementIdentifier: string;
}

export default class RevenueCatUI {

  /**
   * The result of presenting a paywall. This will be the last situation the user experienced before the paywall closed.
   * @readonly
   * @enum {string}
   */
  public static PAYWALL_RESULT = PAYWALL_RESULT;

  public static presentPaywall(params: PresentPaywallParams): Promise<PAYWALL_RESULT> {
    return RNPaywalls.presentPaywall(params);
  }

  public static presentPaywallIfNeeded(params: PresentPaywallIfNeededParams): Promise<PAYWALL_RESULT> {
    return RNPaywalls.presentPaywallIfNeeded(params);
  }

  public static Paywall: React.FC<PaywallViewProps> = (props) => (
    <InternalPaywall {...props} style={[{flex: 1}, props.style]}/>
  );

  public static PaywallFooterContainerView: React.FC<PaywallViewProps> = ({style, children}) => {
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
        <InternalPaywallFooterView style={{marginTop: -20}}/>
      </View>
    );
  };
}
