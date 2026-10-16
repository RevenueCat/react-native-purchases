import React, { type ReactNode } from "react";
import {
  Modal,
  Platform,
  requireNativeComponent,
  UIManager,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type ViewProps,
} from "react-native";

// Not yet part of the public API: this module is intentionally not re-exported from index.

export interface NativeOverlayProps {
  /**
   * Whether the overlay is presented. Children are only rendered while visible.
   */
  visible: boolean;
  /**
   * Content rendered above any natively presented RevenueCat UI.
   */
  children?: ReactNode;
  /**
   * Called once the overlay is on screen.
   */
  onShow?: () => void;
  /**
   * Called when the overlay leaves the screen. This also fires when the native UI
   * underneath is dismissed and takes the overlay with it; set `visible` to false then.
   */
  onDismiss?: () => void;
}

type NativeOverlayViewProps = ViewProps & {
  visible: boolean;
  onShow?: (event: NativeSyntheticEvent<Record<string, never>>) => void;
  onDismiss?: (event: NativeSyntheticEvent<Record<string, never>>) => void;
};

export const NATIVE_OVERLAY_VIEW_NAME = "RCNativeOverlayView";

const NativeOverlayView =
  Platform.OS === "ios" && UIManager.getViewManagerConfig(NATIVE_OVERLAY_VIEW_NAME) != null
    ? requireNativeComponent<NativeOverlayViewProps>(NATIVE_OVERLAY_VIEW_NAME)
    : null;

/**
 * Renders React children above natively presented RevenueCat UI, such as a paywall
 * shown with `RevenueCatUI.presentPaywall()`.
 *
 * React Native's `Modal` presents from the React root view controller. On iOS that
 * controller is already presenting the paywall, so the modal never appears until the
 * paywall closes. This component presents from the topmost presented view controller
 * instead. On other platforms it falls back to a transparent `Modal`.
 */
export const NativeOverlay: React.FC<NativeOverlayProps> = ({ visible, children, onShow, onDismiss }) => {
  const { width, height } = useWindowDimensions();

  if (NativeOverlayView == null) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onShow={onShow}
        onDismiss={onDismiss}
        onRequestClose={onDismiss}
      >
        {children}
      </Modal>
    );
  }

  return (
    <NativeOverlayView
      visible={visible}
      // The host itself stays empty in the React tree; its children are moved into the
      // presented controller. Size it to the window so layout matches the overlay.
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, width, height }}
      onShow={onShow ? () => onShow() : undefined}
      onDismiss={onDismiss ? () => onDismiss() : undefined}
    >
      {visible ? children : null}
    </NativeOverlayView>
  );
};
