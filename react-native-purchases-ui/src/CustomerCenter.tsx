import React from 'react';
import { UIManager, requireNativeComponent } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

type NativeCustomerCenterViewProps = {
  style?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
};

const NativeCustomerCenterView = UIManager.getViewManagerConfig('CustomerCenter') != null
  ? requireNativeComponent<NativeCustomerCenterViewProps>('CustomerCenter')
  : () => {
    throw new Error("The native component 'CustomerCenter' is not linked properly.");
  };

export const CustomerCenter: React.FC<NativeCustomerCenterViewProps> = ({
  onDismiss,
  style,
}) => (
  <NativeCustomerCenterView
    style={[{ flex: 1 }, style]}
    onDismiss={onDismiss}
  />
);

export type { NativeCustomerCenterViewProps }; 