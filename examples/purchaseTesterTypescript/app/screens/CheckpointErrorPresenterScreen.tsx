// Prototype consumer. The native bridge methods are not public RevenueCat APIs.
import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Modal, NativeEventEmitter, NativeModules, Platform, ScrollView, Text, View} from 'react-native';
import Purchases from 'react-native-purchases';
import {ErrorPresentationHost} from './ErrorPresentationHost';

type ErrorAction = 'RETRY' | 'CONTINUE' | 'NAVIGATE_BACK';

type ErrorRequest = {
  requestId: string;
  canHost?: boolean;
  error: {message: string};
};
type ErrorUI = 'host' | 'alert' | 'modal' | 'overlay' | 'auto';
const native = NativeModules.RNPaywalls;
const actions: ErrorAction[] = ['RETRY', 'CONTINUE', 'NAVIGATE_BACK'];
const choices: {value: ErrorUI; label: string}[] = [
  ...(Platform.OS === 'ios' ? [{value: 'host' as const, label: 'Custom React host'}] : []),
  {value: 'alert', label: 'Alert'},
  {value: 'modal', label: 'React Native Modal'},
  {value: 'overlay', label: 'In-tree overlay'},
  {value: 'auto', label: 'Complete without UI'},
];
const identifier = 'rn_error_presenter_test';

function ErrorPanel({request, respond}: {request: ErrorRequest; respond: (action?: ErrorAction) => void}) {
  return (
    <View style={{flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008'}}>
      <View style={{padding: 24, backgroundColor: 'white', gap: 12}}>
        <Text>Purchase failed</Text>
        <Text>{request.error.message}</Text>
        {Platform.OS === 'ios'
          ? <Button title="Done" onPress={() => respond()} />
          : actions.map(action => <Button key={action} title={action} onPress={() => respond(action)} />)}
      </View>
    </View>
  );
}

export default function CheckpointErrorPresenterScreen() {
  const [ui, setUI] = useState<ErrorUI>(Platform.OS === 'ios' ? 'host' : 'alert');
  const uiRef = useRef(ui);
  uiRef.current = ui;
  const [requests, setRequests] = useState<ErrorRequest[]>([]);
  const [status, setStatus] = useState('Ready');
  const removeRequest = (requestId: string) => {
    setRequests(current => current.filter(item => item.requestId !== requestId));
  };
  const complete = (request: ErrorRequest, action: ErrorAction = 'NAVIGATE_BACK') => {
    removeRequest(request.requestId);
    if (Platform.OS === 'ios') native.completeCheckpointErrorForTest(request.requestId);
    else native.completeCheckpointErrorForTest(request.requestId, action);
  };

  useEffect(() => {
    const emitter = new NativeEventEmitter(native);
    const errorSubscription = emitter.addListener('checkpointErrorForTest', payload => {
      const request = payload as ErrorRequest;
      if (uiRef.current === 'auto') {
        complete(request, 'CONTINUE');
        return;
      }
      setRequests(current => [...current, request]);
      if (uiRef.current === 'alert' || (uiRef.current === 'host' && request.canHost === false)) {
        Alert.alert('Purchase failed', request.error.message,
          Platform.OS === 'ios' ? [{text: 'Done', onPress: () => complete(request)}]
            : actions.map(action => ({text: action, onPress: () => complete(request, action)})),
          {cancelable: false});
      }
    });
    const passedSubscription = emitter.addListener('checkpointPassedForTest', payload => {
      const result = payload as {obtainedEntitlementIdentifiers: string[] | null};
      const entitlements = result.obtainedEntitlementIdentifiers ?? [];
      setStatus(entitlements.length ? `Access granted: ${entitlements.join(', ')}` : 'Flow ended without granting access');
    });
    const cancelledSubscription = emitter.addListener('checkpointErrorCancelledForTest', payload => {
      const {requestId} = payload as {requestId: string};
      removeRequest(requestId);
    });
    return () => {
      errorSubscription.remove();
      passedSubscription.remove();
      cancelledSubscription.remove();
    };
  }, []);

  const start = (mode: 'sheet' | 'fullscreen') => {
    setStatus('Paywall opened');
    native.checkpointForTest(identifier, mode);
  };
  const request = requests[0];
  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={{padding: 16, gap: 10}}>
        <Text>Custom checkpoint errors</Text>
        <Text>Choose Test failed purchase in the Test Store purchase dialog.</Text>
        <Text>{status}</Text>
        <Button title="Fresh test customer" onPress={async () => {
          try {
            await Purchases.logIn(`rn-error-test-${Date.now()}`);
            setStatus('Fresh customer ready');
          } catch (error) {
            setStatus(String(error));
          }
        }} />
        {choices.map(({value, label}) =>
          <Button key={value} title={`${ui === value ? '✓ ' : ''}${label}`}
            onPress={() => setUI(value)} disabled={requests.length > 0} />)}
        <Button title="Open sheet" onPress={() => start('sheet')} />
        <Button title="Open fullscreen" onPress={() => start('fullscreen')} />
      </ScrollView>
      <Modal visible={ui === 'modal' && !!request} transparent animationType="none"
        onRequestClose={() => { if (request) complete(request, 'NAVIGATE_BACK'); }}>
        {request && <ErrorPanel request={request} respond={action => complete(request, action)} />}
      </Modal>
      {ui === 'host' && request && request.canHost !== false && (
        <ErrorPresentationHost key={request.requestId} request={request} onClosed={removeRequest} onError={setStatus}>
          {({complete}) => <ErrorPanel request={request} respond={complete} />}
        </ErrorPresentationHost>
      )}
      {ui === 'overlay' && request && (
        <View style={{position: 'absolute', inset: 0}}>
          <ErrorPanel request={request} respond={action => complete(request, action)} />
        </View>
      )}
    </View>
  );
}
