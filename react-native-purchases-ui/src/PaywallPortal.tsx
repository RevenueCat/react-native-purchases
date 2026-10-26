import React, { type ReactNode } from 'react';
import {
  Platform,
  requireNativeComponent,
  UIManager,
  useWindowDimensions,
  type ViewProps,
} from 'react-native';
import { shouldUsePreviewAPIMode } from './utils/environment';

export interface PaywallPortalProps {
  children?: ReactNode;
  /** iOS only. The native host was dismissed; clear any error UI owned by the app. */
  onHostDismissed?: () => void;
}

const NativePortal = !shouldUsePreviewAPIMode() && Platform.OS === 'ios' &&
  UIManager.getViewManagerConfig('RCPaywallPortalView') != null
  ? requireNativeComponent<ViewProps & { onHostDismissed?: () => void }>('RCPaywallPortalView')
  : null;

/**
 * Use the same component on iOS and Android to host a React Native Modal above a native flow.
 * On iOS, it moves children into the presented controller so the Modal can present from it.
 * On Android, children stay in the React tree: Modal and Alert use their own native windows.
 * Mount Modal children when the error arrives. React Native Alert is imperative and can be
 * called directly from an error presenter. Inline overlays are only hosted above flows on iOS.
 * Empty areas do not intercept touches on the native flow.
 */
export const PaywallPortal: React.FC<PaywallPortalProps> = ({ children, onHostDismissed }) => {
  const { width, height } = useWindowDimensions();
  if (!NativePortal) {
    if (Platform.OS === 'ios' && !shouldUsePreviewAPIMode()) {
      throw new Error('[RevenueCatUI] PaywallPortal native view not found. Rebuild your app.');
    }
    return <>{children}</>;
  }
  return (
    <NativePortal
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
      onHostDismissed={onHostDismissed}
    >
      {children}
    </NativePortal>
  );
};
