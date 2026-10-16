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
  onDismiss: (event: HostEvent) => void;
  onFailure: (event: HostEvent) => void;
};
const NativeHost = Platform.OS === 'ios' && UIManager.getViewManagerConfig('CheckpointErrorHostForTest')
  ? requireNativeComponent<NativeProps>('CheckpointErrorHostForTest') : null;

export function ErrorPresentationHost({request, children, onClosed, onError}: {
  request: HostedErrorRequest;
  children: (api: {respond: (action: ErrorAction) => void}) => ReactNode;
  onClosed: (requestId: string) => void;
  onError: (message: string) => void;
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
    // Native owns dismissal sequencing and calls the original completion afterward.
    NativeModules.RNPaywalls.completeCheckpointErrorForTest(request.requestId, action);
  };

  return (
    <NativeHost requestId={request.requestId} style={{position: 'absolute', width, height}}
      onDismiss={event => {
        onClosed(event.nativeEvent.requestId);
      }}
      onFailure={event => onError(event.nativeEvent.message ?? 'Unable to present error content')}>
      {children({respond})}
    </NativeHost>
  );
}
