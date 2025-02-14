import React from 'react';
import { requireNativeComponent, UIManager } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface CustomerCenterViewProps {
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Define the prop types for the native component
interface NativeCustomerCenterViewProps {
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
}

// Define the native component
const NativeCustomerCenterView =
  UIManager.getViewManagerConfig('CustomerCenter') != null
    ? requireNativeComponent<NativeCustomerCenterViewProps>('CustomerCenter')
    : () => {
      throw new Error("The native component 'CustomerCenter' is not linked properly.");
    };

const CustomerCenterView: React.FC<CustomerCenterViewProps> = ({
  onDismiss,
  style,
}) => (
  <NativeCustomerCenterView
    style={[{ flex: 1 }, style]}
    onDismiss={onDismiss}
  />
);

export default CustomerCenterView;