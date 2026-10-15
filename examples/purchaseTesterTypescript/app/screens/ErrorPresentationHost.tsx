// Prototype-only component. Requires the native SDK context patch on this branch.
import React, {type ReactNode, useEffect, useRef} from 'react';
import {
  NativeModules, Platform, requireNativeComponent, UIManager,
  useWindowDimensions, type NativeSyntheticEvent, type ViewProps,
} from 'react-native';

export type ErrorAction = 'RETRY' | 'CONTINUE' | 'NAVIGATE_BACK';
export type HostedErrorRequest = {requestId: string};
type HostEvent = NativeSyntheticEvent<{requestId: string; message?: string}>;
type NativeProps = ViewProps & {
  requestId: string;
  onShow: (event: HostEvent) => void;
  onDismiss: (event: HostEvent) => void;
  onFailure: (event: HostEvent) => void;
};
const NativeHost = Platform.OS === 'ios' && UIManager.getViewManagerConfig('CheckpointErrorHostForTest')
  ? requireNativeComponent<NativeProps>('CheckpointErrorHostForTest') : null;

export function ErrorPresentationHost({request, children, onClosed, onLog}: {
  request: HostedErrorRequest;
  children: (api: {respond: (action: ErrorAction) => void}) => ReactNode;
  onClosed: (requestId: string) => void;
  onLog: (message: string) => void;
}) {
  const {width, height} = useWindowDimensions();
  const responded = useRef(false);
  useEffect(() => () => {
    // Explicit prototype unmount policy. A normal response already consumed this ID.
    NativeModules.RNPaywalls.completeCheckpointErrorForTest(request.requestId, 'NAVIGATE_BACK');
  }, [request.requestId]);

  if (!NativeHost) throw new Error('Prototype native error host is not installed');
  const respond = (action: ErrorAction) => {
    if (responded.current) return;
    responded.current = true;
    onLog(`Host selection requestId=${request.requestId} action=${action}`);
    // Native owns dismissal sequencing and calls the original completion afterward.
    NativeModules.RNPaywalls.completeCheckpointErrorForTest(request.requestId, action);
  };

  return (
    <NativeHost requestId={request.requestId} style={{position: 'absolute', width, height}}
      onShow={() => onLog(`Host onShow requestId=${request.requestId}`)}
      onDismiss={event => {
        onLog(`Host onDismiss requestId=${event.nativeEvent.requestId}`);
        onClosed(event.nativeEvent.requestId);
      }}
      onFailure={event => onLog(`Host failure: ${event.nativeEvent.message}`)}>
      {children({respond})}
    </NativeHost>
  );
}
