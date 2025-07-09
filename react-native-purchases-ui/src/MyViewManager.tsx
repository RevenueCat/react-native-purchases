import {requireNativeComponent} from 'react-native';
import type {ViewProps} from 'react-native';

interface MyViewManagerProps extends ViewProps {
  // Add any additional props if needed
}

export const MyViewManager =
  requireNativeComponent<MyViewManagerProps>('MyViewManager');
